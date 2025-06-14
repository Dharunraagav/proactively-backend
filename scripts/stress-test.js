// Simple Node.js stress test for login endpoint
const https = require('https');
const http = require('http');

const BASE_URL = 'http://localhost:3000';
const CONCURRENT_USERS = 100;
const REQUESTS_PER_USER = 10;

// Test data
const testUsers = Array.from({ length: CONCURRENT_USERS }, (_, i) => ({
  email: `testuser${i}@example.com`,
  password: 'password123'
}));

// Performance metrics
let totalRequests = 0;
let successfulRequests = 0;
let failedRequests = 0;
let totalResponseTime = 0;
let startTime = Date.now();

function makeLoginRequest(user) {
  return new Promise((resolve) => {
    const requestStart = Date.now();
    const postData = JSON.stringify({
      email: user.email,
      password: user.password
    });

    const options = {
      hostname: 'localhost',
      port: 3000,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        const responseTime = Date.now() - requestStart;
        totalRequests++;
        totalResponseTime += responseTime;
        
        if (res.statusCode === 200) {
          successfulRequests++;
        } else {
          failedRequests++;
          console.log(`Failed request: ${res.statusCode} - ${data}`);
        }
        
        resolve({
          statusCode: res.statusCode,
          responseTime,
          data: data
        });
      });
    });

    req.on('error', (err) => {
      totalRequests++;
      failedRequests++;
      console.error('Request error:', err.message);
      resolve({
        statusCode: 0,
        responseTime: Date.now() - requestStart,
        error: err.message
      });
    });

    req.write(postData);
    req.end();
  });
}

async function runStressTest() {
  console.log(`Starting stress test with ${CONCURRENT_USERS} concurrent users`);
  console.log(`Each user will make ${REQUESTS_PER_USER} requests`);
  console.log(`Total requests: ${CONCURRENT_USERS * REQUESTS_PER_USER}`);
  console.log('---');

  const promises = [];

  // Create concurrent users
  for (let i = 0; i < CONCURRENT_USERS; i++) {
    const user = testUsers[i];
    
    // Each user makes multiple requests
    for (let j = 0; j < REQUESTS_PER_USER; j++) {
      promises.push(makeLoginRequest(user));
    }
  }

  // Wait for all requests to complete
  await Promise.all(promises);

  // Calculate and display results
  const totalTime = Date.now() - startTime;
  const avgResponseTime = totalResponseTime / totalRequests;
  const requestsPerSecond = (totalRequests / totalTime) * 1000;

  console.log('\n=== STRESS TEST RESULTS ===');
  console.log(`Total requests: ${totalRequests}`);
  console.log(`Successful requests: ${successfulRequests}`);
  console.log(`Failed requests: ${failedRequests}`);
  console.log(`Success rate: ${((successfulRequests / totalRequests) * 100).toFixed(2)}%`);
  console.log(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
  console.log(`Requests per second: ${requestsPerSecond.toFixed(2)}`);
  console.log(`Total test duration: ${totalTime}ms`);
  
  if (failedRequests > 0) {
    console.log(`\nFailure rate: ${((failedRequests / totalRequests) * 100).toFixed(2)}%`);
  }
}

// Run the test
runStressTest().catch(console.error);

import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  // Test configuration
  stages: [
    { duration: '30s', target: 50 },  // Ramp up to 50 users over 30 seconds
    { duration: '1m', target: 100 },  // Ramp up to 100 users over 1 minute
    { duration: '2m', target: 100 },  // Stay at 100 users for 2 minutes
    { duration: '30s', target: 0 },   // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<2000'], // 95% of requests should be below 2s
    http_req_failed: ['rate<0.01'],    // Less than 1% of requests should fail
  },
};

const BASE_URL = 'http://localhost:3000';

// Simulate user behavior
export default function () {
  const payload = JSON.stringify({
    email: `test${Math.floor(Math.random() * 100000)}@test.com`,
    password: 'password123',
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  // Login request
  const loginRes = http.post(`${BASE_URL}/api/auth/login`, payload, params);
  
  check(loginRes, {
    'login successful': (r) => r.status === 200,
    'response time < 2s': (r) => r.timings.duration < 2000,
  });

  sleep(1);
}

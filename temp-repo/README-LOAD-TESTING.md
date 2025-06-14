# Load Testing Guide for Login System

This guide explains how to test your login system's performance under heavy load.

## What We've Implemented

### 1. Rate Limiting
- **100 requests per 15 minutes per IP address**
- Prevents brute force attacks
- Returns 429 status code when limit exceeded

### 2. Session Management
- **Maximum 3 concurrent sessions per user**
- Prevents account sharing abuse
- Tracks active sessions using access tokens

### 3. Client-Side Protection
- **5 failed attempts trigger 15-minute lockout**
- Progressive error messages showing remaining attempts
- Automatic lockout timer display

## Running Load Tests

### Option 1: Simple Node.js Stress Test
```bash
# Run the built-in stress test
node scripts/stress-test.js
```

This will:
- Simulate 100 concurrent users
- Each user makes 10 login attempts
- Total: 1000 requests
- Shows success rate, response times, and requests per second

### Option 2: K6 Load Testing (Advanced)
First install K6:
```bash
# Windows (using Chocolatey)
choco install k6

# macOS (using Homebrew)
brew install k6

# Linux
sudo apt-get install k6
```

Then run:
```bash
k6 run scripts/load-test.js
```

## Expected Results

### Under Normal Load (< 100 requests/15min per IP):
- ✅ Success rate: ~95-100%
- ✅ Average response time: < 500ms
- ✅ Requests per second: 50-100+

### Under Heavy Load (> 100 requests/15min per IP):
- ⚠️ Rate limiting kicks in (429 errors)
- ⚠️ Success rate drops as expected
- ✅ Server remains stable

### Concurrent Session Testing:
- ✅ First 3 logins for same user: Success
- ⚠️ 4th+ login for same user: Rejected with session limit error

## Monitoring Performance

### Key Metrics to Watch:
1. **Response Time**: Should stay under 2 seconds
2. **Success Rate**: Should be high for legitimate traffic
3. **Error Handling**: Rate limits should activate properly
4. **Memory Usage**: Server should not leak memory
5. **Database Connections**: Should not exhaust connection pool

### Performance Benchmarks:
- **Good**: 95%+ success rate, <500ms avg response time
- **Acceptable**: 90%+ success rate, <1000ms avg response time
- **Poor**: <90% success rate, >2000ms avg response time

## Troubleshooting

### High Failure Rate:
1. Check if rate limiting is too aggressive
2. Verify database connection pool size
3. Monitor server CPU/memory usage

### Slow Response Times:
1. Check database query performance
2. Consider adding database indexes
3. Monitor network latency

### Session Limit Issues:
1. Verify session cleanup is working
2. Check if inactive sessions are being removed
3. Consider adjusting MAX_CONCURRENT_SESSIONS

## Production Recommendations

### For High Traffic:
1. **Increase rate limits** based on expected traffic
2. **Add Redis** for distributed rate limiting
3. **Use database connection pooling**
4. **Implement proper logging** for monitoring
5. **Add health checks** for load balancers

### Security Considerations:
1. **Monitor for suspicious patterns**
2. **Implement CAPTCHA** after multiple failures
3. **Add IP whitelisting** for admin accounts
4. **Log all authentication attempts**

## Testing Commands

```bash
# Test current setup
npm run dev

# In another terminal, run stress test
node scripts/stress-test.js

# Monitor the results and server logs
```

The system is now ready to handle concurrent logins with proper rate limiting and session management!

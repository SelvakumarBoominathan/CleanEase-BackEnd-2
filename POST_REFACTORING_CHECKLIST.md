# CleanEase Backend - Post-Refactoring Checklist

## ✅ Implementation Complete - Now Follow These Steps

### Phase 1: Installation & Configuration (15 minutes)

- [ ] Navigate to `CleanEase-BackEnd-2` directory
- [ ] Run `npm install` to install all dependencies
- [ ] Copy `.env.example` to `.env`
- [ ] Update `.env` with your values:
  - [ ] `ATLAS_URI` - MongoDB connection string
  - [ ] `JWT_SECRET` - Strong random secret (min 32 chars)
  - [ ] `EMAIL` - Gmail account for OTP
  - [ ] `PASSWORD` - Gmail app-specific password
  - [ ] `REDIS_URL` - Redis connection (or default to localhost)
  - [ ] `CORS_ORIGIN` - Your frontend URL

### Phase 2: Local Testing (30 minutes)

- [ ] Start MongoDB locally or use Atlas
- [ ] Start Redis locally
- [ ] Run `npm start` to start the server
- [ ] Check console for connection confirmations:
  - [ ] "✅ Database connected successfully"
  - [ ] "✅ Connected to Redis"
  - [ ] "🚀 Server running on http://localhost:8000"

### Phase 3: API Testing (30 minutes)

Use Postman/Thunder Client to test:

#### Authentication Flow

- [ ] POST `/api/register` - Create new user
- [ ] POST `/api/login` - Login user (get token)
- [ ] POST `/api/registermail` - Send OTP
- [ ] POST `/api/otpvalidation` - Verify OTP
- [ ] PATCH `/api/resetPassword` - Reset password

#### Employee Endpoints

- [ ] GET `/api/employees?page=1&limit=10` - Get employees with pagination
- [ ] GET `/api/employees/1` - Get single employee
- [ ] POST `/api/addemployee` (with auth) - Add employee
- [ ] PUT `/api/updateEmployee/1` (with auth) - Update employee
- [ ] DELETE `/api/deleteEmployee/1` (with auth) - Delete employee

#### Booking & Ratings

- [ ] POST `/api/rating` (with auth) - Add rating
- [ ] POST `/api/booking` (with auth) - Create booking
- [ ] GET `/api/Cartpage` (with auth) - Get user bookings
- [ ] DELETE `/api/removeBooking` (with auth) - Remove booking

#### Error Cases

- [ ] Test validation errors (invalid input)
- [ ] Test 401 errors (missing token)
- [ ] Test 429 errors (rate limiting)
- [ ] Test 404 errors (not found)

### Phase 4: Update Frontend (Important!)

The API response format has changed. Update your frontend calls:

**Before**:

```javascript
const response = await fetch('http://localhost:8000/api/login', {...});
console.log(response.msg);  // "Login Successful!"
```

**After**:

```javascript
const response = await fetch('http://localhost:8000/api/login', {...});
console.log(response.success);  // true
console.log(response.msg);      // "Login Successful!"
```

All responses now include a `success` boolean field.

### Phase 5: Security Verification (20 minutes)

- [ ] Test password validation:
  - [ ] Reject password < 8 chars
  - [ ] Reject password without uppercase
  - [ ] Reject password without lowercase
  - [ ] Reject password without numbers
  - [ ] Accept valid passwords

- [ ] Test rate limiting:
  - [ ] Make 5 login attempts in 15 minutes → blocked
  - [ ] Make 3 OTP requests in 10 minutes → blocked
  - [ ] Wait for window reset

- [ ] Test authentication:
  - [ ] Try `/api/addemployee` without token → 401
  - [ ] Try `/api/addemployee` with invalid token → 401
  - [ ] Try `/api/addemployee` with valid token → success

### Phase 6: Logging Verification (10 minutes)

- [ ] Check `logs/app.log` for all requests
- [ ] Check `logs/error.log` for errors
- [ ] Verify logs include:
  - [ ] Login attempts
  - [ ] OTP generation
  - [ ] Password resets
  - [ ] Database queries

### Phase 7: Database Verification (10 minutes)

- [ ] Check MongoDB collections:
  - [ ] `users` collection created
  - [ ] `employees` collection created
  - [ ] Indexes are created (check MongoDB Compass)

- [ ] Verify Redis keys:
  - [ ] `otp:*` keys with TTL
  - [ ] `reset-session:*` keys with TTL

### Phase 8: Environment Setup (Production Only)

When deploying to production:

- [ ] Set `NODE_ENV=production`
- [ ] Use strong `JWT_SECRET` (32+ random characters)
- [ ] Use production MongoDB URI
- [ ] Use production Redis (consider managed service)
- [ ] Increase `RATE_LIMIT_MAX_REQUESTS` if needed
- [ ] Add your production domain to `CORS_ORIGIN`
- [ ] Setup email with production Gmail account
- [ ] Enable HTTPS
- [ ] Setup monitoring/alerting

### Phase 9: Frontend Integration (1-2 hours)

Update your frontend to work with the new API:

#### Update API Calls

```javascript
// Example: Login endpoint
const response = await fetch("/api/login", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`, // Include for protected routes
  },
  body: JSON.stringify({ username, password }),
});

const data = await response.json();

if (data.success) {
  // Handle success
  localStorage.setItem("token", data.token);
} else {
  // Handle error
  console.error(data.message);
}
```

#### Update Validation

- Remove frontend-only validation
- Let backend validation handle errors
- Display error messages from API response

#### Update Error Handling

```javascript
if (!response.ok) {
  const error = await response.json();
  // error.message contains the error description
  // error.statusCode contains HTTP status
  console.error(error.message);
}
```

### Phase 10: Documentation Review

- [ ] Read `SETUP_GUIDE.md` for complete API documentation
- [ ] Read `REFACTORING_IMPLEMENTATION.md` for technical details
- [ ] Review `config.js` for configuration options
- [ ] Check `.env.example` for all available variables

---

## 🐛 Troubleshooting

### Error: "Missing required environment variables"

**Solution**: Make sure `.env` file exists and has all required variables from `.env.example`

### Error: "Cannot connect to Redis"

**Solution**:

```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# If not running, start Redis
redis-server
```

### Error: "Cannot connect to MongoDB"

**Solution**:

- Check ATLAS_URI format in `.env`
- Verify MongoDB connection string is correct
- Check IP whitelist in MongoDB Atlas

### Error: "Rate limit exceeded"

**Solution**: Wait for the rate limit window to reset (15 minutes for auth, 10 minutes for OTP)

### Error: "Invalid token"

**Solution**:

- Check if token is included in Authorization header
- Check if token has expired (24 hours)
- Login again to get a fresh token

### Logs not appearing

**Solution**:

- Check if `logs/` directory was created
- Verify file permissions
- Check `logs/error.log` for logging errors

---

## 📊 Performance Tuning

### Database Query Optimization

- Indexes are already created
- Use pagination to limit result size
- Monitor slow queries in MongoDB logs

### Rate Limiting Adjustment

If too restrictive, adjust in `.env`:

```env
RATE_LIMIT_WINDOW=1800000      # 30 minutes instead of 15
RATE_LIMIT_MAX_REQUESTS=200    # 200 requests instead of 100
```

### Redis Optimization

For high traffic, consider:

- Redis persistence (RDB, AOF)
- Redis cluster setup
- Dedicated Redis service

---

## 📈 Monitoring & Maintenance

### Daily Checks

- [ ] Check error logs for issues
- [ ] Monitor rate limiting stats
- [ ] Check Redis memory usage
- [ ] Monitor MongoDB query performance

### Weekly Checks

- [ ] Review user registrations
- [ ] Check failed login attempts
- [ ] Monitor application logs
- [ ] Verify backups are working

### Monthly Checks

- [ ] Rotate secrets (JWT_SECRET)
- [ ] Review security logs
- [ ] Update dependencies
- [ ] Analyze performance metrics

---

## 🚀 Optional Enhancements

Once the basic refactoring is working:

### 1. Add Unit Tests (1-2 days)

```bash
npm install --save-dev jest supertest
```

### 2. Add TypeScript (2-3 days)

```bash
npm install --save-dev typescript ts-node
```

### 3. Add API Documentation (1 day)

```bash
npm install swagger-ui-express swagger-jsdoc
```

### 4. Setup CI/CD (1 day)

- GitHub Actions
- Automated testing
- Auto-deployment

### 5. Add Monitoring (1 day)

- Sentry for error tracking
- New Relic for performance
- DataDog for monitoring

---

## 📋 Success Criteria

You'll know the refactoring is successful when:

✅ Server starts without errors
✅ All endpoints respond correctly
✅ Rate limiting works
✅ Validation rejects invalid input
✅ Authentication works correctly
✅ Logs are created and updated
✅ Database queries complete successfully
✅ Frontend can communicate with backend
✅ Error messages are helpful
✅ No console errors in server logs

---

## 💡 Key Takeaways

1. **Always validate input** - Joi schemas prevent bad data
2. **Use proper authentication** - JWT tokens protect endpoints
3. **Log important events** - Helps with debugging
4. **Rate limit sensitive endpoints** - Prevents abuse
5. **Handle errors gracefully** - Users need clear messages
6. **Optimize database queries** - Indexes improve performance
7. **Keep secrets in .env** - Never hardcode secrets
8. **Use service layer** - Separates business logic
9. **Test thoroughly** - Especially before production
10. **Monitor production** - Catch issues early

---

## 📞 Support Resources

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [JWT Introduction](https://jwt.io/)
- [Joi Validation](https://joi.dev/)
- [Winston Logging](https://github.com/winstonjs/winston)

---

## ✨ Final Notes

The refactored backend is production-ready with:

- ✅ Professional error handling
- ✅ Comprehensive validation
- ✅ Secure authentication
- ✅ Rate limiting protection
- ✅ Detailed logging
- ✅ Optimized database

**Next Step**: Follow Phase 1 and start testing! 🚀

---

**Last Updated**: February 7, 2026

# CleanEase Backend - Setup & Usage Guide

## 📋 Prerequisites

Before running the CleanEase backend, ensure you have the following installed:

- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas URI)
- **Redis** (local or remote instance)
- **npm** or **yarn**

---

## 🚀 Quick Start

### 1. Clone the Repository

```bash
cd CleanEase-BackEnd-2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Copy the `.env.example` file to `.env` and update the values:

```bash
cp .env.example .env
```

**Important Environment Variables** (in `.env`):

```env
# Server
NODE_ENV=development
PORT=8000
BASE_URL=http://localhost:8000

# Database
ATLAS_URI=mongodb://your-connection-string

# JWT
JWT_SECRET=your-super-secret-key-change-this
JWT_EXPIRY=24h
OTP_EXPIRY=300

# Email (Gmail SMTP)
EMAIL=your-email@gmail.com
PASSWORD=your-app-specific-password
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587

# Redis
REDIS_URL=redis://localhost:6379

# CORS
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com

# Rate Limiting
RATE_LIMIT_WINDOW=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start MongoDB & Redis

**MongoDB**:

```bash
# If using local MongoDB
mongod

# Or if using MongoDB Atlas, just ensure ATLAS_URI is set correctly
```

**Redis**:

```bash
# If using local Redis
redis-server
```

### 5. Start the Server

```bash
npm start
```

You should see:

```
🚀 Server running on http://localhost:8000
📦 Environment: development
✅ Database connected successfully
✅ Connected to Redis
```

---

## 🔐 API Authentication

All protected endpoints require a JWT token in the request header:

```
Authorization: Bearer <token>
```

### Example:

```javascript
fetch("http://localhost:8000/api/employees", {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});
```

---

## 📡 API Endpoints

### Authentication Endpoints

#### 1. Register User

```http
POST /api/register
Content-Type: application/json

{
  "name": "John Doe",
  "username": "johndoe",
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "msg": "User registered successfully.",
  "username": "johndoe"
}
```

#### 2. Login User

```http
POST /api/login
Content-Type: application/json

{
  "username": "johndoe",
  "password": "SecurePass123"
}

Response:
{
  "success": true,
  "msg": "Login Successful!",
  "username": "johndoe",
  "token": "eyJhbGciOiJIUzI1NiIs..."
}
```

#### 3. Send OTP

```http
POST /api/registermail
Content-Type: application/json

{
  "email": "john@example.com",
  "userId": "user-id-or-email"
}

Response:
{
  "success": true,
  "user": "johndoe",
  "msg": "Mail Sent Successfully!",
  "info": "message-id"
}
```

#### 4. Verify OTP

```http
POST /api/otpvalidation
Content-Type: application/json

{
  "userId": "user-id-or-email",
  "otp": "123456"
}

Response:
{
  "success": true,
  "msg": "OTP verified!"
}
```

#### 5. Reset Password

```http
PATCH /api/resetPassword
Content-Type: application/json

{
  "username": "johndoe",
  "password": "NewSecurePass123",
  "userId": "user-id-or-email"
}

Response:
{
  "success": true,
  "msg": "Password updated successfully!"
}
```

### Employee Endpoints

#### 1. Get All Employees (with Pagination)

```http
GET /api/employees?page=1&limit=10

Response:
{
  "success": true,
  "employees": [...],
  "pagination": {
    "currentPage": 1,
    "totalPages": 5,
    "totalCount": 50,
    "limit": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

#### 2. Get Single Employee

```http
GET /api/employees/1

Response:
{
  "success": true,
  "employee": {
    "_id": "...",
    "id": 1,
    "name": "John Service Provider",
    "category": "Cleaning",
    "city": "New York",
    "price": 50,
    "rating": { "average": 4.5, "count": 10 },
    ...
  }
}
```

#### 3. Add Employee (Requires Auth)

```http
POST /api/addemployee
Authorization: Bearer <token>
Content-Type: application/json

{
  "image": "https://example.com/image.jpg",
  "name": "Jane Cleaner",
  "category": "Cleaning",
  "city": "Los Angeles",
  "id": 101,
  "price": 60
}

Response:
{
  "success": true,
  "employee": {...}
}
```

#### 4. Update Employee (Requires Auth)

```http
PUT /api/updateEmployee/1
Authorization: Bearer <token>
Content-Type: application/json

{
  "price": 70,
  "rating": { "average": 4.8, "count": 15 }
}

Response:
{
  "success": true,
  "employee": {...}
}
```

#### 5. Delete Employee (Requires Auth)

```http
DELETE /api/deleteEmployee/1
Authorization: Bearer <token>

Response:
{
  "success": true,
  "message": "Employee deleted successfully"
}
```

### Rating/Review Endpoints

#### 1. Add Rating (Requires Auth)

```http
POST /api/rating
Authorization: Bearer <token>
Content-Type: application/json

{
  "empID": "1",
  "username": "johndoe",
  "rating": 4.5,
  "reviewtext": "Excellent service! Highly recommended."
}

Response:
{
  "success": true,
  "employee": {...}
}
```

### Booking Endpoints

#### 1. Create Booking (Requires Auth)

```http
POST /api/booking
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "1",
  "username": "johndoe",
  "date": "2024-02-15T10:00:00Z",
  "time": "10:00 AM"
}

Response:
{
  "success": true,
  "message": "Booking created successfully!"
}
```

#### 2. Get User Bookings (Requires Auth)

```http
GET /api/Cartpage
Authorization: Bearer <token>

Response:
{
  "success": true,
  "bookings": [
    {
      "_id": "...",
      "employeeName": "Jane Cleaner",
      "employeeImage": "...",
      "city": "Los Angeles",
      "date": "2024-02-15T10:00:00Z",
      "time": "10:00 AM",
      "bookedBy": "johndoe"
    }
  ]
}
```

#### 3. Remove Booking (Requires Auth)

```http
DELETE /api/removeBooking
Authorization: Bearer <token>
Content-Type: application/json

{
  "bookingId": "booking-id"
}

Response:
{
  "success": true,
  "message": "Booking removed successfully!"
}
```

---

## ⚠️ Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description"
}
```

### Common Error Codes

| Status | Meaning                                 |
| ------ | --------------------------------------- |
| 400    | Bad Request - Validation failed         |
| 401    | Unauthorized - Missing or invalid token |
| 404    | Not Found - Resource doesn't exist      |
| 409    | Conflict - Resource already exists      |
| 429    | Too Many Requests - Rate limit exceeded |
| 500    | Internal Server Error                   |

---

## 🔒 Rate Limiting

The API implements rate limiting on sensitive endpoints:

| Endpoint                          | Limit        | Window     |
| --------------------------------- | ------------ | ---------- |
| `/register`, `/login`             | 5 requests   | 15 minutes |
| `/registermail`, `/otpvalidation` | 3 requests   | 10 minutes |
| `/resetPassword`                  | 3 requests   | 1 hour     |
| General API                       | 100 requests | 15 minutes |

---

## 📝 Password Requirements

- Minimum 8 characters
- Maximum 128 characters
- Must contain at least one uppercase letter
- Must contain at least one lowercase letter
- Must contain at least one digit

Example: `SecurePass123`

---

## 🧪 Testing with Thunder Client/Postman

1. **Create Environment Variables**:
   - `baseUrl`: `http://localhost:8000/api`
   - `token`: (set after login)

2. **Test Login**:

   ```
   POST {{baseUrl}}/login
   {
     "username": "testuser",
     "password": "TestPass123"
   }
   ```

3. **Save Token**:
   Copy the returned token and set it as the `token` variable.

4. **Test Protected Endpoint**:
   ```
   GET {{baseUrl}}/employees
   Authorization: Bearer {{token}}
   ```

---

## 📊 Database Structure

### User Collection

```javascript
{
  _id: ObjectId,
  name: String,
  username: String (unique),
  email: String (unique),
  password: String (hashed),
  bookings: Array,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Employee Collection

```javascript
{
  _id: ObjectId,
  image: String,
  name: String,
  category: String,
  city: String,
  id: Number (unique),
  price: Number,
  rating: {
    average: Number,
    count: Number
  },
  review: Array,
  bookings: Array,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🐛 Troubleshooting

### Issue: Redis Connection Error

**Solution**: Ensure Redis is running:

```bash
# Check if Redis is running
redis-cli ping  # Should return PONG

# If not running, start Redis:
redis-server
```

### Issue: MongoDB Connection Error

**Solution**: Check `ATLAS_URI` in `.env`:

```bash
# Format should be:
# mongodb+srv://user:password@cluster.mongodb.net/dbname?retryWrites=true
```

### Issue: Rate Limit Errors

**Solution**: Wait for the window to reset or increase `RATE_LIMIT_MAX_REQUESTS` in `.env`

### Issue: Invalid Token

**Solution**:

- Ensure token is being sent in Authorization header
- Check if token has expired (expires in 24 hours)
- Login again to get a new token

---

## 📚 Logging

Logs are stored in the `logs/` directory:

- **app.log**: All application logs
- **error.log**: Error logs only

View logs in real-time:

```bash
tail -f logs/app.log
```

---

## 🔧 Development Commands

```bash
# Start server with auto-reload (using nodemon)
npm start

# Run without nodemon
node server.js

# Check for linting errors (if ESLint is configured)
npm run lint
```

---

## 📦 Project Structure

```
CleanEase-BackEnd-2/
├── config.js                 # Configuration and env validation
├── server.js                 # Express app initialization
├── package.json              # Dependencies
├── .env.example              # Environment variables template
├── controllers/
│   └── appcontroller.js      # Route handlers
├── models/
│   ├── userModel.js          # User schema
│   └── employeeModel.js      # Employee schema
├── services/
│   ├── userService.js        # User business logic
│   └── employeeService.js    # Employee business logic
├── middleware/
│   ├── auth.js               # OTP generation
│   ├── errorHandler.js       # Error handling
│   ├── logger.js             # Winston logger
│   ├── jwtMiddleware.js      # JWT authentication
│   ├── rateLimiter.js        # Rate limiting
│   ├── validation.js         # Joi validation
│   └── redisClient.js        # Redis connection
├── router/
│   └── route.js              # API routes
├── utils/
│   └── validators.js         # Validation utilities
├── database/
│   └── connection.js         # MongoDB connection
└── logs/
    ├── app.log               # Application logs
    └── error.log             # Error logs
```

---

## 🚀 Deployment

### Environment Configuration for Production

Update `.env` for production:

```env
NODE_ENV=production
JWT_SECRET=generate-a-strong-random-secret
CORS_ORIGIN=https://yourdomain.com
RATE_LIMIT_MAX_REQUESTS=50
```

### Deploy to Heroku

```bash
git push heroku main
```

### Deploy to AWS/DigitalOcean

1. Set up MongoDB Atlas
2. Set up Redis (e.g., using Redis Cloud)
3. Set environment variables on server
4. Run `npm install` and `npm start`

---

## 📞 Support

For issues or questions, check:

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Redis Documentation](https://redis.io/documentation)
- [Express.js Guide](https://expressjs.com/)
- [JWT Introduction](https://jwt.io/introduction)

---

## 📄 License

ISC License - See package.json

---

**Last Updated**: February 7, 2026

# Forgot Password & Reset Password Feature

## Overview
Complete password reset feature with token-based verification, email notifications, and password strength meter.

## Flow Diagram
```
1. User on Login Page → Clicks "Forgot Password?"
2. Goes to forgot-password.html
3. Enters email and clicks "Send Reset Link"
4. Backend (POST /api/auth/forgot-password):
   - Checks if user exists
   - Generates secure reset token
   - Sets token expiration (1 hour)
   - Sends reset link via email
5. User receives email with reset link containing token
6. User clicks link → Goes to reset-password.html?token=XXX&email=user@email.com
7. Token is verified (POST /api/auth/verify-reset-token)
8. User enters new password
9. Form submits (POST /api/auth/reset-password):
   - Verifies token is valid and not expired
   - Hashes new password
   - Clears reset token from DB
   - Shows success message
   - Redirects to login
10. User logs in with new password
```

## Files Modified/Created

### Backend Files:
1. **models/User.js** - Added fields:
   - `resetPasswordToken` - Stores hashed reset token
   - `resetPasswordExpires` - Token expiration time

2. **routes/authRoutes.js** - Added 3 new endpoints:
   - `POST /api/auth/forgot-password` - Initiates password reset
   - `POST /api/auth/reset-password` - Completes password reset
   - `POST /api/auth/verify-reset-token` - Validates token before reset

### Frontend Files:
1. **public/login.html** - Updated:
   - Added "Forgot Password?" link

2. **public/forgot-password.html** - New file
   - Email input form
   - Error/success messages
   - Links to login page

3. **public/reset-password.html** - New file
   - Email, password, confirm password inputs
   - Password strength meter
   - Token verification on page load
   - Success notification with auto-redirect

## API Endpoints

### 1. Forgot Password (Initiate Reset)
**POST** `/api/auth/forgot-password`

**Request:**
```json
{
  "email": "user@example.com"
}
```

**Response (Success):**
```json
{
  "message": "Password reset link sent to your email",
  "email": "user@example.com"
}
```

**Response (Error):**
```json
{
  "message": "No user found with this email"
}
```

---

### 2. Verify Reset Token
**POST** `/api/auth/verify-reset-token`

**Request:**
```json
{
  "token": "abc123def456...",
  "email": "user@example.com"
}
```

**Response (Valid):**
```json
{
  "message": "Token is valid",
  "valid": true
}
```

**Response (Invalid):**
```json
{
  "message": "Invalid or expired token",
  "valid": false
}
```

---

### 3. Reset Password (Complete Reset)
**POST** `/api/auth/reset-password`

**Request:**
```json
{
  "token": "abc123def456...",
  "email": "user@example.com",
  "password": "newPassword123",
  "confirmPassword": "newPassword123"
}
```

**Response (Success):**
```json
{
  "message": "Password reset successfully! Please login with your new password.",
  "success": true
}
```

**Response (Error):**
```json
{
  "message": "Invalid or expired reset token"
}
```

## Email Setup Instructions

### Using Nodemailer (Recommended)

1. **Install Nodemailer:**
```bash
npm install nodemailer
```

2. **Update routes/authRoutes.js** - Replace the `sendPasswordResetEmail` function:

```javascript
const nodemailer = require('nodemailer');

// Configure your email service
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

// Updated email function
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Campus Connect Lite',
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset for your Campus Connect Lite account.</p>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}" style="
        display: inline-block;
        padding: 10px 20px;
        background-color: #667eea;
        color: white;
        text-decoration: none;
        border-radius: 5px;
        margin: 20px 0;
      ">Reset Password</a>
      <p>Or copy this link: <br/>${resetLink}</p>
      <p><strong>This link will expire in 1 hour.</strong></p>
      <p>If you didn't request this reset, please ignore this email.</p>
    `
  };
  
  return transporter.sendMail(mailOptions);
};
```

3. **Update .env file:**
```
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=http://localhost:3000
```

### Environment Variables Setup

Add to your `.env` file:

```
# Email Configuration
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-specific-password
EMAIL_SERVICE=gmail

# Frontend URL (for email links)
CLIENT_URL=http://localhost:3000 # or your production URL
```

**Note:** For Gmail:
1. Enable 2-Factor Authentication
2. Generate an "App Password" at https://myaccount.google.com/apppasswords
3. Use the App Password in EMAIL_PASSWORD

## Features

### ✅ Security Features
- **Token-based verification**: Generates secure, cryptographically random tokens
- **Token expiration**: Reset links expire after 1 hour
- **Secure token storage**: Tokens are hashed in the database
- **Email verification**: Ensures user has access to their registered email
- **Password hashing**: Uses bcrypt to hash new passwords

### ✅ User Experience Features
- **Real-time password strength meter**: Shows password strength as user types
- **Form validation**: Checks for matching passwords and minimum length
- **Auto-redirect**: After successful reset, automatically redirects to login
- **Clear messaging**: Success and error messages for all operations
- **Beautiful UI**: Matches existing design with animations and gradients

### ✅ Error Handling
- Non-existent emails handled gracefully
- Expired tokens detected and reported
- Invalid token format rejected
- Password mismatch prevention

## Testing the Feature

### Test Scenario 1: Successful Password Reset

1. Navigate to login page
2. Click "Forgot Password?"
3. Enter your registered email
4. Click "Send Reset Link"
5. Check console output (in development) for reset link, or email inbox
6. Click the reset link
7. Enter new password (with password strength indicator)
8. Confirm password
9. Click "Reset Password"
10. See success message and auto-redirect to login
11. Login with new password

### Test Scenario 2: Invalid Token
1. Manually modify the token in the URL
2. See error message: "Invalid or expired token"

### Test Scenario 3: Expired Token
1. Wait more than 1 hour after requesting reset
2. Try to use the link
3. See error message about expired token

### Test Scenario 4: Different Email & Token Combination
1. Get a valid reset link for user A
2. Try to use it with user B's email
3. See error message

## Database Queries

The feature uses these MongoDB operations:

```javascript
// Find user and update with reset token
await User.findOneAndUpdate(
  { email },
  {
    resetPasswordToken: hashedToken,
    resetPasswordExpires: expirationTime
  }
);

// Find user by token (for verification)
await User.findOne({
  email,
  resetPasswordToken: hashedToken,
  resetPasswordExpires: { $gt: Date.now() }
});

// Clear reset token after successful reset
await User.findByIdAndUpdate(
  userId,
  {
    password: newHashedPassword,
    resetPasswordToken: null,
    resetPasswordExpires: null
  }
);
```

## Notification System Integration

After successful password reset, you can trigger a notification:

```javascript
// Add to reset-password endpoint after successful update
const Notification = require('../models/Notification');

await Notification.create({
  userId: user._id,
  type: 'password_reset_success',
  title: 'Password Updated',
  message: 'Your password has been successfully reset.',
  read: false
});
```

## Troubleshooting

### Email not sending?
- Check EMAIL_USER and EMAIL_PASSWORD in .env
- Enable "Less secure app access" if using Gmail (or use App Password)
- Check firewall/network settings
- Review application logs for errors

### Token always invalid?
- Ensure crypto module is properly imported
- Check if token hashing is consistent (in both directions)
- Verify resetPasswordExpires is set correctly

### Password strength meter not working?
- Clear browser cache
- Check browser console for JavaScript errors
- Ensure reset-password.html is fully loaded

### User not receiving email?
- Check spam/junk folder
- Verify email address is correct in database
- Check SMTP credentials
- Review nodemailer configuration

## Future Enhancements

1. **Multi-factor authentication** - Add OTP verification
2. **Email templates** - Create HTML email templates
3. **Password reset history** - Track when passwords were reset
4. **Suspicious activity alerts** - Notify user of password reset attempts
5. **Mobile app integration** - Deep links for mobile app reset
6. **Password expiration policy** - Force password changes periodically
7. **Recovery codes** - Generate backup codes for account recovery

## Notes

- Token expires in **1 hour** (configurable in authRoutes.js)
- Passwords must be at least **6 characters** (configurable)
- Reset tokens are stored as SHA256 hashes for security
- Email sending is currently logged to console in development mode
- All endpoints have proper error handling and validation

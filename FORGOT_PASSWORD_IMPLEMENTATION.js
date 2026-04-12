// ============================================================================
// QUICK IMPLEMENTATION GUIDE - FORGOT PASSWORD FEATURE
// ============================================================================

/**
 * STEP 1: Installation
 * Run in terminal: npm install nodemailer
 */

/**
 * STEP 2: Environment Variables (.env)
 * Add these to your .env file:
 * 
 * EMAIL_USER=your-email@gmail.com
 * EMAIL_PASSWORD=your-app-password
 * CLIENT_URL=http://localhost:3000
 * 
 * For Gmail:
 * 1. Go to: https://myaccount.google.com/apppasswords
 * 2. Generate an App Password
 * 3. Use this password in EMAIL_PASSWORD
 */

/**
 * STEP 3: Update sendPasswordResetEmail function
 * Location: routes/authRoutes.js
 * 
 * Replace the sendPasswordResetEmail function with:
 */

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
  
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Password Reset Request - Campus Connect Lite',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px;">
        <h2 style="color: #667eea;">Password Reset Request</h2>
        <p>You requested a password reset for your Campus Connect Lite account.</p>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="
          display: inline-block;
          padding: 12px 30px;
          background-color: #667eea;
          color: white;
          text-decoration: none;
          border-radius: 5px;
          margin: 20px 0;
          font-weight: bold;
        ">Reset Password</a>
        <p>Or copy and paste this link in your browser:</p>
        <p style="word-break: break-all; color: #666;">${resetLink}</p>
        <hr style="border: none; border-top: 1px solid #ddd; margin: 20px 0;">
        <p><strong>Important:</strong> This link will expire in 1 hour.</p>
        <p>If you didn't request this password reset, please ignore this email or contact support.</p>
        <p style="color: #999; font-size: 0.9em; margin-top: 30px;">
          Campus Connect Lite - Event Management System
        </p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
  return resetLink;
};

/**
 * STEP 4: Testing in Development
 * 
 * Option A: Using Ethereal Email (Free testing service)
 * 1. Go to: https://ethereal.email/register
 * 2. Create a test account
 * 3. Use credentials in .env
 * 4. Check email at: https://ethereal.email
 * 
 * Option B: Using Console Logging (Current default)
 * - Reset link is logged to console
 * - Check browser console or terminal output
 */

/**
 * STEP 5: User Flow Summary
 * 
 * LOGIN PAGE (/login.html)
 *   ↓
 *   Click "Forgot Password?" link
 *   ↓
 * FORGOT PASSWORD PAGE (/forgot-password.html)
 *   ↓
 *   Enter email → POST /api/auth/forgot-password
 *   ↓
 *   Email sent with reset link
 *   ↓
 * USER RECEIVES EMAIL
 *   ↓
 *   Click reset link
 *   ↓
 * RESET PASSWORD PAGE (/reset-password.html?token=XXX&email=user@email.com)
 *   ↓
 *   POST /api/auth/verify-reset-token (auto validation)
 *   ↓
 *   User enters new password
 *   ↓
 *   POST /api/auth/reset-password
 *   ↓
 * SUCCESS PAGE (Auto redirects to login after 3 seconds)
 *   ↓
 * LOGIN PAGE - User logs in with new password
 */

/**
 * STEP 6: Notification System (Optional)
 * 
 * After successful password reset, send notification:
 */

// Add this to the reset-password endpoint after successful update:
const Notification = require('../models/Notification');

await Notification.create({
  userId: user._id,
  type: 'password_reset_success',
  title: '🔐 Password Updated Successfully',
  message: 'Your password has been successfully reset. If you did not do this, contact support immediately.',
  read: false,
  createdAt: new Date()
});

/**
 * STEP 7: Security Checklist
 * 
 * ✅ Tokens expire after 1 hour
 * ✅ Tokens are hashed before storage
 * ✅ Passwords are hashed with bcrypt
 * ✅ Email validation is performed
 * ✅ Token verification happens before reset
 * ✅ Old reset tokens are cleared after successful reset
 * ✅ Passwords must be 6+ characters
 * ✅ Rate limiting can be added for security
 */

/**
 * STEP 8: Testing the Implementation
 * 
 * Command line test (using curl):
 */

// Test 1: Request password reset
// curl -X POST http://localhost:5000/api/auth/forgot-password \
//   -H "Content-Type: application/json" \
//   -d '{"email":"user@example.com"}'

// Test 2: Verify reset token
// curl -X POST http://localhost:5000/api/auth/verify-reset-token \
//   -H "Content-Type: application/json" \
//   -d '{"token":"abc123","email":"user@example.com"}'

// Test 3: Reset password
// curl -X POST http://localhost:5000/api/auth/reset-password \
//   -H "Content-Type: application/json" \
//   -d '{
//     "token":"abc123",
//     "email":"user@example.com",
//     "password":"newPassword123",
//     "confirmPassword":"newPassword123"
//   }'

/**
 * STEP 9: Production Deployment
 * 
 * Before deploying to production:
 * 1. Set CLIENT_URL to your production domain
 * 2. Use production email service (Gmail, SendGrid, AWS SES, etc.)
 * 3. Enable HTTPS
 * 4. Add rate limiting to password reset endpoints
 * 5. Add CSRF protection
 * 6. Monitor password reset attempts
 * 7. Log all password reset events for security
 * 8. Consider adding 2FA for additional security
 */

/**
 * STEP 10: Common Issues & Solutions
 * 
 * Issue: "Invalid email service"
 * Solution: Check EMAIL_USER and EMAIL_PASSWORD in .env
 * 
 * Issue: "Cannot send email"
 * Solution: Enable 2FA and use App Password, not regular password
 * 
 * Issue: "Token always invalid"
 * Solution: Check that token hashing is consistent
 * 
 * Issue: "Link expires too quickly"
 * Solution: Token expires in 1 hour (line 340 in authRoutes.js)
 */

/**
 * STEP 11: Frontend Integration
 * 
 * Files already created:
 * - public/forgot-password.html (request reset form)
 * - public/reset-password.html (form with token verification)
 * - public/login.html (updated with "Forgot Password?" link)
 * 
 * API integration in frontend:
 * - Uses fetchAPI() from js/api.js
 * - Handles success/error messages
 * - Shows password strength meter
 * - Auto-redirects after successful reset
 */

/**
 * ============================================================================
 * FEATURE IS NOW READY FOR USE!
 * ============================================================================
 * 
 * The following endpoints are available:
 * 
 * 1. POST /api/auth/forgot-password
 *    - Initiates password reset
 *    - Sends email with reset link
 * 
 * 2. POST /api/auth/verify-reset-token
 *    - Validates reset token
 *    - Checks if token is not expired
 * 
 * 3. POST /api/auth/reset-password
 *    - Updates user password
 *    - Clears reset token
 *    - Returns success message
 */

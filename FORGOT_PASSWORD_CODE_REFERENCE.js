// ============================================================================
// FORGOT PASSWORD FEATURE - QUICK CODE REFERENCE
// ============================================================================

/**
 * ============================================================================
 * COMPLETE API ENDPOINT CODE (Copy-Paste Ready)
 * Location: routes/authRoutes.js
 * ============================================================================
 */

// At the top of file, add crypto import:
const crypto = require('crypto');

// Email sending function (basic version - logs to console):
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
  console.log(`Password Reset Link: ${resetLink}`);
  return resetLink;
};

// Endpoint 1: Request password reset
router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ message: 'Please provide a valid email' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'No user found with this email' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    await user.save();

    await sendPasswordResetEmail(email, resetToken);

    res.status(200).json({ 
      message: 'Password reset link sent to your email',
      email: email
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error sending password reset email' });
  }
});

// Endpoint 2: Reset password
router.post('/reset-password', async (req, res) => {
  try {
    const { token, email, password, confirmPassword } = req.body;

    if (!token || !email || !password || !confirmPassword) {
      return res.status(400).json({ message: 'Please provide all required fields' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    res.status(200).json({ 
      message: 'Password reset successfully! Please login with your new password.',
      success: true 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

// Endpoint 3: Verify token
router.post('/verify-reset-token', async (req, res) => {
  try {
    const { token, email } = req.body;

    if (!token || !email) {
      return res.status(400).json({ message: 'Token and email are required', valid: false });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token', valid: false });
    }

    res.status(200).json({ message: 'Token is valid', valid: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error verifying token', valid: false });
  }
});

/**
 * ============================================================================
 * FRONTEND CODE SNIPPETS
 * ============================================================================
 */

// Forgot Password Form Submission (from forgot-password.html)
document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('email').value;
  const messageContainer = document.getElementById('messageContainer');

  try {
    const data = await fetchAPI('/auth/forgot-password', 'POST', { email });

    messageContainer.innerHTML = `
      <div class="alert alert-success">
        âœ“ Password reset link sent to <strong>${email}</strong>
      </div>
    `;
  } catch (error) {
    messageContainer.innerHTML = `
      <div class="alert alert-error">
        âœ— ${error.message}
      </div>
    `;
  }
});

// Password Reset Form Submission (from reset-password.html)
document.getElementById('resetPasswordForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const confirmPassword = document.getElementById('confirmPassword').value;

  if (password !== confirmPassword) {
    alert('Passwords do not match');
    return;
  }

  try {
    const data = await fetchAPI('/auth/reset-password', 'POST', {
      token: resetToken,
      email,
      password,
      confirmPassword
    });

    // Show success and redirect
    setTimeout(() => {
      window.location.href = 'login.html';
    }, 3000);
  } catch (error) {
    alert('Error: ' + error.message);
  }
});

// Password Strength Meter (from reset-password.html)
document.getElementById('password').addEventListener('input', (e) => {
  const password = e.target.value;
  const strengthBar = document.getElementById('strengthBar');
  const strengthText = document.getElementById('strengthText');

  let strength = 0;
  if (password.length >= 6) strength += 1;
  if (password.length >= 10) strength += 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 1;
  if (/[0-9]/.test(password)) strength += 1;
  if (/[^a-zA-Z0-9]/.test(password)) strength += 1;

  strengthBar.className = 'password-strength-bar';

  if (strength <= 1) {
    strengthBar.classList.add('strength-weak');
    strengthText.textContent = 'Password strength: Very Weak';
  } else if (strength <= 3) {
    strengthBar.classList.add('strength-medium');
    strengthText.textContent = 'Password strength: Medium';
  } else {
    strengthBar.classList.add('strength-strong');
    strengthText.textContent = 'Password strength: Strong';
  }
});

/**
 * ============================================================================
 * CURL TESTING COMMANDS
 * ============================================================================
 */

// 1. Request password reset:
// curl -X POST https://connectcamp.onrender.com/api/auth/forgot-password \
//   -H "Content-Type: application/json" \
//   -d '{"email":"test@example.com"}'

// 2. Verify token:
// curl -X POST https://connectcamp.onrender.com/api/auth/verify-reset-token \
//   -H "Content-Type: application/json" \
//   -d '{"token":"YOUR_TOKEN_HERE","email":"test@example.com"}'

// 3. Reset password:
// curl -X POST https://connectcamp.onrender.com/api/auth/reset-password \
//   -H "Content-Type: application/json" \
//   -d '{\
//     "token":"YOUR_TOKEN_HERE",\
//     "email":"test@example.com",\
//     "password":"newPassword123",\
//     "confirmPassword":"newPassword123"\
//   }'

/**
 * ============================================================================
 * NOTIFICATION CODE SNIPPET
 * ============================================================================
 */

// Add after successful password reset (in reset-password endpoint):
try {
  const Notification = require('../models/Notification');
  await Notification.create({
    userId: user._id,
    type: 'password_reset_success',
    title: 'ðŸ” Password Updated Successfully',
    message: 'Your password has been successfully reset.',
    read: false
  });
} catch (err) {
  console.error('Notification error:', err);
}

/**
 * ============================================================================
 * EMAIL SETUP CODE (With Nodemailer)
 * ============================================================================
 */

// 1. Install: npm install nodemailer
// 2. Update sendPasswordResetEmail function:

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
      <h2>Password Reset Request</h2>
      <p>Click the link below to reset your password:</p>
      <a href="${resetLink}">Reset Password</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `
  };
  
  await transporter.sendMail(mailOptions);
};

/**
 * ============================================================================
 * USER MODEL UPDATE
 * ============================================================================
 */

// Add to models/User.js schema:
resetPasswordToken: {
  type: String,
  default: null
},
resetPasswordExpires: {
  type: Date,
  default: null
}

/**
 * ============================================================================
 * ENVIRONMENT VARIABLES (.env)
 * ============================================================================
 */

// For testing (console logs):
CLIENT_URL=http://localhost:3000

// For production (Gmail):
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
CLIENT_URL=https://yourdomain.com

// For production (SendGrid):
SENDGRID_API_KEY=your_sendgrid_key
CLIENT_URL=https://yourdomain.com

/**
 * ============================================================================
 * STATUS CODES & RESPONSES
 * ============================================================================
 */

// Success Responses:
// 200 - General success
// 201 - Created successfully

// Error Responses:
// 400 - Bad request (validation error)
// 404 - Not found (user doesn't exist)
// 500 - Server error

// Response Examples:

// SUCCESS - Forgot Password:
{
  "message": "Password reset link sent to your email",
  "email": "user@example.com"
}

// SUCCESS - Reset Password:
{
  "message": "Password reset successfully! Please login with your new password.",
  "success": true
}

// SUCCESS - Verify Token:
{
  "message": "Token is valid",
  "valid": true
}

// ERROR - User not found:
{
  "message": "No user found with this email"
}

// ERROR - Invalid token:
{
  "message": "Invalid or expired reset token"
}

// ERROR - Passwords don't match:
{
  "message": "Passwords do not match"
}

/**
 * ============================================================================
 * COMMON MISTAKES TO AVOID
 * ============================================================================
 */

// âŒ DON'T: Store plain reset token in database
// const user = await User.findOne({ resetPasswordToken: token });

// âœ… DO: Hash token before comparison
// const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
// const user = await User.findOne({ resetPasswordToken: hashedToken });

// âŒ DON'T: Send reset token directly in response
// res.json({ token, resetLink });

// âœ… DO: Only send success message, include token in URL only
// res.json({ message: 'Success' });

// âŒ DON'T: Set expiration too long or too short
// DON'T: 5 minutes (too short for slow email)
// DON'T: 24 hours (security risk)

// âœ… DO: Use 1 hour (industry standard)
// user.resetPasswordExpires = Date.now() + 60 * 60 * 1000;

// âŒ DON'T: Allow weak passwords
// if (password.length > 0) { ...

// âœ… DO: Enforce strong password requirements
// if (password.length < 6) { throw error; }

/**
 * ============================================================================
 * QUICK CHECKLIST BEFORE TESTING
 * ============================================================================
 */

// âœ… Routes added to authRoutes.js
// âœ… Crypto module imported
// âœ… User model updated with reset fields
// âœ… forgot-password.html created
// âœ… reset-password.html created
// âœ… login.html has "Forgot Password?" link
// âœ… Server restarted
// âœ… Database connected
// âœ… No syntax errors in console

/**
 * ============================================================================
 * FILE STRUCTURE
 * ============================================================================
 */

// routes/authRoutes.js
//   â”œâ”€â”€ POST /api/auth/forgot-password
//   â”œâ”€â”€ POST /api/auth/reset-password
//   â””â”€â”€ POST /api/auth/verify-reset-token

// models/User.js
//   â”œâ”€â”€ resetPasswordToken
//   â””â”€â”€ resetPasswordExpires

// public/
//   â”œâ”€â”€ login.html (updated - has link)
//   â”œâ”€â”€ forgot-password.html (NEW)
//   â””â”€â”€ reset-password.html (NEW)

// Documentation/
//   â”œâ”€â”€ README_FORGOT_PASSWORD.md
//   â”œâ”€â”€ FORGOT_PASSWORD_FEATURE.md
//   â”œâ”€â”€ FORGOT_PASSWORD_QUICK_TEST.md
//   â”œâ”€â”€ FORGOT_PASSWORD_IMPLEMENTATION.js
//   â”œâ”€â”€ FORGOT_PASSWORD_NOTIFICATIONS.js
//   â””â”€â”€ This file

/**
 * ============================================================================
 * PRODUCTION DEPLOYMENT CHECKLIST
 * ============================================================================
 */

// Before deploying:
// âœ… Set JWT_SECRET in .env (different from development)
// âœ… Set CLIENT_URL to production domain
// âœ… Set up email service (Gmail, SendGrid, AWS SES)
// âœ… Enable HTTPS (required for security)
// âœ… Add rate limiting to password reset endpoints
// âœ… Add CSRF protection if needed
// âœ… Test with real email service
// âœ… Set NODE_ENV=production
// âœ… Monitor password reset attempts
// âœ… Review security logs

/**
 * ============================================================================
 * THAT'S IT! Ready to use!
 * ============================================================================
 */


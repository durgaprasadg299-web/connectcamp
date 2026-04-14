// ============================================================================
// PASSWORD RESET WITH NOTIFICATION SYSTEM
// Add this code to routes/authRoutes.js to implement notifications
// ============================================================================

/**
 * After successful password reset, send a notification to the user
 * This assumes you have a Notification model already created
 */

// Add this import at the top of authRoutes.js (after other imports):
// const Notification = require('../models/Notification');

/**
 * OPTION 1: Add to existing reset-password endpoint
 * 
 * Replace this section in the reset-password endpoint:
 */

// OLD CODE:
// user.resetPasswordToken = null;
// user.resetPasswordExpires = null;
// await user.save();
// 
// res.status(200).json({ 
//     message: 'Password reset successfully! Please login with your new password.',
//     success: true 
// });

// NEW CODE with notification:

user.resetPasswordToken = null;
user.resetPasswordExpires = null;
await user.save();

// Send notification to user
try {
  const Notification = require('../models/Notification');
  
  await Notification.create({
    userId: user._id,
    type: 'password_reset_success',
    title: 'ðŸ” Password Updated Successfully',
    message: 'Your password has been successfully reset.',
    read: false,
    createdAt: new Date()
  });
} catch (notificationError) {
  console.error('Error creating notification:', notificationError);
  // Don't fail the password reset if notification fails
}

res.status(200).json({ 
  message: 'Password reset successfully! Please login with your new password.',
  success: true 
});

/**
 * OPTION 2: Advanced notification with more details
 */

// Comprehensive notification with device/IP info:

const notificationMessage = {
  userId: user._id,
  type: 'password_reset_success',
  category: 'security',
  priority: 'high',
  title: 'ðŸ” Password Changed',
  message: 'Your password was successfully changed. If this wasn\'t you, contact support immediately.',
  details: {
    action: 'password_reset',
    timestamp: new Date(),
    ipAddress: req.ip || 'unknown',
    userAgent: req.get('user-agent') || 'unknown'
  },
  actionButtons: [
    {
      text: 'Secure Account',
      url: '/dashboard/security' // Optional action
    }
  ],
  read: false
};

try {
  const Notification = require('../models/Notification');
  await Notification.create(notificationMessage);
} catch (error) {
  console.error('Notification error:', error);
}

/**
 * OPTION 3: Email + In-app notification
 */

const sendNotification = async (userId, title, message) => {
  try {
    const Notification = require('../models/Notification');
    await Notification.create({
      userId,
      type: 'security_alert',
      title,
      message,
      read: false
    });
  } catch (error) {
    console.error('Failed to create notification:', error);
  }
};

// Usage:
sendNotification(
  user._id,
  'âœ… Password Reset Complete',
  'Your password has been updated successfully. You can now log in with your new password.'
);

/**
 * OPTION 4: Notification with email confirmation
 */

const sendPasswordResetNotification = async (user) => {
  const Notification = require('../models/Notification');
  
  // Create in-app notification
  await Notification.create({
    userId: user._id,
    type: 'password_reset_success',
    title: 'ðŸ” Password Updated',
    message: 'Your password has been successfully reset.',
    read: false
  });
  
  // Optional: Send email confirmation
  // await sendEmail({
  //   to: user.email,
  //   subject: 'Password Changed Successfully',
  //   template: 'password-reset-confirmation'
  // });
  
  // Optional: Log the event for audit trail
  console.log(`[SECURITY] Password reset for user ${user._id} at ${new Date()}`);
};

/**
 * COMPLETE UPDATED ROUTE with Notifications
 * 
 * Replace the entire reset-password endpoint with this:
 */

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

    // Hash the token to compare with stored token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user by email and verify reset token
    const user = await User.findOne({
      email,
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(password, salt);

    // Clear reset token fields
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // ============ NEW: Send notification ============
    try {
      const Notification = require('../models/Notification');
      
      await Notification.create({
        userId: user._id,
        type: 'password_reset_success',
        title: 'ðŸ” Password Updated Successfully',
        message: 'Your password has been successfully reset. If you did not do this, please contact support immediately.',
        read: false,
        createdAt: new Date(),
        metadata: {
          timestamp: new Date().toISOString(),
          action: 'password_reset'
        }
      });
    } catch (notificationError) {
      // Don't fail the password reset if notification fails
      console.error('Error creating notification:', notificationError);
    }
    // ============ END: Send notification ============

    res.status(200).json({ 
      message: 'Password reset successfully! Please login with your new password.',
      success: true 
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error resetting password' });
  }
});

/**
 * TEMPLATE: Sample Notification Model (if you need to create it)
 * 
 * Location: models/Notification.js
 */

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    enum: ['password_reset_success', 'security_alert', 'event_reminder', 'registration_update'],
    default: 'notification'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  actionUrl: {
    type: String // Optional URL for the notification to link to
  },
  metadata: {
    type: Object // Store additional data like IP, device, etc.
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  expiresAt: {
    type: Date,
    default: () => new Date(+new Date() + 30*24*60*60*1000) // 30 days from now
  }
});

/**
 * RETRIEVAL: Endpoint to get notifications
 * 
 * Add to notificationRoutes.js:
 */

router.get('/', protect, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50);
    
    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notifications' });
  }
});

/**
 * MARK AS READ: Mark notification as read
 * 
 * Add to notificationRoutes.js:
 */

router.put('/:id/read', protect, async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { read: true },
      { new: true }
    );
    
    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: 'Error updating notification' });
  }
});

/**
 * USAGE IN FRONTEND: Display notifications
 * 
 * Add to your dashboard:
 */

// Fetch notifications on page load
async function loadNotifications() {
  try {
    const data = await fetchAPI('/notifications', 'GET');
    
    // Filter for password reset notifications
    const resetNotifications = data.filter(n => n.type === 'password_reset_success');
    
    // Display them in a toast or banner
    if (resetNotifications.length > 0) {
      showNotificationBanner(resetNotifications[0]);
    }
  } catch (error) {
    console.error('Error loading notifications:', error);
  }
}

// Example banner display
function showNotificationBanner(notification) {
  const banner = document.createElement('div');
  banner.className = 'notification-banner success';
  banner.innerHTML = `
    <div class="notification-content">
      <h4>${notification.title}</h4>
      <p>${notification.message}</p>
    </div>
    <button class="close-btn" onclick="this.parentElement.style.display='none'">Ã—</button>
  `;
  document.body.insertBefore(banner, document.body.firstChild);
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    banner.style.display = 'none';
  }, 5000);
}

/**
 * ADVANCED: Security audit trail
 * 
 * Log all password reset attempts:
 */

const auditLog = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  action: String, // 'password_reset_requested', 'password_reset_completed'
  status: String, // 'success', 'failed'
  reason: String, // Error reason if failed
  ipAddress: String,
  timestamp: { type: Date, default: Date.now }
});

// In forgot-password endpoint:
if (process.env.ENABLE_AUDIT_LOG === 'true') {
  AuditLog.create({
    userId: user._id,
    action: 'password_reset_requested',
    status: 'success',
    ipAddress: req.ip,
    timestamp: new Date()
  });
}

/**
 * ============================================================================
 * SUMMARY: What this file shows
 * 
 * âœ… How to add notifications to password reset
 * âœ… Different notification options (simple, comprehensive, with audit)
 * âœ… Notification model schema
 * âœ… API endpoints for retrieving notifications
 * âœ… Frontend integration example
 * âœ… Audit trail logging
 * 
 * Choose the option that best fits your needs!
 * ============================================================================
 */



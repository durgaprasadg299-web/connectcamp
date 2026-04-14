const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Email validation function
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Send Reset Email Function
const sendPasswordResetEmail = async (email, resetToken) => {
    // In production, use nodemailer to send actual emails
    // For now, log the reset link
    const resetLink = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}&email=${email}`;
    console.log(`Password Reset Link: ${resetLink}`);
    
    // TODO: Implement actual email sending with nodemailer
    return resetLink;
};

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
router.post('/signup', async (req, res) => {
    const { name, email, password, role, college, description } = req.body;

    if (!name || !email || !password || !college) {
        return res.status(400).json({ message: 'Please add all fields' });
    }

    if (!isValidEmail(email)) {
        return res.status(400).json({ message: 'Please enter a valid email address' });
    }

    if (password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters long' });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    let isVerified = role === 'club' ? false : true;

    // Check Club Passkey
    if (role === 'club' && req.body.clubCode === 'ADMIN123') {
        isVerified = true;
    }

    try {
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'student', // default to student
            college,
            description: description || '',
            verified: isVerified // Clubs need verification unless code is provided
        });

        if (user) {
            res.status(201).json({
                _id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                college: user.college,
                branch: user.branch,
                year: user.year,
                verified: user.verified,
                token: generateToken(user._id),
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(err => err.message);
            res.status(400).json({ message: messages[0] });
        } else if (error.code === 11000) {
            res.status(400).json({ message: 'Email already exists' });
        } else {
            res.status(500).json({ message: 'Server Error' });
        }
    }
});

// @desc    Authenticate a user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    // Check for user email
    const user = await User.findOne({ email });

    if (user && (await bcrypt.compare(password, user.password))) {
        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            college: user.college,
            branch: user.branch,
            year: user.year,
            verified: user.verified,
            token: generateToken(user._id),
        });
    } else {
        res.status(400).json({ message: 'Invalid credentials' });
    }
});

// @desc    Get user data
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
    res.status(200).json(req.user);
});

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
router.put('/profile', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        if (user) {
            user.name = req.body.name || user.name;
            user.college = req.body.college || user.college;
            user.branch = req.body.branch || user.branch;
            user.year = req.body.year || user.year;

            if (req.body.password) {
                const salt = await bcrypt.genSalt(10);
                user.password = await bcrypt.hash(req.body.password, salt);
            }

            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                college: updatedUser.college,
                branch: updatedUser.branch,
                year: updatedUser.year,
                token: generateToken(updatedUser._id),
            });
        } else {
            res.status(404).json({ message: 'User not found' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
});

// @desc    Forgot Password - Send reset email
// @route   POST /api/auth/forgot-password
// @access  Public
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || !isValidEmail(email)) {
            return res.status(400).json({ message: 'Please provide a valid email' });
        }

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'No user found with this email' });
        }

        // Generate reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

        // Set reset token and expiration (1 hour)
        user.resetPasswordToken = hashedToken;
        user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
        await user.save();

        // Send email with reset link
        await sendPasswordResetEmail(email, resetToken);

        res.status(200).json({ 
            message: 'Password reset link sent to your email',
            email: email // For testing/demo purposes
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error sending password reset email' });
    }
});

// @desc    Reset Password - Verify token and update password
// @route   POST /api/auth/reset-password
// @access  Public
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

        res.status(200).json({ 
            message: 'Password reset successfully! Please login with your new password.',
            success: true 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error resetting password' });
    }
});

// @desc    Verify Reset Token
// @route   POST /api/auth/verify-reset-token
// @access  Public
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

module.exports = router;


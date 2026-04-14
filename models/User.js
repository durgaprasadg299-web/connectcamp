const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Please provide a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    role: {
        type: String,
        enum: ['student', 'club', 'admin'],
        default: 'student'
    },
    college: {
        type: String,
        required: [true, 'Please add your college name']
    },
    // For Admin & Students
    branch: {
        type: String,
        default: null
    },
    year: {
        type: String,
        enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'N/A', 'Administrative'],
        default: 'N/A'
    },
    // For Clubs
    description: {
        type: String
    },
    verified: {
        type: Boolean,
        default: false
    },
    // Password Reset Fields
    resetPasswordToken: {
        type: String,
        default: null
    },
    resetPasswordExpires: {
        type: Date,
        default: null
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('User', userSchema);


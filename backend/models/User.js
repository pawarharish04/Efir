const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['citizen', 'officer', 'admin'],
        default: 'citizen',
    },
    phone: {
        type: String,
        required: true,
    },
    badgeId: {
        type: String,
        unique: true,
        sparse: true, // Allows null/undefined values to be non-unique
    },
    // Feature 2: Officer Verification
    isApproved: {
        type: Boolean,
        default: false, // Officers must be approved by Admin
    },
    department: {
        type: String, // e.g., "Cyber Cell", "Traffic"
    },
    designation: {
        type: String,
        enum: ['officer', 'supervisor'],
        default: 'officer',
    },
    station: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Station',
        default: null,
    }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

const mongoose = require('mongoose');

const firSchema = new mongoose.Schema({
    complainant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        // Complainant is required ONLY if it is NOT an anonymous report
        required: function () { return !this.isAnonymous; }
    },
    isAnonymous: {
        type: Boolean,
        default: false
    },
    anonymousRefId: {
        type: String, // A unique code (e.g., "WB-12345") for anonymous users to check status
    },
    accusedName: {
        type: String,
    },
    incidentType: {
        type: String,
        required: true,
        enum: ['Theft', 'Assault', 'Fraud', 'Cybercrime', 'Lost Property', 'Other'],
    },
    description: {
        type: String,
        required: true,
    },
    evidence: [{
        type: String // URLs or paths to uploaded files
    }],
    dateOfIncident: {
        type: Date,
        required: true,
    },
    timeOfIncident: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    pincode: {
        type: String,
        required: true,
    },
    latitude: {
        type: Number,
    },
    longitude: {
        type: Number,
    },
    status: {
        type: String,
        enum: ['Pending', 'Accepted', 'In Progress', 'Resolved', 'Rejected'],
        default: 'Pending',
    },
    assignedOfficer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    // Feature 1: Investigation Logs (Case Diary)
    investigationLogs: [{
        entry: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
        officerName: String
    }],
    // Feature 5: Communication Channel
    messages: [{
        senderModel: { type: String, enum: ['User', 'System'], default: 'User' },
        sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Can be Officer or Complainant
        senderName: String,
        message: { type: String, required: true },
        role: { type: String, enum: ['officer', 'citizen', 'admin'] },
        timestamp: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

module.exports = mongoose.model('FIR', firSchema);

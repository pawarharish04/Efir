const mongoose = require('mongoose');
const crypto = require('crypto');

const auditLogSchema = new mongoose.Schema({
    // Target Resource Info
    firId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FIR',
        required: true,
        index: true
    },
    // Action Type (VIEW_FIR, DOWNLOAD_PDF, VIEW_EVIDENCE, DOWNLOAD_EVIDENCE, UPDATE_STATUS, ADD_DIARY_LOG, ASSIGN_OFFICER)
    action: {
        type: String,
        required: true,
        enum: [
            'VIEW_FIR',
            'DOWNLOAD_PDF',
            'VIEW_EVIDENCE',
            'DOWNLOAD_EVIDENCE',
            'UPDATE_STATUS',
            'ADD_DIARY_LOG',
            'ASSIGN_OFFICER',
            'SEND_MESSAGE'
        ],
        index: true
    },
    // Resource details (e.g. filename, status changed, etc.)
    resourceType: {
        type: String,
        enum: ['FIR_RECORD', 'EVIDENCE_FILE', 'CASE_DIARY', 'LEGAL_PDF', 'MESSAGE'],
        default: 'FIR_RECORD'
    },
    resourceTarget: {
        type: String // File name, evidence path, or target identifier
    },
    metadata: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    // Officer / User Info
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    userName: {
        type: String,
        required: true
    },
    userRole: {
        type: String,
        required: true
    },
    badgeId: {
        type: String
    },
    // Network & Environment Telemetry
    ipAddress: {
        type: String,
        required: true
    },
    userAgent: {
        type: String
    },
    timestamp: {
        type: Date,
        default: Date.now,
        immutable: true,
        index: true
    },
    // Cryptographic Chain of Custody / Integrity Hash
    previousHash: {
        type: String,
        default: '0000000000000000000000000000000000000000000000000000000000000000'
    },
    recordHash: {
        type: String,
        immutable: true
    }
}, {
    timestamps: false,
    versionKey: false
});

// Calculate SHA-256 integrity hash before saving
auditLogSchema.pre('save', async function (next) {
    // If not already set, fetch latest log to chain
    if (!this.recordHash) {
        const lastLog = await this.constructor.findOne().sort({ _id: -1 }).select('recordHash');
        if (lastLog && lastLog.recordHash) {
            this.previousHash = lastLog.recordHash;
        }

        const payload = JSON.stringify({
            firId: this.firId ? this.firId.toString() : '',
            action: this.action,
            resourceType: this.resourceType,
            resourceTarget: this.resourceTarget || '',
            userId: this.userId ? this.userId.toString() : '',
            badgeId: this.badgeId || '',
            ipAddress: this.ipAddress,
            timestamp: this.timestamp.toISOString(),
            previousHash: this.previousHash,
            metadata: this.metadata || {}
        });

        this.recordHash = crypto.createHash('sha256').update(payload).digest('hex');
    }
    next();
});

// Guard: prevent update and deletion on the model to guarantee immutability
auditLogSchema.pre(['updateOne', 'updateMany', 'findOneAndUpdate', 'findByIdAndUpdate', 'replaceOne'], function() {
    throw new Error('IMMUTABLE_AUDIT_LOG_ERROR: Audit logs cannot be modified once written.');
});

auditLogSchema.pre(['deleteOne', 'deleteMany', 'findOneAndDelete', 'findByIdAndDelete'], function() {
    throw new Error('IMMUTABLE_AUDIT_LOG_ERROR: Audit logs cannot be deleted.');
});

module.exports = mongoose.model('AuditLog', auditLogSchema);
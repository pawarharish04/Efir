const FIR = require('../models/FIR');
const User = require('../models/User');
const Station = require('../models/Station');
const { matchStation } = require('../utils/stationMatcher');
const { sendStatusUpdateEmail, sendOfficerAssignmentEmail } = require('../utils/emailService');
const { cleanupFiles } = require('../middlewares/uploadMiddleware');
const crypto = require('crypto');
const path = require('path');
const mongoose = require('mongoose');

const createFIR = async (req, res, next) => {
    try {
        const {
            incidentType,
            description,
            dateOfIncident,
            timeOfIncident,
            address,
            city,
            state,
            pincode,
            accusedName,
            latitude,
            longitude,
        } = req.body;

        // Handle File Uploads with normalized relative web paths
        let evidencePaths = [];
        if (req.files && req.files.length > 0) {
            evidencePaths = req.files.map(file => 'uploads/' + path.basename(file.filename || file.path));
        }

        // Auto-assign jurisdiction station
        const { station: matchedStation, unmatched } = await matchStation(pincode, latitude, longitude);

        const newFIR = new FIR({
            complainant: req.user._id,
            incidentType,
            description,
            dateOfIncident,
            timeOfIncident,
            address,
            city,
            state,
            pincode,
            accusedName,
            latitude,
            longitude,
            evidence: evidencePaths,
            station: matchedStation ? matchedStation._id : null,
            stationUnmatched: unmatched,
        });

        await newFIR.save();

        // Populate complainant info for real-time update
        const populatedFIR = await FIR.findById(newFIR._id)
            .populate('complainant', 'name email phone')
            .populate('station', 'name city state');

        if (req.io) {
            req.io.emit('firCreated', populatedFIR);
        }

        res.status(201).json({ success: true, message: 'FIR submitted successfully', fir: populatedFIR });
    } catch (error) {
        // Clean up uploaded files if FIR creation fails
        if (req.files && req.files.length > 0) {
            cleanupFiles(req.files);
        }
        next(error);
    }
};

const createAnonymousFIR = async (req, res, next) => {
    try {
        const {
            incidentType,
            description,
            dateOfIncident,
            timeOfIncident,
            address,
            city,
            state,
            pincode,
            accusedName,
            latitude,
            longitude,
        } = req.body;

        // Handle File Uploads with normalized relative web paths
        let evidencePaths = [];
        if (req.files && req.files.length > 0) {
            evidencePaths = req.files.map(file => 'uploads/' + path.basename(file.filename || file.path));
        }

        // Auto-assign jurisdiction station
        const { station: matchedStation, unmatched } = await matchStation(pincode, latitude, longitude);

        // Generate a random Reference ID for tracking
        const anonymousRefId = crypto.randomBytes(4).toString('hex').toUpperCase();

        const newFIR = new FIR({
            isAnonymous: true,
            anonymousRefId: anonymousRefId,
            incidentType,
            description,
            dateOfIncident,
            timeOfIncident,
            address,
            city,
            state,
            pincode,
            accusedName,
            latitude,
            longitude,
            evidence: evidencePaths,
            station: matchedStation ? matchedStation._id : null,
            stationUnmatched: unmatched,
        });

        await newFIR.save();

        if (req.io) {
            req.io.emit('firCreated', newFIR);
        }

        res.status(201).json({
            success: true,
            message: 'Anonymous Report submitted successfully',
            fir: newFIR,
            trackingId: anonymousRefId
        });
    } catch (error) {
        // Clean up uploaded files if anonymous submission fails
        if (req.files && req.files.length > 0) {
            cleanupFiles(req.files);
        }
        next(error);
    }
};

const getUserFIRs = async (req, res, next) => {
    try {
        const firs = await FIR.find({ complainant: req.user._id })
            .populate('assignedOfficer', 'name badgeId department designation')
            .populate('station', 'name city state')
            .sort({ createdAt: -1 });
        res.status(200).json({ success: true, firs });
    } catch (error) {
        next(error);
    }
};

const getAnonymousFIRStatus = async (req, res, next) => {
    try {
        const { trackingId } = req.body;
        const fir = await FIR.findOne({ anonymousRefId: trackingId })
            .populate('assignedOfficer', 'name badgeId department designation');

        if (!fir) {
            return res.status(404).json({ success: false, message: 'Invalid Tracking ID' });
        }

        res.status(200).json({ success: true, fir });
    } catch (error) {
        next(error);
    }
}

const getAllFIRs = async (req, res, next) => {
    try {
        const { city, state, type, status, station: stationFilter } = req.query;
        let query = {};

        if (city) query.city = { $regex: city, $options: 'i' };
        if (state) query.state = { $regex: state, $options: 'i' };
        if (type) query.incidentType = type;
        if (status) query.status = status;

        // Jurisdiction scoping:
        // Officers are restricted to FIRs belonging to their assigned station.
        // Admins see all FIRs but can optionally filter by a specific station.
        if (req.user.role === 'officer' && req.user.station) {
            query.station = req.user.station;
        } else if (req.user.role === 'admin' && stationFilter) {
            query.station = stationFilter;
        }

        const firs = await FIR.find(query)
            .populate('complainant', 'name email phone')
            .populate('assignedOfficer', 'name email badgeId department designation')
            .populate('station', 'name city state')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, firs });
    } catch (error) {
        next(error);
    }
};

const updateFIRStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const fir = await FIR.findById(id);
        if (!fir) {
            return res.status(404).json({ success: false, message: 'FIR not found' });
        }

        // Lock down: Only assigned officer, supervisor, or admin can update status
        const isAssignedOfficer = fir.assignedOfficer && fir.assignedOfficer.toString() === req.user._id.toString();
        const isSupervisorOrAdmin = req.user.role === 'admin' || req.user.designation === 'supervisor';

        if (!isAssignedOfficer && !isSupervisorOrAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Only the assigned officer, supervisor, or administrator can update this case status'
            });
        }

        fir.status = status;
        await fir.save();

        const populatedFIR = await FIR.findById(fir._id)
            .populate('complainant')
            .populate('assignedOfficer', 'name email badgeId department designation');

        if (req.io) {
            req.io.emit('firUpdated', populatedFIR);
        }

        // Send Email Notification if complainant exists (not anonymous)
        if (populatedFIR.complainant && populatedFIR.complainant.email) {
            sendStatusUpdateEmail(
                populatedFIR.complainant.email,
                populatedFIR.complainant.name,
                populatedFIR._id.toString(),
                status
            );
        }

        res.status(200).json({ success: true, message: 'FIR status updated', fir: populatedFIR });
    } catch (error) {
        next(error);
    }
};

const getAnalytics = async (req, res, next) => {
    try {
        const totalFIRs = await FIR.countDocuments();
        const pendingFIRs = await FIR.countDocuments({ status: 'Pending' });
        const resolvedFIRs = await FIR.countDocuments({ status: 'Resolved' });

        // Aggregation for charts
        const firsByCity = await FIR.aggregate([
            { $group: { _id: "$city", count: { $sum: 1 } } }
        ]);

        const firsByType = await FIR.aggregate([
            { $group: { _id: "$incidentType", count: { $sum: 1 } } }
        ]);

        res.status(200).json({
            success: true,
            stats: {
                total: totalFIRs,
                pending: pendingFIRs,
                resolved: resolvedFIRs,
                byCity: firsByCity,
                byType: firsByType
            },
            statusDistribution: {
                pending: pendingFIRs,
                accepted: await FIR.countDocuments({ status: 'Accepted' }),
                resolved: resolvedFIRs,
                inProgress: await FIR.countDocuments({ status: 'In Progress' }),
                rejected: await FIR.countDocuments({ status: 'Rejected' })
            },
            locations: await FIR.find({}, 'latitude longitude incidentType description').lean()
        });

    } catch (error) {
        next(error);
    }
}

const addInvestigationLog = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { entry } = req.body;

        if (!entry || typeof entry !== 'string' || !entry.trim()) {
            return res.status(400).json({ success: false, message: 'Log entry is required' });
        }

        const fir = await FIR.findById(id);
        if (!fir) {
            return res.status(404).json({ success: false, message: 'FIR not found' });
        }

        // Lock down: Only assigned officer, supervisor, or admin can add logs
        const isAssignedOfficer = fir.assignedOfficer && fir.assignedOfficer.toString() === req.user._id.toString();
        const isSupervisorOrAdmin = req.user.role === 'admin' || req.user.designation === 'supervisor';

        if (!isAssignedOfficer && !isSupervisorOrAdmin) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Only the assigned officer, supervisor, or administrator can add investigation logs to this case'
            });
        }

        const newLog = {
            entry: entry.trim(),
            officerName: req.user.name,
            timestamp: new Date()
        };

        fir.investigationLogs.push(newLog);
        await fir.save();

        res.status(200).json({ success: true, message: 'Log added', log: newLog });
    } catch (error) {
        next(error);
    }
};

const addMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return res.status(400).json({ success: false, message: 'Message content is required' });
        }

        const fir = await FIR.findById(id);
        if (!fir) {
            return res.status(404).json({ success: false, message: 'FIR not found' });
        }

        // Ownership Verification: Must be complainant, assigned officer, or admin
        const isComplainant = fir.complainant && fir.complainant.toString() === req.user._id.toString();
        const isOfficerOrAdmin = ['officer', 'admin'].includes(req.user.role);

        if (!isComplainant && !isOfficerOrAdmin) {
            return res.status(403).json({ success: false, message: 'Access denied: You are not authorized to post messages on this FIR' });
        }

        const newMessage = {
            senderModel: 'User',
            sender: req.user._id, // User ID (Officer or Citizen)
            senderName: req.user.name,
            role: req.user.role,
            message: message.trim(),
            timestamp: new Date()
        };

        fir.messages.push(newMessage);
        await fir.save();

        // Notify via socket if applicable
        if (req.io) {
            req.io.to(id).emit('newMessage', newMessage); // Assuming rooms based on FIR ID, or generic broadcast
        }

        res.status(200).json({ success: true, message: 'Message sent', messageData: newMessage });
    } catch (error) {
        next(error);
    }
};

const assignFIR = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { officerId } = req.body;

        // Only admin or supervisor can call assignFIR
        const isAuthorized = req.user.role === 'admin' || req.user.designation === 'supervisor';
        if (!isAuthorized) {
            return res.status(403).json({
                success: false,
                message: 'Access denied: Only administrators or supervisors can assign cases'
            });
        }

        // Basic input validation
        if (!officerId) {
            return res.status(400).json({ success: false, message: 'Officer ID is required' });
        }

        if (!mongoose.Types.ObjectId.isValid(officerId)) {
            return res.status(400).json({ success: false, message: 'Invalid Officer ID format' });
        }

        const targetOfficer = await User.findOne({ _id: officerId, role: 'officer', isApproved: true });
        if (!targetOfficer) {
            return res.status(400).json({
                success: false,
                message: 'Selected user is not an approved police officer'
            });
        }

        const fir = await FIR.findById(id);
        if (!fir) {
            return res.status(404).json({ success: false, message: 'FIR not found' });
        }

        fir.assignedOfficer = targetOfficer._id;
        if (fir.status === 'Pending') {
            fir.status = 'Accepted';
        }

        const logEntry = `Case assigned to Officer ${targetOfficer.name} (Badge: ${targetOfficer.badgeId || 'N/A'}) by ${req.user.name} (${req.user.designation === 'supervisor' ? 'Supervisor' : 'Admin'})`;
        fir.investigationLogs.push({
            entry: logEntry,
            officerName: req.user.name,
            timestamp: new Date()
        });

        await fir.save();

        const populatedFIR = await FIR.findById(fir._id)
            .populate('complainant', 'name email phone')
            .populate('assignedOfficer', 'name email badgeId department designation');

        if (req.io) {
            req.io.emit('firUpdated', populatedFIR);
        }

        if (targetOfficer.email) {
            sendOfficerAssignmentEmail(
                targetOfficer.email,
                targetOfficer.name,
                fir._id.toString(),
                req.user.name
            );
        }

        res.status(200).json({
            success: true,
            message: `FIR successfully assigned to Officer ${targetOfficer.name}`,
            fir: populatedFIR
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createFIR,
    createAnonymousFIR,
    getUserFIRs,
    getAnonymousFIRStatus,
    getAllFIRs,
    updateFIRStatus,
    getAnalytics,
    addInvestigationLog,
    addMessage,
    assignFIR
};

const FIR = require('../models/FIR');
const { sendStatusUpdateEmail } = require('../utils/emailService');
const crypto = require('crypto');

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

        // Handle File Uploads
        let evidencePaths = [];
        if (req.files && req.files.length > 0) {
            evidencePaths = req.files.map(file => file.path);
        }

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
            evidence: evidencePaths
        });

        await newFIR.save();

        // Populate complainant info for real-time update
        const populatedFIR = await FIR.findById(newFIR._id).populate('complainant', 'name email phone');

        if (req.io) {
            req.io.emit('firCreated', populatedFIR);
        }

        res.status(201).json({ success: true, message: 'FIR submitted successfully', fir: newFIR });
    } catch (error) {
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

        // Handle File Uploads
        let evidencePaths = [];
        if (req.files && req.files.length > 0) {
            evidencePaths = req.files.map(file => file.path);
        }

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
            evidence: evidencePaths
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
        next(error);
    }
};

const getUserFIRs = async (req, res, next) => {
    try {
        const firs = await FIR.find({ complainant: req.user._id }).sort({ createdAt: -1 });
        res.status(200).json({ success: true, firs });
    } catch (error) {
        next(error);
    }
};

const getAnonymousFIRStatus = async (req, res, next) => {
    try {
        const { trackingId } = req.body;
        const fir = await FIR.findOne({ anonymousRefId: trackingId });

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
        const { city, state, type, status } = req.query;
        let query = {};

        if (city) query.city = { $regex: city, $options: 'i' };
        if (state) query.state = { $regex: state, $options: 'i' };
        if (type) query.incidentType = type;
        if (status) query.status = status;

        const firs = await FIR.find(query)
            .populate('complainant', 'name email phone')
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

        const fir = await FIR.findByIdAndUpdate(
            id,
            { status, assignedOfficer: req.user._id },
            { new: true }
        ).populate('complainant');

        if (!fir) {
            return res.status(404).json({ success: false, message: 'FIR not found' });
        }

        if (req.io) {
            req.io.emit('firUpdated', fir);
        }

        // Send Email Notification if complainant exists (not anonymous)
        if (fir.complainant && fir.complainant.email) {
            sendStatusUpdateEmail(
                fir.complainant.email,
                fir.complainant.name,
                fir._id.toString(),
                status
            );
        }

        res.status(200).json({ success: true, message: 'FIR status updated', fir });
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

        const fir = await FIR.findByIdAndUpdate(
            id,
            {
                $push: {
                    investigationLogs: {
                        entry,
                        officerName: req.user.name,
                        timestamp: new Date()
                    }
                }
            },
            { new: true }
        ).populate('complainant');

        if (!fir) {
            return res.status(404).json({ success: false, message: 'FIR not found' });
        }

        res.status(200).json({ success: true, message: 'Log added', log: fir.investigationLogs[fir.investigationLogs.length - 1] });
    } catch (error) {
        next(error);
    }
};

const addMessage = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { message } = req.body;

        const newMessage = {
            senderModel: 'User',
            sender: req.user._id, // User ID (Officer or Citizen)
            senderName: req.user.name,
            role: req.user.role,
            message,
            timestamp: new Date()
        };

        const fir = await FIR.findByIdAndUpdate(
            id,
            { $push: { messages: newMessage } },
            { new: true }
        ).populate('complainant');

        if (!fir) {
            return res.status(404).json({ success: false, message: 'FIR not found' });
        }

        // Notify via socket if applicable
        if (req.io) {
            req.io.to(id).emit('newMessage', newMessage); // Assuming rooms based on FIR ID, or generic broadcast
        }

        res.status(200).json({ success: true, message: 'Message sent', messageData: newMessage });
    } catch (error) {
        next(error);
    }
};

module.exports = { createFIR, createAnonymousFIR, getUserFIRs, getAnonymousFIRStatus, getAllFIRs, updateFIRStatus, getAnalytics, addInvestigationLog, addMessage };

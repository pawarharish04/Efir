const User = require('../models/User');
const FIR = require('../models/FIR');
const { sendStatusUpdateEmail } = require('../utils/emailService');

// Get all officers (pending and approved)
const getAllOfficers = async (req, res, next) => {
    try {
        const officers = await User.find({ role: 'officer' }).select('-password');
        res.status(200).json({ success: true, officers });
    } catch (error) {
        next(error);
    }
};

// Approve an officer
const approveOfficer = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findByIdAndUpdate(id, { isApproved: true }, { new: true });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Officer not found' });
        }

        // Ideally send an email to the officer saying they are approved
        // sendOfficerApprovalEmail(user.email, user.name); 

        res.status(200).json({ success: true, message: 'Officer approved successfully', user });
    } catch (error) {
        next(error);
    }
};

// Delete a user (officer or citizen)
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        await User.findByIdAndDelete(id);
        res.status(200).json({ success: true, message: 'User deleted successfully' });
    } catch (error) {
        next(error);
    }
};

// Get Admin Stats
const getAdminStats = async (req, res, next) => {
    try {
        const totalCitizens = await User.countDocuments({ role: 'citizen' });
        const totalOfficers = await User.countDocuments({ role: 'officer' });
        const pendingOfficers = await User.countDocuments({ role: 'officer', isApproved: false });
        const totalFIRs = await FIR.countDocuments();

        res.status(200).json({
            success: true,
            stats: {
                citizens: totalCitizens,
                officers: totalOfficers,
                pendingOfficers,
                firs: totalFIRs
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllOfficers, approveOfficer, deleteUser, getAdminStats };

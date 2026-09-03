const User = require('../models/User');
const FIR = require('../models/FIR');
const Station = require('../models/Station');
const { sendStatusUpdateEmail } = require('../utils/emailService');

// ─────────────────────────────────────────────────────────────
// Officer management
// ─────────────────────────────────────────────────────────────

// Get all officers (pending and approved)
const getAllOfficers = async (req, res, next) => {
    try {
        const officers = await User.find({ role: 'officer' }).select('-password').populate('station', 'name city state');
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

        res.status(200).json({ success: true, message: 'Officer approved successfully', user });
    } catch (error) {
        next(error);
    }
};

const path = require('path');
const { cleanupFiles } = require('../middlewares/uploadMiddleware');

// Delete a user (officer or citizen) and clean up associated files
const deleteUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        // Clean up evidence files from disk for all FIRs filed by this user
        const userFIRs = await FIR.find({ complainant: id });
        for (const fir of userFIRs) {
            if (fir.evidence && fir.evidence.length > 0) {
                const fullPaths = fir.evidence.map(relPath => path.join(__dirname, '../', relPath));
                cleanupFiles(fullPaths);
            }
        }
        await FIR.deleteMany({ complainant: id });
        await User.findByIdAndDelete(id);

        res.status(200).json({ success: true, message: 'User and associated files deleted successfully' });
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

// Get officer workload (active open FIR counts per approved officer)
const getOfficerWorkload = async (req, res, next) => {
    try {
        const officers = await User.find({ role: 'officer', isApproved: true })
            .select('_id name email phone badgeId department designation station');

        // Aggregation to count open FIRs per assigned officer
        const openFIRCounts = await FIR.aggregate([
            {
                $match: {
                    status: { $in: ['Pending', 'Accepted', 'In Progress'] },
                    assignedOfficer: { $exists: true, $ne: null }
                }
            },
            {
                $group: {
                    _id: "$assignedOfficer",
                    count: { $sum: 1 }
                }
            }
        ]);

        const countMap = {};
        openFIRCounts.forEach(item => {
            countMap[item._id.toString()] = item.count;
        });

        const workload = officers.map(officer => ({
            _id: officer._id,
            name: officer.name,
            email: officer.email,
            phone: officer.phone,
            badgeId: officer.badgeId,
            department: officer.department,
            designation: officer.designation || 'officer',
            station: officer.station,
            openCasesCount: countMap[officer._id.toString()] || 0
        }));

        // Sort officers by workload ascending (least loaded first)
        workload.sort((a, b) => a.openCasesCount - b.openCasesCount);

        res.status(200).json({ success: true, officers: workload });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// Station CRUD (admin-only)
// ─────────────────────────────────────────────────────────────

// Create a new police station
const createStation = async (req, res, next) => {
    try {
        const { name, city, state, pincodes, latitude, longitude, radiusKm } = req.body;

        if (!name || !city || !state) {
            return res.status(400).json({ success: false, message: 'name, city, and state are required' });
        }

        const existing = await Station.findOne({ name: name.trim(), city: city.trim() });
        if (existing) {
            return res.status(409).json({ success: false, message: 'A station with this name already exists in that city' });
        }

        const station = new Station({
            name: name.trim(),
            city: city.trim(),
            state: state.trim(),
            pincodes: Array.isArray(pincodes) ? pincodes.map(p => p.trim()) : [],
            latitude: latitude != null ? parseFloat(latitude) : undefined,
            longitude: longitude != null ? parseFloat(longitude) : undefined,
            radiusKm: radiusKm != null ? parseFloat(radiusKm) : 10,
        });

        await station.save();
        res.status(201).json({ success: true, message: 'Station created successfully', station });
    } catch (error) {
        next(error);
    }
};

// List all stations with active FIR counts
const listStations = async (req, res, next) => {
    try {
        const stations = await Station.find().sort({ state: 1, city: 1, name: 1 }).lean();

        // Add open FIR counts per station
        const openFIRCounts = await FIR.aggregate([
            { $match: { station: { $exists: true, $ne: null }, status: { $nin: ['Resolved', 'Rejected'] } } },
            { $group: { _id: '$station', count: { $sum: 1 } } }
        ]);

        const countMap = {};
        openFIRCounts.forEach(item => { countMap[item._id.toString()] = item.count; });

        const result = stations.map(s => ({
            ...s,
            openFIRCount: countMap[s._id.toString()] || 0
        }));

        res.status(200).json({ success: true, stations: result });
    } catch (error) {
        next(error);
    }
};

// Update a station (pincodes, coordinates, radius, active status, etc.)
const updateStation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, city, state, pincodes, latitude, longitude, radiusKm, isActive } = req.body;

        const station = await Station.findById(id);
        if (!station) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }

        if (name !== undefined) station.name = name.trim();
        if (city !== undefined) station.city = city.trim();
        if (state !== undefined) station.state = state.trim();
        if (Array.isArray(pincodes)) station.pincodes = pincodes.map(p => p.trim());
        if (latitude != null) station.latitude = parseFloat(latitude);
        if (longitude != null) station.longitude = parseFloat(longitude);
        if (radiusKm != null) station.radiusKm = parseFloat(radiusKm);
        if (isActive !== undefined) station.isActive = Boolean(isActive);

        await station.save(); // pre-save hook syncs location.coordinates
        res.status(200).json({ success: true, message: 'Station updated', station });
    } catch (error) {
        next(error);
    }
};

// Delete (soft-delete) a station — sets isActive: false
const deleteStation = async (req, res, next) => {
    try {
        const { id } = req.params;
        const station = await Station.findById(id);
        if (!station) {
            return res.status(404).json({ success: false, message: 'Station not found' });
        }

        station.isActive = false;
        await station.save();

        res.status(200).json({ success: true, message: 'Station deactivated successfully' });
    } catch (error) {
        next(error);
    }
};

// ─────────────────────────────────────────────────────────────
// Manual FIR rerouting (admin-only)
// ─────────────────────────────────────────────────────────────

// Manually reassign a FIR to a different station
const rerouteFIR = async (req, res, next) => {
    try {
        const { firId } = req.params;
        const { stationId } = req.body;

        if (!stationId) {
            return res.status(400).json({ success: false, message: 'stationId is required' });
        }

        const fir = await FIR.findById(firId);
        if (!fir) {
            return res.status(404).json({ success: false, message: 'FIR not found' });
        }

        const newStation = await Station.findOne({ _id: stationId, isActive: true });
        if (!newStation) {
            return res.status(404).json({ success: false, message: 'Target station not found or inactive' });
        }

        const previousStation = fir.station ? fir.station.toString() : 'none';
        fir.station = newStation._id;
        fir.stationUnmatched = false; // resolved by admin

        const auditEntry = `Jurisdiction rerouted to ${newStation.name} (${newStation.city}) by Admin ${req.user.name}. Previous station ID: ${previousStation}`;
        fir.investigationLogs.push({
            entry: auditEntry,
            officerName: req.user.name,
            timestamp: new Date(),
        });

        await fir.save();

        const populatedFIR = await FIR.findById(fir._id)
            .populate('complainant', 'name email phone')
            .populate('assignedOfficer', 'name email badgeId department designation')
            .populate('station', 'name city state');

        if (req.io) {
            req.io.emit('firUpdated', populatedFIR);
        }

        res.status(200).json({
            success: true,
            message: `FIR rerouted to ${newStation.name}`,
            fir: populatedFIR
        });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllOfficers,
    approveOfficer,
    deleteUser,
    getAdminStats,
    getOfficerWorkload,
    createStation,
    listStations,
    updateStation,
    deleteStation,
    rerouteFIR,
};


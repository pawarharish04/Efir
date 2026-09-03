const express = require('express');
const {
    getAllOfficers, approveOfficer, deleteUser, getAdminStats, getOfficerWorkload,
    createStation, listStations, updateStation, deleteStation, rerouteFIR,
} = require('../controllers/adminController');
const { verifyJWT, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// Officer Workload (Accessible by Admin or Officer with designation 'supervisor')
router.get('/officer-workload', verifyJWT, (req, res, next) => {
    if (req.user.role === 'admin' || req.user.designation === 'supervisor') {
        return next();
    }
    return res.status(403).json({
        success: false,
        message: 'Access denied: Requires administrator or supervisor privileges'
    });
}, getOfficerWorkload);

// Station listing is also accessible to supervisors for awareness
router.get('/stations', verifyJWT, (req, res, next) => {
    if (req.user.role === 'admin' || req.user.designation === 'supervisor') {
        return next();
    }
    return res.status(403).json({ success: false, message: 'Access denied' });
}, listStations);

// Remaining routes require Admin role
router.use(verifyJWT, authorizeRoles('admin'));

router.get('/officers', getAllOfficers);
router.put('/approve-officer/:id', approveOfficer);
router.delete('/user/:id', deleteUser);
router.get('/stats', getAdminStats);

// Station CRUD (admin-only)
router.post('/stations', createStation);
router.put('/stations/:id', updateStation);
router.delete('/stations/:id', deleteStation);

// Manual jurisdiction reroute (admin-only)
router.put('/reroute/:firId', rerouteFIR);

module.exports = router;


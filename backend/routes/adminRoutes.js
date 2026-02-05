const express = require('express');
const { getAllOfficers, approveOfficer, deleteUser, getAdminStats } = require('../controllers/adminController');
const { verifyJWT, authorizeRoles } = require('../middlewares/authMiddleware');

const router = express.Router();

// All routes require Admin role
router.use(verifyJWT, authorizeRoles('admin'));

router.get('/officers', getAllOfficers);
router.put('/approve-officer/:id', approveOfficer);
router.delete('/user/:id', deleteUser);
router.get('/stats', getAdminStats);

module.exports = router;

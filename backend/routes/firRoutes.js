const express = require('express');
const { createFIR, createAnonymousFIR, getUserFIRs, getAnonymousFIRStatus, getAllFIRs, updateFIRStatus, getAnalytics, addInvestigationLog, addMessage } = require('../controllers/firController');
const { verifyJWT, authorizeRoles } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

// Public Routes (Anonymous)
router.post('/anonymous/create', upload.array('evidence', 5), createAnonymousFIR); // Allow up to 5 files
router.post('/anonymous/track', getAnonymousFIRStatus);

// Citizen routes
router.post('/create', verifyJWT, upload.array('evidence', 5), createFIR);
router.get('/my-firs', verifyJWT, getUserFIRs);

// Shared Routes (Citizen & Officer) - Communication
router.post('/update/:id/message', verifyJWT, addMessage);

// Officer/Admin routes
router.get('/all', verifyJWT, authorizeRoles('officer', 'admin'), getAllFIRs);
router.put('/update/:id', verifyJWT, authorizeRoles('officer', 'admin'), updateFIRStatus);
router.post('/update/:id/log', verifyJWT, authorizeRoles('officer', 'admin'), addInvestigationLog);
router.get('/analytics', verifyJWT, getAnalytics);

module.exports = router;

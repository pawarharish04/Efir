const express = require('express');
const { createFIR, createAnonymousFIR, getUserFIRs, getAnonymousFIRStatus, getAllFIRs, updateFIRStatus, getAnalytics, addInvestigationLog, addMessage, assignFIR } = require('../controllers/firController');
const { verifyJWT, authorizeRoles } = require('../middlewares/authMiddleware');
const { upload, verifyMagicBytes } = require('../middlewares/uploadMiddleware');
const rateLimit = require('../middlewares/rateLimiter');

const router = express.Router();

// Rate limiter for anonymous FIR creation (max 5 submissions per 15 mins per IP)
const anonymousUploadLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { success: false, message: 'Too many anonymous reports submitted from this IP. Please wait 15 minutes.' }
});

// Public Routes (Anonymous)
router.post('/anonymous/create', anonymousUploadLimiter, upload.array('evidence', 5), verifyMagicBytes, createAnonymousFIR);
router.post('/anonymous/track', getAnonymousFIRStatus);

// Citizen routes
router.post('/create', verifyJWT, upload.array('evidence', 5), verifyMagicBytes, createFIR);
router.get('/my-firs', verifyJWT, getUserFIRs);

// Shared Routes (Citizen & Officer) - Communication
router.post('/update/:id/message', verifyJWT, addMessage);

// Task Assignment (Supervisor or Admin)
router.put('/assign/:id', verifyJWT, assignFIR);

// Officer/Admin routes
router.get('/all', verifyJWT, authorizeRoles('officer', 'admin'), getAllFIRs);
router.put('/update/:id', verifyJWT, authorizeRoles('officer', 'admin'), updateFIRStatus);
router.post('/update/:id/log', verifyJWT, authorizeRoles('officer', 'admin'), addInvestigationLog);
router.get('/analytics', verifyJWT, authorizeRoles('officer', 'admin'), getAnalytics);

module.exports = router;

const multer = require('multer');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

// Resolve absolute path to backend/uploads
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Storage engine
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        const ext = path.extname(file.originalname).toLowerCase();
        const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(6).toString('hex');
        cb(null, 'evidence-' + uniqueSuffix + ext);
    }
});

// Allowed MIME types & Extensions
const ALLOWED_MIMES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'video/mp4',
    'application/pdf'
]);

const ALLOWED_EXTS = new Set(['.jpg', '.jpeg', '.png', '.mp4', '.pdf']);

function fileFilter(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const mime = (file.mimetype || '').toLowerCase();

    if (ALLOWED_EXTS.has(ext) && ALLOWED_MIMES.has(mime)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, MP4, and PDF files are allowed.'));
    }
}

// Init Upload with limits: 10MB per file, max 5 files
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
        files: 5
    },
    fileFilter: fileFilter
});

/**
 * Validate magic bytes (file signature) to prevent renamed executable/malicious uploads.
 */
function validateMagicBytes(filePath) {
    try {
        const buffer = Buffer.alloc(12);
        const fd = fs.openSync(filePath, 'r');
        fs.readSync(fd, buffer, 0, 12, 0);
        fs.closeSync(fd);

        // JPEG: FF D8 FF
        if (buffer[0] === 0xFF && buffer[1] === 0xD8 && buffer[2] === 0xFF) return true;
        // PNG: 89 50 4E 47
        if (buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47) return true;
        // PDF: 25 50 44 46 (%PDF)
        if (buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46) return true;
        // MP4: bytes 4-7 are 'ftyp' (0x66 0x74 0x79 0x70)
        if (buffer[4] === 0x66 && buffer[5] === 0x74 && buffer[6] === 0x79 && buffer[7] === 0x70) return true;

        return false;
    } catch {
        return false;
    }
}

/**
 * Middleware to verify magic bytes of all uploaded files.
 * Deletes uploaded files immediately if validation fails.
 */
function verifyMagicBytes(req, res, next) {
    if (!req.files || req.files.length === 0) {
        return next();
    }

    for (const file of req.files) {
        if (!validateMagicBytes(file.path)) {
            // Delete all uploaded files in this request immediately
            req.files.forEach(f => {
                try {
                    if (fs.existsSync(f.path)) fs.unlinkSync(f.path);
                } catch (err) {
                    console.error('Error deleting invalid file:', err.message);
                }
            });

            return res.status(400).json({
                success: false,
                message: `File "${file.originalname}" has an invalid file signature or is corrupted.`
            });
        }
    }

    next();
}

/**
 * Utility to clean up files from disk
 */
function cleanupFiles(files) {
    if (!files || !Array.isArray(files)) return;
    files.forEach(f => {
        const filePath = typeof f === 'string' ? f : f.path;
        try {
            if (filePath && fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        } catch (err) {
            console.error('Failed to cleanup file:', filePath, err.message);
        }
    });
}

module.exports = {
    upload,
    verifyMagicBytes,
    cleanupFiles,
    uploadDir
};

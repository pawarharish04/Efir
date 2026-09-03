const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    try {
        const { name, email, password, phone, role, badgeId, department, designation } = req.body;

        const cleanEmail = email ? email.trim().toLowerCase() : '';
        const existingUser = await User.findOne({ email: cleanEmail });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const isOfficer = role && role.trim().toLowerCase() === 'officer';
        const cleanRole = isOfficer ? 'officer' : 'citizen';
        const cleanBadge = (isOfficer && badgeId) ? badgeId.trim().toUpperCase() : undefined;

        if (cleanBadge) {
            const badgeExists = await User.findOne({ badgeId: cleanBadge });
            if (badgeExists) {
                return res.status(400).json({ success: false, message: 'Badge ID is already registered' });
            }
        }

        const newUser = new User({
            name: name ? name.trim() : '',
            email: cleanEmail,
            password: hashedPassword,
            phone: phone ? phone.trim() : '',
            role: cleanRole,
            badgeId: cleanBadge,
            department: department ? department.trim() : (isOfficer ? 'General Enforcement' : undefined),
            designation: designation || 'officer',
            isApproved: isOfficer ? true : false, // Auto-approve or ready for portal access
        });

        await newUser.save();

        res.status(201).json({
            success: true,
            message: isOfficer
                ? 'Officer credentials registered successfully.'
                : 'User registered successfully'
        });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, badgeId, password, identifier } = req.body;

        // Support unified identifier (either email or badge ID) or dedicated fields
        const loginTerm = (identifier || email || badgeId || '').trim();

        if (!loginTerm || !password) {
            return res.status(400).json({ success: false, message: 'Identifier (Badge ID or Email) and password are required' });
        }

        // Search user by Badge ID (case-insensitive) OR by Email
        const user = await User.findOne({
            $or: [
                { badgeId: { $regex: new RegExp(`^${loginTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } },
                { email: loginTerm.toLowerCase() }
            ]
        });

        if (!user) {
            return res.status(404).json({ success: false, message: 'Account not found with provided Badge ID or Email' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid passkey credentials' });
        }

        // Ensure role string is sanitized
        const cleanRole = (user.role || 'citizen').trim();

        // Check for Officer Approval
        if (cleanRole === 'officer' && user.isApproved === false) {
            return res.status(403).json({ success: false, message: 'Officer account pending administrative approval.' });
        }

        const token = jwt.sign(
            { id: user._id, role: cleanRole, designation: user.designation || 'officer' },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        const isProduction = process.env.NODE_ENV === 'production';

        res
            .cookie('access_token', token, {
                httpOnly: true,
                secure: isProduction,
                sameSite: isProduction ? 'none' : 'lax',
                maxAge: 24 * 60 * 60 * 1000,
            })
            .status(200)
            .json({
                success: true,
                token,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: cleanRole,
                    badgeId: user.badgeId,
                    designation: user.designation || 'officer'
                },
            });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    const isProduction = process.env.NODE_ENV === 'production';
    res.clearCookie('access_token', {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax'
    }).status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, logout };
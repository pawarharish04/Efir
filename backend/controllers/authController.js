const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res, next) => {
    try {
        const { name, email, password, phone } = req.body;

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ success: false, message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            name,
            email,
            password: hashedPassword,
            phone,
            role: 'citizen', // Force citizen role for public registration
        });

        await newUser.save();

        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, badgeId, password } = req.body;

        // Check if login is via Email (Citizen) or Badge ID (Officer)
        let query = {};
        if (badgeId) {
            query = { badgeId };
        } else if (email) {
            query = { email };
        } else {
            return res.status(400).json({ success: false, message: 'Email or Badge ID required' });
        }

        const user = await User.findOne(query);
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' });
        }

        // Check for Officer Approval
        if (user.role === 'officer' && !user.isApproved) {
            return res.status(403).json({ success: false, message: 'Account pending admin approval.' });
        }

        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d',
        });

        res
            .cookie('access_token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000, // 1 day
            })
            .status(200)
            .json({
                success: true,
                token, // Return token for mobile/client-side storage
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    badgeId: user.badgeId
                },
            });
    } catch (error) {
        next(error);
    }
};

const logout = (req, res) => {
    res.clearCookie('access_token').status(200).json({ success: true, message: 'Logged out successfully' });
};

module.exports = { register, login, logout };

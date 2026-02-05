const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const createAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const adminEmail = 'admin@fir.gov.in';
        const adminExists = await User.findOne({ email: adminEmail });

        if (adminExists) {
            console.log('Admin user already exists.');
            console.log(`Email: ${adminEmail}`);
            // We won't reset password to avoid overwriting user data unexpectedly, 
            // unless we want to force reset. For now, just exit.
            process.exit();
        }

        const hashedPassword = await bcrypt.hash('admin123', 10);

        const admin = new User({
            name: 'System Admin',
            email: adminEmail,
            password: hashedPassword,
            phone: '9999999999',
            role: 'admin',
            isApproved: true,
            department: 'Headquarters'
        });

        await admin.save();
        console.log('Admin created successfully');
        console.log(`Email: ${adminEmail}`);
        console.log('Password: admin123');
        process.exit();
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    }
};

createAdmin();

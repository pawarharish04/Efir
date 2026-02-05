const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

dotenv.config();

const seedOfficers = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const officerExists = await User.findOne({ badgeId: 'OFFICER123' });
        if (officerExists) {
            console.log('Officer already exists');
            process.exit();
        }

        const hashedPassword = await bcrypt.hash('police123', 10);

        const officer = new User({
            name: 'Inspector Vijay',
            email: 'vijay@police.gov.in',
            password: hashedPassword,
            phone: '9876543210',
            role: 'officer',
            badgeId: 'OFFICER123'
        });

        await officer.save();
        console.log('Officer created successfully');
        console.log('Badge ID: OFFICER123');
        console.log('Password: police123');
        process.exit();
    } catch (error) {
        console.error('Error seeding officer:', error);
        process.exit(1);
    }
};

seedOfficers();

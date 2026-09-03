/**
 * seedStations.js — Seeds 4 realistic Indian police stations.
 * Run: node backend/seedStations.js   (from project root)
 *      node seedStations.js           (from backend/ dir)
 */
require('dotenv').config({ path: require('path').join(__dirname, '.env') });
const mongoose = require('mongoose');
const Station = require('./models/Station');

const STATIONS = [
    {
        name: 'Andheri Police Station',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincodes: ['400058', '400053', '400069', '400047', '400061'],
        latitude: 19.1136,
        longitude: 72.8697,
        radiusKm: 8,
    },
    {
        name: 'Bandra Police Station',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincodes: ['400050', '400051', '400049', '400054'],
        latitude: 19.0596,
        longitude: 72.8295,
        radiusKm: 6,
    },
    {
        name: 'Lalbazar Police Headquarters',
        city: 'Kolkata',
        state: 'West Bengal',
        pincodes: ['700001', '700012', '700013', '700016', '700026'],
        latitude: 22.5726,
        longitude: 88.3639,
        radiusKm: 10,
    },
    {
        name: 'MG Road Police Station',
        city: 'Bengaluru',
        state: 'Karnataka',
        pincodes: ['560001', '560025', '560052', '560002', '560042'],
        latitude: 12.9741,
        longitude: 77.6189,
        radiusKm: 8,
    },
];

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        for (const data of STATIONS) {
            // Build the full GeoJSON here so the 2dsphere index validation passes
            // (findOneAndUpdate bypasses Mongoose pre-save hooks)
            const doc = {
                ...data,
                location: {
                    type: 'Point',
                    coordinates: [data.longitude, data.latitude],
                },
                isActive: true,
            };

            await Station.findOneAndUpdate(
                { name: data.name },
                { $set: doc },
                { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
            );
            console.log('  Upserted:', data.name, '(' + data.city + ')');
        }

        console.log('\nSeeding complete: ' + STATIONS.length + ' stations inserted/updated.');
    } catch (err) {
        console.error('Seeding failed:', err.message);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
};

seed();
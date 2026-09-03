const mongoose = require('mongoose');

const stationSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincodes: [{ type: String, trim: true }],
    latitude: { type: Number },
    longitude: { type: Number },
    location: {
        type: { type: String, enum: ['Point'], default: 'Point' },
        coordinates: { type: [Number], default: undefined },
    },
    radiusKm: { type: Number, default: 10 },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

stationSchema.index({ location: '2dsphere' });

stationSchema.pre('save', function (next) {
    if (this.latitude != null && this.longitude != null) {
        this.location = { type: 'Point', coordinates: [this.longitude, this.latitude] };
    }
    next();
});

module.exports = mongoose.model('Station', stationSchema);

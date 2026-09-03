const Station = require('../models/Station');

const matchStation = async (pincode, latitude, longitude) => {
    try {
        if (pincode) {
            const byPincode = await Station.findOne({ pincodes: pincode.trim(), isActive: true });
            if (byPincode) return { station: byPincode, unmatched: false };
        }

        if (latitude != null && longitude != null && !isNaN(latitude) && !isNaN(longitude)) {
            const geoQuery = {
                isActive: true,
                location: {
                    $near: {
                        $geometry: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
                        $maxDistance: 50000,
                    },
                },
            };
            const nearbyStations = await Station.find(geoQuery).limit(5);

            for (const station of nearbyStations) {
                const dist = haversineKm(latitude, longitude, station.latitude, station.longitude);
                if (dist <= (station.radiusKm || 10)) return { station, unmatched: false };
            }
        }

        return { station: null, unmatched: true };
    } catch (err) {
        console.error('Station matching error (non-fatal):', err.message);
        return { station: null, unmatched: true };
    }
};

const haversineKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const toRad = (deg) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

module.exports = { matchStation };
import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-hot-toast';

// Fix for Leaflet marker icon missing in React
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});

L.Marker.prototype.options.icon = DefaultIcon;

const LocationPicker = ({ onLocationSelect }) => {
    const [position, setPosition] = useState(null);

    const MapEvents = () => {
        useMapEvents({
            click(e) {
                setPosition(e.latlng);
                onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
                toast.success("Location Pinned!");
            },
        });
        return null;
    };

    // Default to Center of India or User's current location if possible
    const defaultCenter = [20.5937, 78.9629];

    return (
        <div className="h-64 w-full rounded-lg overflow-hidden border border-gray-300 dark:border-gray-600 z-0 relative">
            <MapContainer center={defaultCenter} zoom={5} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapEvents />
                {position && <Marker position={position} />}
            </MapContainer>
            <div className="absolute top-2 right-2 bg-white dark:bg-gray-800 p-2 rounded shadow text-xs z-[1000] opacity-90">
                Click map to pin location
            </div>
        </div>
    );
};

export default LocationPicker;

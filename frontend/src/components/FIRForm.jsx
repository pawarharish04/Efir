import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Send, Camera, Paperclip } from 'lucide-react';
import LocationPicker from './LocationPicker';

const FIRForm = ({ onSuccess }) => {
    const [formData, setFormData] = useState({
        incidentType: 'Theft',
        description: '',
        dateOfIncident: '',
        timeOfIncident: '',
        address: '',
        city: '',
        state: '',
        pincode: '',
        accusedName: '',
        latitude: null,
        longitude: null,
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 5) {
            toast.error("Maximum 5 files allowed");
            return;
        }
        setFiles(Array.from(e.target.files));
    };

    const handleLocationSelect = (coords) => {
        setFormData(prev => ({
            ...prev,
            latitude: coords.lat,
            longitude: coords.lng
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => {
                if (formData[key] !== null) data.append(key, formData[key]);
            });

            files.forEach(file => {
                data.append('evidence', file);
            });

            await axios.post('http://localhost:5000/api/firs/create', data, {
                withCredentials: true,
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('FIR Submitted Successfully!');

            // Reset Form and Files
            setFormData({
                incidentType: 'Theft',
                description: '',
                dateOfIncident: '',
                timeOfIncident: '',
                address: '',
                city: '',
                state: '',
                pincode: '',
                accusedName: '',
                latitude: null,
                longitude: null,
            });
            setFiles([]);

            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to submit FIR');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 border-b pb-4 dark:border-gray-700">
                File a New FIR
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Type</label>
                        <select
                            name="incidentType"
                            value={formData.incidentType}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                        >
                            <option>Theft</option>
                            <option>Assault</option>
                            <option>Fraud</option>
                            <option>Cybercrime</option>
                            <option>Lost Property</option>
                            <option>Other</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accused Name (if known)</label>
                        <input
                            type="text"
                            name="accusedName"
                            value={formData.accusedName}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                            placeholder="Unknown"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Incident</label>
                        <input
                            type="date"
                            name="dateOfIncident"
                            required
                            value={formData.dateOfIncident}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time of Incident</label>
                        <input
                            type="time"
                            name="timeOfIncident"
                            required
                            value={formData.timeOfIncident}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                        />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Description</label>
                    <textarea
                        name="description"
                        required
                        rows="4"
                        value={formData.description}
                        onChange={handleChange}
                        className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                        placeholder="Describe the incident in detail..."
                    ></textarea>
                </div>

                {/* Evidence Upload Section */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Upload Evidence (Images/Video)</label>
                    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer relative">
                        <input
                            type="file"
                            multiple
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Camera className="h-8 w-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Click to upload files</p>
                        <p className="text-xs text-gray-400 mt-1">Supports JPG, PNG, MP4 (Max 5 files)</p>
                        {files.length > 0 && (
                            <div className="mt-3 flex items-center gap-2 text-sm text-blue-600 font-semibold bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-full">
                                <Paperclip className="h-4 w-4" />
                                {files.length} file(s) selected
                            </div>
                        )}
                    </div>
                </div>

                {/* Map Section */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Select Location on Map (Click to Pin)
                    </label>
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                    {formData.latitude && (
                        <p className="text-xs text-green-600 dark:text-green-400 mt-1 font-mono">
                            Coordinates Pinned: {formData.latitude.toFixed(5)}, {formData.longitude.toFixed(5)}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
                        <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                            placeholder="Street Address"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">City</label>
                        <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">State</label>
                        <input
                            type="text"
                            name="state"
                            required
                            value={formData.state}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Pincode</label>
                        <input
                            type="text"
                            name="pincode"
                            required
                            value={formData.pincode}
                            onChange={handleChange}
                            className="w-full rounded-lg border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-blue-500 focus:ring-blue-500 py-2.5 px-3"
                        />
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-colors"
                    >
                        {loading ? 'Submitting...' : (
                            <>
                                <Send className="h-4 w-4" />
                                Submit FIR
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FIRForm;

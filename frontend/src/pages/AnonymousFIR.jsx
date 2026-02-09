import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, MapPin, Camera, AlertTriangle, Send, Shield } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Link } from 'react-router-dom';


const AnonymousFIR = () => {
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
    });
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [submittedId, setSubmittedId] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setFiles(Array.from(e.target.files));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const data = new FormData();
            Object.keys(formData).forEach(key => data.append(key, formData[key]));
            files.forEach(file => data.append('evidence', file));

            const res = await api.post('/api/firs/anonymous/create', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setSubmittedId(res.data.trackingId);
            toast.success('Anonymous Report Submitted!');
        } catch (error) {
            toast.error('Submission Failed');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    if (submittedId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-green-100 dark:border-green-900">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Report Submitted</h2>
                    <p className="text-gray-500 dark:text-gray-400 mb-6">Your identity remains completely anonymous.</p>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mb-6">
                        <p className="text-xs uppercase tracking-wide text-blue-600 dark:text-blue-400 font-semibold mb-1">Your Tracking ID</p>
                        <p className="text-3xl font-mono font-bold text-blue-600 dark:text-blue-400 tracking-widest">{submittedId}</p>
                        <p className="text-xs text-gray-500 mt-2">Save this ID to check your case status later.</p>
                    </div>

                    <Link to="/login" className="block w-full bg-gray-900 text-white py-2 rounded-lg hover:bg-gray-800 transition">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="text-center mb-10">
                    <div className="flex justify-center mb-4">
                        <div className="p-3 bg-red-100 text-red-600 rounded-full">
                            <Shield className="w-8 h-8" />
                        </div>
                    </div>
                    <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Anonymous Reporting Channel</h1>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">Securely report crimes without revealing your identity. We value your safety.</p>
                </div>

                <motion.form
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    onSubmit={handleSubmit}
                    className="bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden"
                >
                    <div className="p-8 space-y-6">
                        {/* Incident Details */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" /> Incident Details
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Incident Type</label>
                                    <select
                                        name="incidentType"
                                        value={formData.incidentType}
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date of Incident</label>
                                    <input
                                        type="date"
                                        name="dateOfIncident"
                                        required
                                        onChange={handleChange}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                    />
                                </div>
                            </div>
                            <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                                <textarea
                                    name="description"
                                    rows="4"
                                    required
                                    placeholder="Describe specifically what happened..."
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                ></textarea>
                            </div>
                        </div>

                        {/* Location */}
                        <div className="pt-4 border-t dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-blue-500" /> Location
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <input
                                    type="text" name="city" placeholder="City" required onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="text" name="state" placeholder="State" required onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="text" name="address" placeholder="Full Address / Landmark" required onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white md:col-span-2"
                                />
                                <input
                                    type="text" name="pincode" placeholder="Pincode" required onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                                <input
                                    type="time" name="timeOfIncident" required onChange={handleChange}
                                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                                />
                            </div>
                        </div>

                        {/* Evidence Upload */}
                        <div className="pt-4 border-t dark:border-gray-700">
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Camera className="w-5 h-5 text-purple-500" /> Evidence (Optional)
                            </h3>
                            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="hidden"
                                    id="file-upload"
                                />
                                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                                    <Camera className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-600 dark:text-gray-400">Click to upload images or videos</span>
                                    <span className="text-xs text-gray-400 mt-1">Max 5 files (JPG, PNG, MP4)</span>
                                </label>
                                {files.length > 0 && (
                                    <div className="mt-4 text-sm text-green-600 font-medium">
                                        {files.length} file(s) selected
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="px-8 py-4 bg-gray-50 dark:bg-gray-700/50 border-t border-gray-100 dark:border-gray-700 flex justify-end">
                        <button
                            type="submit"
                            disabled={loading}
                            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 flex items-center gap-2 font-medium shadow-lg shadow-red-500/30 disabled:opacity-50"
                        >
                            {loading ? 'Submitting...' : <><Send className="w-4 h-4" /> Submit Report</>}
                        </button>
                    </div>
                </motion.form>
            </div>
        </div>
    );
};

export default AnonymousFIR;

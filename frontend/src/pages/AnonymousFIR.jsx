import { useState } from 'react';
import { Camera, Send, ShieldAlert, CheckCircle2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import StatusStepper from '../components/StatusStepper';
import VoiceInput from '../components/VoiceInput';
import LanguageSelector from '../components/LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

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

    // Tracking state
    const [trackingQuery, setTrackingQuery] = useState('');
    const [trackingResult, setTrackingResult] = useState(null);
    const [trackingLoading, setTrackingLoading] = useState(false);

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

            const res = await api.post('/api/firs/anonymous/create', data);

            setSubmittedId(res.data.trackingId);
            toast.success('Anonymous report submitted');
        } catch (error) {
            toast.error('Submission failed');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e) => {
        e.preventDefault();
        if (!trackingQuery.trim()) return;
        setTrackingLoading(true);
        try {
            const res = await api.post('/api/firs/anonymous/track', { trackingId: trackingQuery.trim() });
            setTrackingResult(res.data.fir);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Report not found with this tracking ID');
            setTrackingResult(null);
        } finally {
            setTrackingLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-100 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-start gap-4">
                    <div>
                        <h1 className="text-2xl font-black text-slate-900">
                            Anonymous Crime Reporting
                        </h1>
                        <p className="text-xs text-slate-600 mt-1">
                            Report incidents without revealing your identity. No personal credentials are required or recorded.
                        </p>
                    </div>
                    <LanguageSelector variant="light" />
                </div>

                {/* Tracking Query Box */}
                <div className="bg-white border border-gray-200 p-5 rounded-sm">
                    <h2 className="font-semibold text-xs text-gray-800 mb-2">
                        Track an Existing Anonymous Report
                    </h2>
                    <form onSubmit={handleTrack} className="flex gap-2">
                        <input
                            type="text"
                            placeholder="Enter 8-character reference ID (e.g. E5549609)..."
                            value={trackingQuery}
                            onChange={(e) => setTrackingQuery(e.target.value)}
                            className="flex-1 px-3 py-2 text-xs border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none font-mono uppercase"
                        />
                        <button
                            type="submit"
                            disabled={trackingLoading}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white text-xs font-medium rounded-sm disabled:opacity-50 transition-colors"
                        >
                            {trackingLoading ? 'Checking...' : 'Track'}
                        </button>
                    </form>

                    {/* Result */}
                    {trackingResult && (
                        <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-sm space-y-3">
                            <div className="flex justify-between items-center text-xs">
                                <span className="font-mono font-semibold text-gray-700">
                                    Ref: {trackingResult.anonymousRefId}
                                </span>
                                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-100 text-blue-800">
                                    {trackingResult.status}
                                </span>
                            </div>
                            <StatusStepper currentStatus={trackingResult.status} />
                            <div className="text-xs space-y-1 text-gray-700 pt-2 border-t border-gray-200">
                                <p><strong>Category:</strong> {trackingResult.incidentType}</p>
                                <p><strong>Location:</strong> {trackingResult.city}, {trackingResult.state} ({trackingResult.pincode})</p>
                                <p><strong>Description:</strong> {trackingResult.description}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Form */}
                {!submittedId ? (
                    <div className="bg-white border border-gray-200 rounded-sm p-6 sm:p-8">
                        <h2 className="font-semibold text-base text-gray-900 mb-4 pb-2 border-b border-gray-100">
                            Submit a New Anonymous Report
                        </h2>

                        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Incident Type *</label>
                                    <select
                                        name="incidentType"
                                        value={formData.incidentType}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none"
                                    >
                                        <option>Theft</option>
                                        <option>Assault</option>
                                        <option>Fraud</option>
                                        <option>Cybercrime</option>
                                        <option>Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Suspect Name (if known)</label>
                                    <input
                                        type="text"
                                        name="accusedName"
                                        value={formData.accusedName}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none"
                                        placeholder="Unknown or specific person"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Date of Incident *</label>
                                    <input
                                        type="date"
                                        name="dateOfIncident"
                                        required
                                        value={formData.dateOfIncident}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">Time of Incident *</label>
                                    <input
                                        type="time"
                                        name="timeOfIncident"
                                        required
                                        value={formData.timeOfIncident}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-gray-700 font-bold mb-1">Incident Description & Deposition *</label>
                                <VoiceInput
                                    onTranscript={(txt) => setFormData(prev => ({
                                        ...prev,
                                        description: prev.description ? `${prev.description} ${txt}` : txt
                                    }))}
                                    currentText={formData.description}
                                />
                                <textarea
                                    name="description"
                                    required
                                    rows="4"
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="w-full p-2.5 border border-gray-300 rounded-lg focus:border-gov-primary focus:outline-none"
                                    placeholder="Describe what occurred with as much detail as possible, or click the mic button above to narrate in your regional language..."
                                ></textarea>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="sm:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-1">Street Address / Landmark *</label>
                                    <input
                                        type="text"
                                        name="address"
                                        required
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">City *</label>
                                    <input
                                        type="text"
                                        name="city"
                                        required
                                        value={formData.city}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-gray-700 font-medium mb-1">State *</label>
                                    <input
                                        type="text"
                                        name="state"
                                        required
                                        value={formData.state}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none"
                                    />
                                </div>

                                <div className="sm:col-span-2">
                                    <label className="block text-gray-700 font-medium mb-1">Pincode * (Used for police station routing)</label>
                                    <input
                                        type="text"
                                        name="pincode"
                                        required
                                        value={formData.pincode}
                                        onChange={handleChange}
                                        className="w-full p-2 border border-gray-300 rounded-sm focus:border-gov-primary focus:outline-none font-mono"
                                        placeholder="e.g. 400058"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-gray-700 font-medium mb-1">Attach Files (Max 5 files)</label>
                                <input
                                    type="file"
                                    multiple
                                    onChange={handleFileChange}
                                    className="w-full text-xs text-gray-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-sm file:border-0 file:text-xs file:bg-gray-100 hover:file:bg-gray-200 cursor-pointer"
                                />
                            </div>

                            <div className="pt-2">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full py-2.5 px-4 bg-gov-primary hover:bg-gov-hover text-white rounded-sm font-medium transition-colors disabled:opacity-50"
                                >
                                    {loading ? 'Submitting...' : 'Submit Anonymous Report'}
                                </button>
                            </div>
                        </form>
                    </div>
                ) : (
                    /* Success Confirmation */
                    <div className="bg-white border border-gray-200 p-8 rounded-sm text-center space-y-3">
                        <div className="w-12 h-12 bg-green-50 text-green-700 rounded-full flex items-center justify-center mx-auto">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">
                            Report Submitted
                        </h2>
                        <p className="text-xs text-gray-600 max-w-sm mx-auto">
                            Your report has been forwarded to the local police station. Please save this reference code to check progress:
                        </p>
                        <div className="p-3 bg-gray-50 border border-gray-200 rounded-sm inline-block">
                            <span className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                                {submittedId}
                            </span>
                        </div>
                        <div>
                            <button
                                onClick={() => { setSubmittedId(null); setTrackingQuery(submittedId); }}
                                className="mt-2 text-xs text-gov-primary hover:underline font-medium"
                            >
                                Track this report now &rarr;
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnonymousFIR;
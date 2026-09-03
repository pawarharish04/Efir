import { useState } from 'react';
import api from '../api/axios';
import { toast } from 'react-hot-toast';
import { Send, Camera, Paperclip, MapPin, AlertCircle, CheckCircle2, ShieldAlert } from 'lucide-react';
import LocationPicker from './LocationPicker';
import VoiceInput from './VoiceInput';
import LanguageSelector from './LanguageSelector';
import { useLanguage } from '../context/LanguageContext';

const FIRForm = ({ onSuccess }) => {
    const { t } = useLanguage();

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
    const [touched, setTouched] = useState({});

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleBlur = (e) => {
        setTouched({ ...touched, [e.target.name]: true });
    };

    // Voice-to-text transcript append handler
    const handleVoiceTranscript = (transcriptText) => {
        setFormData(prev => ({
            ...prev,
            description: prev.description
                ? `${prev.description} ${transcriptText}`
                : transcriptText
        }));
        toast.success("Voice transcribed into statement", { icon: "🎙️" });
    };

    const handleFileChange = (e) => {
        if (e.target.files.length > 5) {
            toast.error("Maximum 5 evidence files allowed");
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

    // Validation checks
    const errors = {
        description: !formData.description.trim() ? "Detailed factual incident narrative is required." : null,
        dateOfIncident: !formData.dateOfIncident ? "Date of occurrence is mandatory." : null,
        timeOfIncident: !formData.timeOfIncident ? "Approximate time of occurrence is mandatory." : null,
        address: !formData.address.trim() ? "Specific incident address or landmark is mandatory." : null,
        city: !formData.city.trim() ? "City name is mandatory." : null,
        state: !formData.state.trim() ? "State name is mandatory." : null,
        pincode: !formData.pincode.trim()
            ? "Pincode is required for police jurisdiction station matching."
            : !/^\d{6}$/.test(formData.pincode.trim())
            ? "Pincode must be a 6-digit numeric code."
            : null
    };

    const isFormValid = !Object.values(errors).some(err => err !== null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Mark all fields as touched to display errors
        setTouched({
            description: true,
            dateOfIncident: true,
            timeOfIncident: true,
            address: true,
            city: true,
            state: true,
            pincode: true,
        });

        if (!isFormValid) {
            toast.error("Please correct marked errors before filing official FIR");
            return;
        }

        setLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach((key) => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });
        files.forEach((file) => {
            data.append('evidence', file);
        });

        try {
            const res = await api.post('/api/firs/create', data, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            toast.success(res.data.message || 'FIR Registered Successfully');

            // Reset Form
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
            setTouched({});

            if (onSuccess) onSuccess();
        } catch (error) {
            toast.error(error.response?.data?.message || 'FIR Submission Failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white border border-slate-300 rounded-2xl p-6 sm:p-8 shadow-card space-y-6">
            {/* Form Top Header with Language Selector & Statutory Badging */}
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-200">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2.5 py-0.5 rounded border border-blue-200">
                            Section 154 CrPC Legal Lodgement
                        </span>
                        <LanguageSelector variant="light" />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-1">
                        {t('filingHeader')}
                    </h2>
                    <p className="text-xs text-slate-500 mt-0.5">
                        {t('filingSub')}
                    </p>
                </div>
                <div className="text-[11px] font-mono text-slate-600 flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-xl border border-amber-200">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>Perjury & False Filing is Punishable</span>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 text-xs sm:text-sm">
                {/* 1. Category & Suspect */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {t('categoryLabel')}
                        </label>
                        <select
                            name="incidentType"
                            value={formData.incidentType}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-none bg-white font-medium"
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
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {t('accusedLabel')}
                        </label>
                        <input
                            type="text"
                            name="accusedName"
                            value={formData.accusedName}
                            onChange={handleChange}
                            className="w-full rounded-xl border border-slate-300 p-2.5 text-xs focus:border-blue-600 focus:outline-none"
                            placeholder={t('accusedPlaceholder')}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {t('dateLabel')}
                        </label>
                        <input
                            type="date"
                            name="dateOfIncident"
                            required
                            value={formData.dateOfIncident}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none ${
                                touched.dateOfIncident && errors.dateOfIncident
                                    ? 'border-red-400 bg-red-50/50'
                                    : 'border-slate-300 focus:border-blue-600'
                            }`}
                        />
                        {touched.dateOfIncident && errors.dateOfIncident && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3" /> {errors.dateOfIncident}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {t('timeLabel')}
                        </label>
                        <input
                            type="time"
                            name="timeOfIncident"
                            required
                            value={formData.timeOfIncident}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none ${
                                touched.timeOfIncident && errors.timeOfIncident
                                    ? 'border-red-400 bg-red-50/50'
                                    : 'border-slate-300 focus:border-blue-600'
                            }`}
                        />
                        {touched.timeOfIncident && errors.timeOfIncident && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3" /> {errors.timeOfIncident}
                            </p>
                        )}
                    </div>
                </div>

                {/* 2. Description Narrative & Integrated Voice-to-Text Dictation */}
                <div className="space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                            {t('narrativeLabel')}
                        </label>
                        <span className="text-[11px] text-blue-700 font-medium font-mono">
                            MICROPHONE & SPEECH COMPLIANT
                        </span>
                    </div>

                    {/* Integrated Voice Input & Speech-To-Text / Text-To-Speech Bar */}
                    <VoiceInput
                        onTranscript={handleVoiceTranscript}
                        currentText={formData.description}
                    />

                    <textarea
                        name="description"
                        required
                        rows="5"
                        value={formData.description}
                        onChange={handleChange}
                        onBlur={handleBlur}
                        className={`w-full rounded-xl border p-3.5 text-xs focus:outline-none leading-relaxed ${
                            touched.description && errors.description
                                ? 'border-red-400 bg-red-50/50'
                                : 'border-slate-300 focus:border-blue-600'
                        }`}
                        placeholder={t('narrativePlaceholder')}
                    ></textarea>
                    {touched.description && errors.description && (
                        <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                            <AlertCircle className="w-3 h-3" /> {errors.description}
                        </p>
                    )}
                </div>

                {/* 3. Jurisdictional Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {t('locationLabel')}
                        </label>
                        <input
                            type="text"
                            name="address"
                            required
                            value={formData.address}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none ${
                                touched.address && errors.address
                                    ? 'border-red-400 bg-red-50/50'
                                    : 'border-slate-300 focus:border-blue-600'
                            }`}
                            placeholder="Street, locality, landmarks"
                        />
                        {touched.address && errors.address && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3" /> {errors.address}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {t('cityLabel')}
                        </label>
                        <input
                            type="text"
                            name="city"
                            required
                            value={formData.city}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none ${
                                touched.city && errors.city
                                    ? 'border-red-400 bg-red-50/50'
                                    : 'border-slate-300 focus:border-blue-600'
                            }`}
                            placeholder="e.g. Mumbai"
                        />
                        {touched.city && errors.city && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3" /> {errors.city}
                            </p>
                        )}
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                            {t('stateLabel')}
                        </label>
                        <input
                            type="text"
                            name="state"
                            required
                            value={formData.state}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full rounded-xl border p-2.5 text-xs focus:outline-none ${
                                touched.state && errors.state
                                    ? 'border-red-400 bg-red-50/50'
                                    : 'border-slate-300 focus:border-blue-600'
                            }`}
                            placeholder="e.g. Maharashtra"
                        />
                        {touched.state && errors.state && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3" /> {errors.state}
                            </p>
                        )}
                    </div>

                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center justify-between">
                            <span>{t('pincodeLabel')}</span>
                            <span className="text-[10px] text-slate-500 font-mono">6-DIGIT CODE</span>
                        </label>
                        <input
                            type="text"
                            name="pincode"
                            maxLength="6"
                            required
                            value={formData.pincode}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className={`w-full rounded-xl border p-2.5 text-xs font-mono focus:outline-none ${
                                touched.pincode && errors.pincode
                                    ? 'border-red-400 bg-red-50/50'
                                    : 'border-slate-300 focus:border-blue-600'
                            }`}
                            placeholder="e.g. 400058"
                        />
                        <p className="text-[11px] text-slate-500 mt-1">
                            {t('pinHelp')}
                        </p>
                        {touched.pincode && errors.pincode && (
                            <p className="text-[11px] text-red-600 mt-1 flex items-center gap-1 font-medium">
                                <AlertCircle className="w-3 h-3" /> {errors.pincode}
                            </p>
                        )}
                    </div>
                </div>

                {/* 4. Map Location Picker Wrapper */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Exact Incident GPS Pinning (Optional but recommended)
                    </label>
                    <LocationPicker onLocationSelect={handleLocationSelect} />
                </div>

                {/* 5. Supporting Evidence */}
                <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        {t('evidenceLabel')}
                    </label>
                    <input
                        type="file"
                        multiple
                        onChange={handleFileChange}
                        className="w-full text-xs text-slate-500 file:mr-3 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-100 hover:file:bg-slate-200 cursor-pointer"
                    />
                    {files.length > 0 && (
                        <div className="mt-2 text-xs text-emerald-700 font-medium flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{files.length} document/photo exhibit(s) attached</span>
                        </div>
                    )}
                </div>

                {/* Submit Action */}
                <div className="pt-4 border-t border-slate-200">
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-md transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <span>{t('submittingBtn')}</span>
                        ) : (
                            <>
                                <Send className="w-4 h-4" />
                                <span>{t('submitBtn')}</span>
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default FIRForm;

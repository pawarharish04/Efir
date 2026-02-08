import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Search, Filter, BarChart2, RefreshCw, Check, X, Clock, AlertTriangle, ChevronDown, ChevronUp, MapPin, User, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { motion, AnimatePresence } from 'framer-motion';
import { API_URL } from '../config';

const OfficerDashboard = () => {
    const [firs, setFirs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedRow, setExpandedRow] = useState(null);
    const [filters, setFilters] = useState({
        city: '',
        state: '',
        type: '',
        status: ''
    });
    const socket = useSocket();

    const fetchFIRs = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (filters.city) params.append('city', filters.city);
            if (filters.state) params.append('state', filters.state);
            if (filters.type) params.append('type', filters.type);
            if (filters.status) params.append('status', filters.status);

            const res = await axios.get(`${API_URL}/api/firs/all?${params.toString()}`, {
                withCredentials: true,
            });
            setFirs(res.data.firs);
        } catch (error) {
            toast.error('Failed to fetch FIRs');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFIRs();
    }, [filters]);

    useEffect(() => {
        if (!socket) return;

        socket.on('firCreated', (newFir) => {
            toast('New FIR Received!', { icon: '🚨' });
            setFirs((prevFirs) => [newFir, ...prevFirs]);
        });

        socket.on('firUpdated', (updatedFir) => {
            setFirs((prevFirs) =>
                prevFirs.map((fir) => fir._id === updatedFir._id ? updatedFir : fir)
            );
        });

        return () => {
            socket.off('firCreated');
            socket.off('firUpdated');
        };
    }, [socket]);

    const handleStatusUpdate = async (id, newStatus, e) => {
        e?.stopPropagation(); // Prevent row toggle
        try {
            await axios.put(`${API_URL}/api/firs/update/${id}`, { status: newStatus }, {
                withCredentials: true,
            });
            // Update happens via socket, but optimistic update is good practice
            toast.success(`FIR Status updated to ${newStatus}`);
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleAddLog = async (id, entry) => {
        try {
            const res = await axios.post(`${API_URL}/api/firs/update/${id}/log`, { entry }, {
                withCredentials: true
            });

            // Optimistically update or re-fetch (simplest is to update state directly)
            setFirs(prev => prev.map(fir => {
                if (fir._id === id) {
                    return {
                        ...fir,
                        investigationLogs: [...(fir.investigationLogs || []), res.data.log]
                    };
                }
                return fir;
            }));

            toast.success('Investigation Log Added');
        } catch (error) {
            toast.error('Failed to add log');
        }
    };

    const handleAddMessage = async (id, message) => {
        try {
            const res = await axios.post(`${API_URL}/api/firs/update/${id}/message`, { message }, {
                withCredentials: true
            });

            setFirs(prev => prev.map(fir => {
                if (fir._id === id) {
                    return {
                        ...fir,
                        messages: [...(fir.messages || []), res.data.messageData]
                    };
                }
                return fir;
            }));

            toast.success('Message Sent');
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    const handleFilterChange = (e) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
    };

    const toggleRow = (id) => {
        setExpandedRow(expandedRow === id ? null : id);
    };

    // Calculate Summary Stats
    const stats = {
        total: firs.length,
        pending: firs.filter(f => f.status === 'Pending').length,
        active: firs.filter(f => f.status === 'In Progress').length,
        resolved: firs.filter(f => f.status === 'Resolved').length
    };

    const getStatusBadge = (status) => {
        const styles = {
            'Pending': 'bg-yellow-100 text-yellow-800 border-yellow-200',
            'Accepted': 'bg-indigo-100 text-indigo-800 border-indigo-200',
            'In Progress': 'bg-blue-100 text-blue-800 border-blue-200',
            'Resolved': 'bg-green-100 text-green-800 border-green-200',
            'Rejected': 'bg-red-100 text-red-800 border-red-200'
        };
        return (
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status] || 'bg-gray-100'}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Header & Stats */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Officer Dashboard</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Welcome back, Officer. Here is your daily overview.</p>
                    </div>
                    <Link
                        to="/analytics"
                        className="inline-flex items-center gap-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition shadow-sm"
                    >
                        <BarChart2 className="h-4 w-4" />
                        <span>Analytics</span>
                    </Link>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 dark:text-gray-400 text-xs font-bold uppercase tracking-wider">Total Cases</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.total}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-yellow-600 dark:text-yellow-500 text-xs font-bold uppercase tracking-wider">Pending Action</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.pending}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-blue-600 dark:text-blue-500 text-xs font-bold uppercase tracking-wider">Active Investigations</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.active}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-green-600 dark:text-green-500 text-xs font-bold uppercase tracking-wider">Tasks Resolved</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{stats.resolved}</div>
                    </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row gap-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="city"
                            placeholder="Search City..."
                            value={filters.city}
                            onChange={handleFilterChange}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                        />
                    </div>
                    <div className="relative flex-1">
                        <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            name="state"
                            placeholder="Filter State..."
                            value={filters.state}
                            onChange={handleFilterChange}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
                        />
                    </div>
                    <select
                        name="type"
                        value={filters.type}
                        onChange={handleFilterChange}
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                        <option value="">All Incident Types</option>
                        <option>Theft</option>
                        <option>Assault</option>
                        <option>Fraud</option>
                        <option>Cybercrime</option>
                        <option>Lost Property</option>
                        <option>Other</option>
                    </select>
                    <select
                        name="status"
                        value={filters.status}
                        onChange={handleFilterChange}
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 dark:text-white"
                    >
                        <option value="">All Statuses</option>
                        <option>Pending</option>
                        <option>Accepted</option>
                        <option>In Progress</option>
                        <option>Resolved</option>
                        <option>Rejected</option>
                    </select>
                </div>

                {/* Main Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                            <thead className="bg-gray-50 dark:bg-gray-700/50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Case ID</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Reported By</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Quick Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                {loading ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center">
                                            <div className="flex justify-center"><div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full"></div></div>
                                        </td>
                                    </tr>
                                ) : firs.length === 0 ? (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                                            No cases found matching your criteria.
                                        </td>
                                    </tr>
                                ) : (
                                    firs.map((fir) => (
                                        <>
                                            <tr
                                                key={fir._id}
                                                onClick={() => toggleRow(fir._id)}
                                                className={`cursor-pointer transition-colors ${expandedRow === fir._id ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
                                            >
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <FileText className="h-4 w-4 text-gray-400" />
                                                        <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">
                                                            #{fir._id.slice(-6).toUpperCase()}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex items-center">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-blue-400 to-blue-600 flex items-center justify-center text-white text-xs font-bold mr-3">
                                                            {fir.complainant?.name ? fir.complainant.name.charAt(0).toUpperCase() : 'U'}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-medium text-gray-900 dark:text-white">{fir.complainant?.name || 'Unknown'}</div>
                                                            <div className="text-xs text-gray-500 dark:text-gray-400">{fir.complainant?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className="text-sm text-gray-700 dark:text-gray-300 font-medium">{fir.incidentType}</span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 dark:text-white">{fir.city}</div>
                                                    <div className="text-xs text-gray-500">{fir.state}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    {getStatusBadge(fir.status)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                                                    <div className="flex justify-end gap-2">
                                                        {fir.status === 'Pending' && (
                                                            <button
                                                                onClick={(e) => handleStatusUpdate(fir._id, 'Accepted', e)}
                                                                className="p-1.5 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Accept"
                                                            >
                                                                <Check className="h-4 w-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={(e) => handleStatusUpdate(fir._id, 'In Progress', e)}
                                                            className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Mark In Progress"
                                                        >
                                                            <RefreshCw className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleStatusUpdate(fir._id, 'Resolved', e)}
                                                            className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors" title="Resolve"
                                                        >
                                                            <Check className="h-4 w-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => handleStatusUpdate(fir._id, 'Rejected', e)}
                                                            className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Reject"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                        {expandedRow === fir._id ? <ChevronUp className="h-4 w-4 text-gray-400 ml-2" /> : <ChevronDown className="h-4 w-4 text-gray-400 ml-2" />}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Detail View */}
                                            <AnimatePresence>
                                                {expandedRow === fir._id && (
                                                    <tr className="bg-gray-50 dark:bg-gray-800/50">
                                                        <td colSpan="6" className="px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: 'auto', opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                            >
                                                                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-sm">
                                                                    {/* Left Column: Details & Evidence */}
                                                                    <div className="space-y-6">
                                                                        <div>
                                                                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Incident Description</h4>
                                                                            <div className="text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 p-4 rounded-lg border border-gray-200 dark:border-gray-700 leading-relaxed shadow-sm">
                                                                                {fir.description}
                                                                            </div>
                                                                        </div>

                                                                        {/* Evidence */}
                                                                        {fir.evidence && fir.evidence.length > 0 && (
                                                                            <div>
                                                                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                                                                                    <span className="h-4 w-4 bg-gray-200 dark:bg-gray-600 rounded flex items-center justify-center text-[10px]">📷</span> Evidence
                                                                                </h4>
                                                                                <div className="flex flex-wrap gap-2">
                                                                                    {fir.evidence.map((path, idx) => (
                                                                                        <a
                                                                                            key={idx}
                                                                                            href={`${API_URL}/${path.replace(/\\/g, '/')}`}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className="block w-20 h-20 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-600 hover:ring-2 ring-blue-500 transition-all relative group bg-gray-100 dark:bg-gray-700"
                                                                                        >
                                                                                            {path.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                                                                                                <img
                                                                                                    src={`${API_URL}/${path.replace(/\\/g, '/')}`}
                                                                                                    alt="Evidence"
                                                                                                    className="w-full h-full object-cover"
                                                                                                />
                                                                                            ) : (
                                                                                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                                                                                    <FileText className="h-8 w-8" />
                                                                                                </div>
                                                                                            )}
                                                                                        </a>
                                                                                    ))}
                                                                                </div>
                                                                            </div>
                                                                        )}

                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div>
                                                                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Location</h4>
                                                                                <div className="text-gray-600 dark:text-gray-400 text-xs bg-gray-50 dark:bg-gray-700/30 p-2 rounded border border-gray-100 dark:border-gray-700">
                                                                                    <p className="font-medium">{fir.address}</p>
                                                                                    <p>{fir.city}, {fir.state}</p>
                                                                                    {fir.latitude && fir.longitude && (
                                                                                        <a
                                                                                            href={`https://www.google.com/maps/search/?api=1&query=${fir.latitude},${fir.longitude}`}
                                                                                            target="_blank"
                                                                                            rel="noreferrer"
                                                                                            className="mt-2 inline-flex items-center gap-1 text-blue-600 hover:underline"
                                                                                        >
                                                                                            <MapPin className="h-3 w-3" /> View Map
                                                                                        </a>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h4 className="font-semibold text-gray-700 dark:text-gray-300 mb-1">Details</h4>
                                                                                <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1">
                                                                                    <p><span className="font-semibold">Date:</span> {new Date(fir.dateOfIncident).toLocaleDateString()}</p>
                                                                                    <p><span className="font-semibold">Time:</span> {fir.timeOfIncident}</p>
                                                                                    <p><span className="font-semibold">Accused:</span> {fir.accusedName || 'Unknown'}</p>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </div>

                                                                    {/* Right Column: Investigation Logs & Actions */}
                                                                    <div className="space-y-6">
                                                                        {/* Investigation Log (Case Diary) */}
                                                                        <div className="bg-gray-50 dark:bg-gray-700/20 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                                                                            <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2">
                                                                                <FileText className="h-4 w-4" /> Case Diary (Logs)
                                                                            </h4>

                                                                            <div className="max-h-40 overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar">
                                                                                {fir.investigationLogs && fir.investigationLogs.length > 0 ? (
                                                                                    fir.investigationLogs.map((log, idx) => (
                                                                                        <div key={idx} className="text-xs bg-white dark:bg-gray-800 p-2.5 rounded border border-gray-100 dark:border-gray-700 shadow-sm relative pl-8">
                                                                                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l"></div>
                                                                                            <span className="absolute left-2.5 top-2.5 text-gray-300">•</span>
                                                                                            <p className="text-gray-700 dark:text-gray-300">{log.entry}</p>
                                                                                            <div className="flex justify-between items-center mt-1.5 text-[10px] text-gray-400">
                                                                                                <span>{log.officerName}</span>
                                                                                                <span>{new Date(log.timestamp).toLocaleString()}</span>
                                                                                            </div>
                                                                                        </div>
                                                                                    ))
                                                                                ) : (
                                                                                    <p className="text-xs text-gray-400 text-center py-2">No logs recorded yet.</p>
                                                                                )}
                                                                            </div>

                                                                            {/* Add Log Input */}
                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    id={`log-input-${fir._id}`}
                                                                                    placeholder="Add investigation update..."
                                                                                    className="flex-1 text-xs rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white px-3 py-2 focus:ring-1 focus:ring-blue-500"
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            handleAddLog(fir._id, e.target.value);
                                                                                            e.target.value = '';
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const input = document.getElementById(`log-input-${fir._id}`);
                                                                                        if (input.value) {
                                                                                            handleAddLog(fir._id, input.value);
                                                                                            input.value = '';
                                                                                        }
                                                                                    }}
                                                                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded text-xs transition-colors"
                                                                                >
                                                                                    Add
                                                                                </button>
                                                                            </div>
                                                                        </div>

                                                                        {/* Citizen Communication (Placeholder for now) */}
                                                                        <div className="bg-indigo-50 dark:bg-indigo-900/20 rounded-xl border border-indigo-100 dark:border-indigo-800 p-4">
                                                                            <div className="flex justify-between items-center mb-3">
                                                                                <h4 className="font-bold text-indigo-900 dark:text-indigo-200 text-sm flex items-center gap-2">
                                                                                    <User className="h-4 w-4" /> Citizen Chat
                                                                                </h4>
                                                                                <span className="text-[10px] bg-indigo-100 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">Live</span>
                                                                            </div>

                                                                            <div className="max-h-40 overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar flex flex-col-reverse">
                                                                                {fir.messages && fir.messages.length > 0 ? (
                                                                                    [...fir.messages].reverse().map((msg, idx) => (
                                                                                        <div key={idx} className={`flex flex-col ${msg.senderModel === 'User' && msg.role === 'officer' ? 'items-end' : 'items-start'}`}>
                                                                                            <div className={`max-w-[85%] p-2 rounded-lg text-xs ${msg.senderModel === 'User' && msg.role === 'officer'
                                                                                                ? 'bg-indigo-600 text-white rounded-tr-none'
                                                                                                : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-tl-none'
                                                                                                }`}>
                                                                                                <p>{msg.message}</p>
                                                                                            </div>
                                                                                            <span className="text-[9px] text-gray-400 mt-0.5 px-0.5">
                                                                                                {msg.senderName} • {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                                                            </span>
                                                                                        </div>
                                                                                    ))
                                                                                ) : (
                                                                                    <p className="text-xs text-indigo-400 text-center py-4">Start a conversation with the complainant.</p>
                                                                                )}
                                                                            </div>

                                                                            <div className="flex gap-2">
                                                                                <input
                                                                                    type="text"
                                                                                    id={`msg-input-${fir._id}`}
                                                                                    placeholder="Type message to citizen..."
                                                                                    className="flex-1 text-xs rounded border-indigo-200 dark:border-indigo-800 dark:bg-indigo-950/30 dark:text-white px-3 py-2 focus:ring-1 focus:ring-indigo-500 placeholder-indigo-300"
                                                                                    onKeyDown={(e) => {
                                                                                        if (e.key === 'Enter') {
                                                                                            handleAddMessage(fir._id, e.target.value);
                                                                                            e.target.value = '';
                                                                                        }
                                                                                    }}
                                                                                />
                                                                                <button
                                                                                    onClick={() => {
                                                                                        const input = document.getElementById(`msg-input-${fir._id}`);
                                                                                        if (input.value) {
                                                                                            handleAddMessage(fir._id, input.value);
                                                                                            input.value = '';
                                                                                        }
                                                                                    }}
                                                                                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded text-xs transition-colors"
                                                                                >
                                                                                    <span className="text-[10px] font-bold">SEND</span>
                                                                                </button>
                                                                            </div>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </motion.div>
                                                        </td>
                                                    </tr>
                                                )}
                                            </AnimatePresence>
                                        </>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OfficerDashboard;

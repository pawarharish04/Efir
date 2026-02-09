import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Search, Filter, Clock, CheckCircle, XCircle, AlertCircle, Download, FileText, ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSocket } from '../context/SocketContext';
import { toast } from 'react-hot-toast';
import StatusTimeline from './StatusTimeline';
import { generateFIRPDF } from '../utils/pdfGenerator';


const FIRList = () => {
    const [firs, setFirs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [expandedFir, setExpandedFir] = useState(null);
    const socket = useSocket();

    useEffect(() => {
        const fetchFIRs = async () => {
            try {
                const res = await api.get('/api/firs/my-firs');
                setFirs(res.data.firs);
            } catch (error) {
                console.error('Error fetching FIRs:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFIRs();
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('firUpdated', (updatedFir) => {
            setFirs((prevFirs) => {
                const exists = prevFirs.find(f => f._id === updatedFir._id);
                if (exists) {
                    toast.success(`Status updated for FIR #${updatedFir._id.slice(-6).toUpperCase()}`);
                    return prevFirs.map((fir) => fir._id === updatedFir._id ? updatedFir : fir);
                }
                return prevFirs;
            });
        });

        return () => {
            socket.off('firUpdated');
        };
    }, [socket]);

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
            case 'Accepted': return 'text-indigo-600 bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400';
            case 'In Progress': return 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400';
            case 'Resolved': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
            case 'Rejected': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
            default: return 'text-gray-600 bg-gray-100';
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return <Clock className="h-4 w-4" />;
            case 'Accepted': return <CheckCircle className="h-4 w-4" />;
            case 'In Progress': return <AlertCircle className="h-4 w-4" />;
            case 'Resolved': return <CheckCircle className="h-4 w-4" />;
            case 'Rejected': return <XCircle className="h-4 w-4" />;
            default: return null;
        }
    }

    const filteredFirs = firs.filter(fir => {
        const matchesSearch = fir.incidentType.toLowerCase().includes(searchTerm.toLowerCase()) ||
            fir._id.includes(searchTerm) ||
            fir.description.toLowerCase().includes(searchTerm);
        const matchesFilter = filterStatus === 'All' || fir.status === filterStatus;
        return matchesSearch && matchesFilter;
    });

    const toggleExpand = (id) => {
        setExpandedFir(expandedFir === id ? null : id);
    };

    const handleAddMessage = async (id, message) => {
        try {
            const res = await api.post(`/api/firs/update/${id}/message`, { message });

            setFirs(prev => prev.map(fir => {
                if (fir._id === id) {
                    return {
                        ...fir,
                        messages: [...(fir.messages || []), res.data.messageData]
                    };
                }
                return fir;
            }));

            toast.success('Message sent to officer');
        } catch (error) {
            toast.error('Failed to send message');
        }
    };

    if (loading) {
        return <div className="flex justify-center p-8"><div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm">
                <div className="relative w-full sm:w-96">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by ID, Type, or Description..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <Filter className="h-5 w-5 text-gray-500" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                    >
                        <option value="All">All Status</option>
                        <option value="Pending">Pending</option>
                        <option value="Accepted">Accepted</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Resolved">Resolved</option>
                        <option value="Rejected">Rejected</option>
                    </select>
                </div>
            </div>

            <div className="grid gap-4">
                {filteredFirs.length === 0 ? (
                    <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                        <p className="text-gray-500 dark:text-gray-400">No FIRs found matching your criteria.</p>
                    </div>
                ) : (
                    filteredFirs.map((fir) => (
                        <motion.div
                            key={fir._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 dark:border-gray-700"
                        >
                            <div className="p-6">
                                <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-xs font-mono bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-gray-600 dark:text-gray-300">#{fir._id.slice(-6).toUpperCase()}</span>
                                            <span className="font-bold text-lg text-gray-900 dark:text-white">{fir.incidentType}</span>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            Filed on {new Date(fir.createdAt).toLocaleDateString()} at {new Date(fir.createdAt).toLocaleTimeString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(fir.status)}`}>
                                            {getStatusIcon(fir.status)}
                                            {fir.status}
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    {/* Case Timeline Visual */}
                                    <StatusTimeline currentStatus={fir.status} />
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 dark:text-gray-400 border-t dark:border-gray-700 pt-4">
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase font-semibold">Date of Incident</span>
                                        {new Date(fir.dateOfIncident).toLocaleDateString()}
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase font-semibold">Location</span>
                                        {fir.city}, {fir.state}
                                    </div>
                                    <div>
                                        <span className="block text-xs text-gray-400 uppercase font-semibold">Investigation</span>
                                        {fir.assignedOfficer ? 'Officer Assigned' : 'Pending Assignment'}
                                    </div>

                                    <div className="flex justify-end items-center gap-2">
                                        <button
                                            onClick={() => generateFIRPDF(fir)}
                                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400 rounded-lg hover:bg-blue-100 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Download PDF
                                        </button>
                                        <button
                                            onClick={() => toggleExpand(fir._id)}
                                            className="p-1.5 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                                        >
                                            {expandedFir === fir._id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Expanded Details */}
                                <AnimatePresence>
                                    {expandedFir === fir._id && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700 overflow-hidden"
                                        >
                                            <div className="grid md:grid-cols-2 gap-6">
                                                <div className="space-y-6">
                                                    <div>
                                                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                                            <FileText className="w-4 h-4 text-gray-500" />
                                                            Full Description
                                                        </h4>
                                                        <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed bg-gray-50 dark:bg-gray-900/50 p-3 rounded-lg border border-gray-100 dark:border-gray-700">
                                                            {fir.description}
                                                        </p>
                                                    </div>

                                                    <div className="space-y-4 text-sm">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Exact Address</h4>
                                                            <p className="text-gray-600 dark:text-gray-400">{fir.address}</p>
                                                            <p className="text-gray-600 dark:text-gray-400">{fir.pincode}</p>
                                                        </div>
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900 dark:text-white mb-1">Accused Information</h4>
                                                            <p className="text-gray-600 dark:text-gray-400">{fir.accusedName || 'Not specified by complainant'}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Chat Section */}
                                                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-100 dark:border-blue-800 p-4 h-full flex flex-col">
                                                    <div className="flex justify-between items-center mb-3">
                                                        <h4 className="font-bold text-blue-900 dark:text-blue-200 text-sm flex items-center gap-2">
                                                            👮‍♂️ Police Communication
                                                        </h4>
                                                        <span className="text-[10px] bg-blue-100 dark:bg-blue-800 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full">Secure</span>
                                                    </div>

                                                    <div className="flex-1 min-h-[150px] max-h-[250px] overflow-y-auto space-y-3 mb-3 pr-1 custom-scrollbar flex flex-col-reverse">
                                                        {fir.messages && fir.messages.length > 0 ? (
                                                            [...fir.messages].reverse().map((msg, idx) => (
                                                                <div key={idx} className={`flex flex-col ${msg.senderModel === 'User' && msg.role === 'citizen' ? 'items-end' : 'items-start'}`}>
                                                                    <div className={`max-w-[90%] p-2 rounded-lg text-xs ${msg.senderModel === 'User' && msg.role === 'citizen'
                                                                        ? 'bg-blue-600 text-white rounded-tr-none'
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
                                                            <p className="text-xs text-blue-400 text-center my-auto">No messages yet. Use this to chat with the assigned officer.</p>
                                                        )}
                                                    </div>

                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            id={`msg-input-${fir._id}`}
                                                            placeholder="Reply to officer..."
                                                            className="flex-1 text-xs rounded border-blue-200 dark:border-blue-800 dark:bg-blue-950/30 dark:text-white px-3 py-2 focus:ring-1 focus:ring-blue-500 placeholder-blue-300"
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
                                                            className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg text-xs transition-colors"
                                                        >
                                                            Send
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>
        </div >
    );
};

export default FIRList;

import { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Shield, UserCheck, Users, AlertTriangle, Trash2, Check, X } from 'lucide-react';

const AdminDashboard = () => {
    const [stats, setStats] = useState({ citizens: 0, officers: 0, pendingOfficers: 0, firs: 0 });
    const [officers, setOfficers] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            const [statsRes, officersRes] = await Promise.all([
                axios.get('http://localhost:5000/api/admin/stats', { withCredentials: true }),
                axios.get('http://localhost:5000/api/admin/officers', { withCredentials: true })
            ]);
            setStats(statsRes.data.stats);
            setOfficers(officersRes.data.officers);
        } catch (error) {
            toast.error('Failed to load admin data');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleApproveOfficer = async (id) => {
        try {
            await axios.put(`http://localhost:5000/api/admin/approve-officer/${id}`, {}, { withCredentials: true });
            toast.success('Officer Approved');
            fetchData(); // Refresh list
        } catch (error) {
            toast.error('Failed to approve officer');
        }
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await axios.delete(`http://localhost:5000/api/admin/user/${id}`, { withCredentials: true });
            toast.success('User Deleted');
            fetchData();
        } catch (error) {
            toast.error('Failed to delete user');
        }
    };

    if (loading) return <div className="h-screen flex items-center justify-center"><div className="animate-spin h-8 w-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 font-sans">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center gap-3">
                    <div className="bg-red-600 p-2 rounded-lg">
                        <Shield className="h-6 w-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Control Center</h1>
                        <p className="text-gray-500 text-sm">Manage system access and oversight.</p>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 text-xs font-bold uppercase">Total Citizens</div>
                        <div className="text-2xl font-bold mt-1 dark:text-white">{stats.citizens}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 text-xs font-bold uppercase">Total Officers</div>
                        <div className="text-2xl font-bold mt-1 dark:text-white">{stats.officers}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-red-100 dark:border-red-900/30">
                        <div className="text-red-500 text-xs font-bold uppercase flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" /> Pending Approval
                        </div>
                        <div className="text-2xl font-bold mt-1 text-red-600 dark:text-red-400">{stats.pendingOfficers}</div>
                    </div>
                    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
                        <div className="text-gray-500 text-xs font-bold uppercase">Total FIRs</div>
                        <div className="text-2xl font-bold mt-1 dark:text-white">{stats.firs}</div>
                    </div>
                </div>

                {/* Officers Table */}
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700">
                    <div className="p-6 border-b border-gray-100 dark:border-gray-700">
                        <h2 className="text-lg font-bold text-gray-900 dark:text-white">Officer Management</h2>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 font-semibold">
                                <tr>
                                    <th className="px-6 py-3">Name</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Department</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {officers.map(officer => (
                                    <tr key={officer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{officer.name}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{officer.email}</td>
                                        <td className="px-6 py-4 text-gray-600 dark:text-gray-400 text-sm">{officer.department || 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            {officer.isApproved ? (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                                    <Check className="h-3 w-3" /> Approved
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                                    <AlertTriangle className="h-3 w-3" /> Pending
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right flex justify-end gap-2">
                                            {!officer.isApproved && (
                                                <button
                                                    onClick={() => handleApproveOfficer(officer._id)}
                                                    className="p-1.5 bg-green-50 text-green-600 rounded hover:bg-green-100 transition-colors"
                                                    title="Approve Officer"
                                                >
                                                    <UserCheck className="h-4 w-4" />
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDeleteUser(officer._id)}
                                                className="p-1.5 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                                title="Delete User"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                                {officers.length === 0 && (
                                    <tr>
                                        <td colSpan="5" className="px-6 py-8 text-center text-gray-500">No officers found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

import { useState, useEffect } from 'react';
import api from '../api/axios';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Bar, Pie, Doughnut } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Activity, CheckCircle, Clock, XCircle, AlertTriangle, MapPin, BarChart3, PieChart } from 'lucide-react';


// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement
);

const AnalyticsDashboard = () => {
    const [data, setData] = useState(null);
    const [locations, setLocations] = useState([]);
    const [statusData, setStatusData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const res = await api.get('/api/firs/analytics');
                setData(res.data.stats);
                setLocations(res.data.locations || []);
                setStatusData(res.data.statusDistribution);
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, []);

    if (loading) {
        return <div className="min-h-screen flex justify-center items-center"><div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div></div>;
    }

    if (!data) return <div className="text-center p-10">No data available</div>;

    // Modern Color Palette
    const colors = {
        primary: 'rgb(59, 130, 246)',
        success: 'rgb(16, 185, 129)',
        warning: 'rgb(245, 158, 11)',
        danger: 'rgb(239, 68, 68)',
        indigo: 'rgb(99, 102, 241)',
        purple: 'rgb(168, 85, 247)',
        teal: 'rgb(20, 184, 166)'
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    color: '#9CA3AF', // Gray-400
                    font: {
                        family: "'Inter', sans-serif",
                    }
                }
            },
            title: {
                display: false,
            },
        },
        scales: {
            x: {
                grid: { display: false, color: '#374151' },
                ticks: { color: '#9CA3AF' }
            },
            y: {
                grid: { color: '#374151' }, // Darker grid lines for dark mode
                ticks: { color: '#9CA3AF' }
            }
        }
    };

    // Simplified stats for Pie/Doughnut without axes
    const simpleChartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'right',
                labels: { color: '#9CA3AF' }
            }
        }
    };

    const cityChartData = {
        labels: data.byCity.map(item => item._id),
        datasets: [
            {
                label: 'FIRs by City',
                data: data.byCity.map(item => item.count),
                backgroundColor: colors.primary,
                borderRadius: 4,
            },
        ],
    };

    const typeChartData = {
        labels: data.byType.map(item => item._id),
        datasets: [
            {
                label: '# of Cases',
                data: data.byType.map(item => item.count),
                backgroundColor: [colors.danger, colors.indigo, colors.warning, colors.teal, colors.purple, colors.success],
                borderWidth: 0,
            },
        ],
    };

    const statusChartData = {
        labels: ['Pending', 'Accepted', 'In Progress', 'Resolved', 'Rejected'],
        datasets: [
            {
                data: [
                    statusData?.pending || 0,
                    statusData?.accepted || 0,
                    statusData?.inProgress || 0,
                    statusData?.resolved || 0,
                    statusData?.rejected || 0
                ],
                backgroundColor: [colors.warning, colors.indigo, colors.primary, colors.success, colors.danger],
                borderWidth: 0,
            },
        ],
    };

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 font-sans">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics Overview</h1>
                        <p className="text-gray-500 dark:text-gray-400">Real-time insights and crime statistics</p>
                    </div>
                    <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <Clock className="w-4 h-4" /> Last 30 Days
                        </button>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard
                        title="Total Reports"
                        value={data.total}
                        icon={<Activity className="w-6 h-6 text-blue-500" />}
                        bg="bg-blue-50 dark:bg-blue-900/20"
                        borderColor="border-blue-500"
                    />
                    <StatCard
                        title="Pending Review"
                        value={statusData?.pending || 0}
                        icon={<AlertTriangle className="w-6 h-6 text-amber-500" />}
                        bg="bg-amber-50 dark:bg-amber-900/20"
                        borderColor="border-amber-500"
                    />
                    <StatCard
                        title="Cases Solved"
                        value={statusData?.resolved || 0}
                        icon={<CheckCircle className="w-6 h-6 text-green-500" />}
                        bg="bg-green-50 dark:bg-green-900/20"
                        borderColor="border-green-500"
                    />
                    <StatCard
                        title="Action Required"
                        value={(statusData?.pending || 0) + (statusData?.inProgress || 0)}
                        icon={<Clock className="w-6 h-6 text-indigo-500" />}
                        bg="bg-indigo-50 dark:bg-indigo-900/20"
                        borderColor="border-indigo-500"
                    />
                </div>

                {/* Main Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Bar Chart - 2 Cols */}
                    <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <BarChart3 className="w-5 h-5 text-gray-400" />
                                Regional Distribution
                            </h3>
                        </div>
                        <div className="h-80">
                            <Bar data={cityChartData} options={chartOptions} />
                        </div>
                    </div>

                    {/* Donut Chart - 1 Col */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                <PieChart className="w-5 h-5 text-gray-400" />
                                Case Status
                            </h3>
                        </div>
                        <div className="h-64 flex justify-center items-center relative">
                            <Doughnut data={statusChartData} options={simpleChartOptions} />
                            {/* Center Text */}
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center mt-4 mr-16">
                                    {/* Margin adjustment for legend offset */}
                                    <span className="text-3xl font-bold text-gray-900 dark:text-white">{data.total}</span>
                                    <span className="block text-xs text-gray-500">Total</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Secondary Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Crime Type Breakdown */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <Activity className="w-5 h-5 text-gray-400" />
                            Crime Category Breakdown
                        </h3>
                        <div className="h-64">
                            <Pie data={typeChartData} options={simpleChartOptions} />
                        </div>
                    </div>

                    {/* Map Section */}
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-gray-400" />
                            Geo-Hotspots
                        </h3>
                        <div className="h-64 w-full rounded-xl overflow-hidden shadow-inner border border-gray-200 dark:border-gray-600">
                            <MapContainer
                                center={[20.5937, 78.9629]} // Center of India loosely
                                zoom={4}
                                style={{ height: '100%', width: '100%' }}
                            >
                                <TileLayer
                                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                                />
                                {locations.map((loc, idx) => (
                                    loc.latitude && loc.longitude && (
                                        <Marker key={idx} position={[loc.latitude, loc.longitude]}>
                                            <Popup>
                                                <div className="text-sm font-sans">
                                                    <strong className="block text-indigo-600 mb-1">{loc.incidentType}</strong>
                                                    {loc.description.substring(0, 50)}...
                                                </div>
                                            </Popup>
                                        </Marker>
                                    )
                                ))}
                            </MapContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Reusable Stat Card Component
const StatCard = ({ title, value, icon, bg, borderColor }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border-b-4 ${borderColor} hover:shadow-md transition-shadow`}
    >
        <div className="flex items-center justify-between mb-4">
            <div className={`p-3 rounded-xl ${bg}`}>
                {icon}
            </div>
            <span className="text-xs font-semibold text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
                Today
            </span>
        </div>
        <div>
            <h3 className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
    </motion.div>
);

export default AnalyticsDashboard;

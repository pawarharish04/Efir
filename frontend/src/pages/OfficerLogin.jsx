import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Lock, Shield, ArrowRight, BadgeCheck } from 'lucide-react';

const OfficerLogin = () => {
    const [badgeId, setBadgeId] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            // Pass badgeId instead of email
            const user = await login(null, password, badgeId);
            if (user.role === 'officer' || user.role === 'admin') {
                navigate('/officer-dashboard');
            } else {
                // Should not happen if backend logic is correct, but safe fallback
                navigate('/');
            }
        } catch (error) {
            // Error handled in context
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 z-0 opacity-10">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-2xl shadow-2xl border border-gray-700 z-10"
            >
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-blue-900/50 rounded-full flex items-center justify-center mb-4 border border-blue-500/30">
                        <Shield className="h-8 w-8 text-blue-400" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-white tracking-tight">
                        Officer Portal
                    </h2>
                    <p className="mt-2 text-sm text-gray-400">
                        Authorized Personnel Only
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm space-y-4">
                        <div className="relative group">
                            <BadgeCheck className="absolute top-3 left-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                id="badge-id"
                                name="badgeId"
                                type="text"
                                required
                                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-600 bg-gray-700/50 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Badge ID"
                                value={badgeId}
                                onChange={(e) => setBadgeId(e.target.value)}
                            />
                        </div>
                        <div className="relative group">
                            <Lock className="absolute top-3 left-3 h-5 w-5 text-gray-500 group-focus-within:text-blue-400 transition-colors" />
                            <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                className="appearance-none rounded-lg relative block w-full px-10 py-3 border border-gray-600 bg-gray-700/50 placeholder-gray-500 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all shadow-lg hover:shadow-blue-500/30"
                        >
                            <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                {isLoading ? (
                                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                                ) : (
                                    <ArrowRight className="h-5 w-5 text-blue-300 group-hover:text-white transition-colors" />
                                )}
                            </span>
                            {isLoading ? 'Verifying Credentials...' : 'Secure Login'}
                        </button>
                    </div>

                    <div className="text-center mt-4">
                        <Link to="/login" className="text-sm text-gray-500 hover:text-gray-300 transition-colors">
                            Return to Citizen Login
                        </Link>
                    </div>
                </form>
            </motion.div>
        </div>
    );
};

export default OfficerLogin;

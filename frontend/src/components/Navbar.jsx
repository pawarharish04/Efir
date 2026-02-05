import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, User, Menu, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    return (
        <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                            <Shield className="h-8 w-8 text-blue-600" />
                            <span className="font-bold text-xl tracking-tight text-gray-900 dark:text-white">E-FIR Portal</span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center space-x-4">
                        <Link to="/" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Home</Link>

                        {user ? (
                            <>
                                {user.role === 'citizen' && (
                                    <Link to="/citizen-dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
                                )}
                                {(user.role === 'officer' || user.role === 'admin') && (
                                    <Link to="/officer-dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Officer Dashboard</Link>
                                )}
                                {user.role === 'admin' && (
                                    <Link to="/admin-dashboard" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Admin Panel</Link>
                                )}
                                <div className="flex items-center gap-2 ml-4">
                                    <span className="text-sm text-gray-500 dark:text-gray-400">Hi, {user.name}</span>
                                    <button
                                        onClick={handleLogout}
                                        className="flex items-center gap-1 bg-red-50 text-red-600 hover:bg-red-100 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                                    >
                                        <LogOut className="h-4 w-4" />
                                        Logout
                                    </button>
                                </div>
                            </>
                        ) : (
                            <>
                                <Link to="/login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Login</Link>
                                <Link to="/officer-login" className="text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">Officer Portal</Link>
                                <Link to="/register" className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium transition-colors">Register</Link>
                            </>
                        )}
                    </div>

                    <div className="flex items-center md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-blue-600 focus:outline-none"
                        >
                            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden bg-white dark:bg-gray-900 border-t dark:border-gray-800"
                    >
                        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                            <Link to="/" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Home</Link>
                            {user ? (
                                <>
                                    {user.role === 'citizen' && (
                                        <Link to="/citizen-dashboard" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Dashboard</Link>
                                    )}
                                    {(user.role === 'officer' || user.role === 'admin') && (
                                        <Link to="/officer-dashboard" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Officer Dashboard</Link>
                                    )}
                                    {user.role === 'admin' && (
                                        <Link to="/admin-dashboard" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Admin Panel</Link>
                                    )}
                                    <button
                                        onClick={handleLogout}
                                        className="w-full text-left block text-red-600 hover:bg-red-50 px-3 py-2 rounded-md text-base font-medium"
                                    >
                                        Logout
                                    </button>
                                </>
                            ) : (
                                <>
                                    <Link to="/login" className="block text-gray-700 dark:text-gray-300 hover:text-blue-600 px-3 py-2 rounded-md text-base font-medium">Login</Link>
                                    <Link to="/register" className="block text-blue-600 font-bold px-3 py-2 rounded-md text-base">Register</Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;

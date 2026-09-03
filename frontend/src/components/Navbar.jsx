import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, LogOut, Menu, X, PhoneCall, Radio, FileText, User } from 'lucide-react';
import { useState } from 'react';
import LanguageSelector from './LanguageSelector';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const getDashboardPath = () => {
        if (!user) return '/login';
        if (user.role === 'admin') return '/admin/dashboard';
        if (user.role === 'officer') return '/officer/dashboard';
        return '/citizen/dashboard';
    };

    return (
        <header className="sticky top-0 z-50 shadow-md">
            {/* Top Statutory Ticker */}
            <div className="bg-slate-950 text-slate-300 px-4 sm:px-6 lg:px-8 py-1.5 text-[11px] flex justify-between items-center font-mono border-b border-slate-800">
                <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1.5 text-red-400 font-bold tracking-wider">
                        <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                        POLICE-NET SECURE
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-slate-400 hidden sm:inline">National Law Enforcement Legal Registry (Sec 154 CrPC)</span>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                    <span className="text-amber-400 font-bold flex items-center gap-1">
                        <PhoneCall className="w-3 h-3" /> Emergency: 112
                    </span>
                    <span className="text-slate-500 hidden md:inline">|</span>
                    <span className="text-slate-300 hidden md:inline">Cyber Helpline: 1930</span>
                </div>
            </div>

            {/* Main Navigation Bar */}
            <div className="bg-slate-900 border-b border-slate-800 text-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Emblem & Brand Title */}
                        <Link to={user ? getDashboardPath() : '/'} className="flex items-center gap-3 group">
                            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md border border-blue-400/30 group-hover:bg-blue-500 transition-colors">
                                <Shield className="h-5 w-5 text-amber-300" />
                            </div>
                            <div>
                                <div className="flex items-center gap-2">
                                    <span className="font-extrabold text-base tracking-tight text-white block leading-tight">
                                        National e-FIR
                                    </span>
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30 font-mono">
                                        GOV.IN
                                    </span>
                                </div>
                                <span className="text-[11px] text-slate-400 block font-medium">
                                    Digital Police Services Portal
                                </span>
                            </div>
                        </Link>

                        {/* Desktop Links */}
                        <div className="hidden md:flex items-center gap-6 text-xs font-semibold">
                            <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                                Home
                            </Link>

                            <Link to="/anonymous-report" className="text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                                <span>Anonymous Report</span>
                            </Link>

                            {user ? (
                                <>
                                    {user.role === 'citizen' && (
                                        <Link to="/citizen/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5">
                                            <FileText className="w-3.5 h-3.5" />
                                            <span>My Cases</span>
                                        </Link>
                                    )}

                                    {(user.role === 'officer' || user.role === 'admin') && (
                                        <Link to="/officer/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center gap-1.5">
                                            <Radio className="w-3.5 h-3.5 text-red-400" />
                                            <span>Officer Console</span>
                                        </Link>
                                    )}

                                    {(user.role === 'officer' || user.role === 'admin') && (
                                        <Link to="/analytics" className="text-slate-300 hover:text-white transition-colors">
                                            Crime Analytics
                                        </Link>
                                    )}

                                    {user.role === 'admin' && (
                                        <Link to="/admin/dashboard" className="text-blue-400 hover:text-blue-300 transition-colors">
                                            Admin Panel
                                        </Link>
                                    )}

                                    <div className="h-4 w-px bg-slate-700" />

                                    <div className="flex items-center gap-3">
                                        <div className="text-right leading-tight">
                                            <div className="text-xs font-bold text-white">{user.name}</div>
                                            <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
                                                {user.badgeId ? `Badge #${user.badgeId}` : user.role}
                                            </div>
                                        </div>
                                        <button
                                            onClick={handleLogout}
                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold transition-colors"
                                        >
                                            <LogOut className="w-3.5 h-3.5 text-red-400" />
                                            <span>Logout</span>
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center gap-3">
                                    <Link
                                        to="/login"
                                        className="px-3.5 py-1.5 text-xs text-slate-200 hover:text-white rounded-lg border border-slate-700 hover:border-slate-500 bg-slate-800/80 transition-colors font-medium"
                                    >
                                        Citizen Login
                                    </Link>
                                    <Link
                                        to="/officer-login"
                                        className="px-3.5 py-1.5 text-xs text-amber-300 bg-amber-950/60 hover:bg-amber-900/60 rounded-lg border border-amber-600/40 transition-colors font-bold"
                                    >
                                        Officer Clearance
                                    </Link>
                                    <Link
                                        to="/register"
                                        className="px-4 py-1.5 text-xs bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg shadow-sm transition-colors"
                                    >
                                        Register
                                    </Link>
                                </div>
                            )}

                            {/* Regional Language Selector */}
                            <div className="h-4 w-px bg-slate-700" />
                            <LanguageSelector variant="dark" />
                        </div>

                        {/* Mobile Toggle Button */}
                        <div className="md:hidden flex items-center">
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="p-2 text-slate-300 hover:text-white"
                            >
                                {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 py-3 space-y-2 text-xs font-semibold text-slate-200">
                    <Link to="/" onClick={() => setIsOpen(false)} className="block py-1.5 text-slate-300">Home</Link>
                    <Link to="/anonymous-report" onClick={() => setIsOpen(false)} className="block py-1.5 text-amber-400">Anonymous Report</Link>
                    {user ? (
                        <>
                            {user.role === 'citizen' && (
                                <Link to="/citizen/dashboard" onClick={() => setIsOpen(false)} className="block py-1.5 text-blue-400 font-bold">My Cases</Link>
                            )}
                            {(user.role === 'officer' || user.role === 'admin') && (
                                <Link to="/officer/dashboard" onClick={() => setIsOpen(false)} className="block py-1.5 text-blue-400 font-bold">Officer Console</Link>
                            )}
                            {user.role === 'admin' && (
                                <Link to="/admin/dashboard" onClick={() => setIsOpen(false)} className="block py-1.5 text-blue-400 font-bold">Admin Panel</Link>
                            )}
                            <button
                                onClick={() => { setIsOpen(false); handleLogout(); }}
                                className="w-full text-left py-1.5 text-red-400 font-bold"
                            >
                                Sign Out
                            </button>
                        </>
                    ) : (
                        <div className="pt-2 space-y-2">
                            <Link to="/login" onClick={() => setIsOpen(false)} className="block text-center py-2 border border-slate-700 bg-slate-800 rounded-lg text-slate-200">Citizen Login</Link>
                            <Link to="/officer-login" onClick={() => setIsOpen(false)} className="block text-center py-2 border border-amber-600/40 bg-amber-950/60 text-amber-300 rounded-lg font-bold">Officer Portal</Link>
                            <Link to="/register" onClick={() => setIsOpen(false)} className="block text-center py-2 bg-blue-600 text-white rounded-lg font-bold">Register</Link>
                        </div>
                    )}
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-medium">Select Language:</span>
                        <LanguageSelector variant="dark" />
                    </div>
                </div>
            )}
        </header>
    );
};

export default Navbar;
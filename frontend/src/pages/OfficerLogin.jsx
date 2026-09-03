import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Lock, Shield, BadgeCheck, Mail, AlertCircle, CheckCircle2, Radio, KeyRound } from 'lucide-react';
import { getRoleDashboardPath } from '../App';

const OfficerLogin = () => {
    const [loginMode, setLoginMode] = useState('badge'); // 'badge' or 'email'
    const [badgeId, setBadgeId] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsLoading(true);

        try {
            const user = loginMode === 'badge'
                ? await login(null, password, badgeId.trim())
                : await login(email.trim(), password, null);

            navigate(getRoleDashboardPath(user.role), { replace: true });
        } catch (error) {
            setErrorMsg(error.response?.data?.message || 'Authentication failed. Please verify credentials.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-[88vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 font-sans bg-slate-950 text-slate-100">
            <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
                {/* Tactical Top Accent Light */}
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-blue-500 to-indigo-500"></div>

                {/* Header */}
                <div className="text-center space-y-2 pt-2">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/20 to-blue-600/20 border border-amber-500/40 text-amber-400 flex items-center justify-center mx-auto shadow-lg">
                        <Shield className="h-7 w-7 text-amber-300" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-950/80 text-amber-400 border border-amber-700/60 font-mono text-[10px] font-bold tracking-widest uppercase mb-1">
                            <Radio className="w-3 h-3 text-red-500 animate-pulse" />
                            POLICE DISPATCH TERMINAL
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">
                            Officer Clearance Console
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Law Enforcement Personnel & Case Investigation Desk
                        </p>
                    </div>
                </div>

                {/* Dual Mode Switcher: Badge ID vs Registered Email */}
                <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800 text-xs font-bold">
                    <button
                        type="button"
                        onClick={() => { setLoginMode('badge'); setErrorMsg(''); }}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            loginMode === 'badge'
                                ? 'bg-amber-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <BadgeCheck className="w-4 h-4" />
                        <span>Police Badge ID</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => { setLoginMode('email'); setErrorMsg(''); }}
                        className={`flex-1 py-2 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            loginMode === 'email'
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'text-slate-400 hover:text-white'
                        }`}
                    >
                        <Mail className="w-4 h-4" />
                        <span>Official Email</span>
                    </button>
                </div>

                {/* Error Banner */}
                {errorMsg && (
                    <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl text-xs text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        <span>{errorMsg}</span>
                    </div>
                )}

                {/* Login Form */}
                <form className="space-y-4 text-xs" onSubmit={handleSubmit}>
                    {loginMode === 'badge' ? (
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex justify-between">
                                <span>Official Police Badge ID</span>
                                <span className="text-[10px] text-amber-400 font-mono">e.g. MH-POL-1001</span>
                            </label>
                            <div className="relative">
                                <BadgeCheck className="absolute top-3 left-3 h-4 w-4 text-amber-400" />
                                <input
                                    type="text"
                                    required
                                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-700 bg-slate-950 rounded-xl focus:border-amber-500 focus:outline-none text-white font-mono uppercase tracking-wider"
                                    placeholder="Enter Badge Number"
                                    value={badgeId}
                                    onChange={(e) => setBadgeId(e.target.value.toUpperCase())}
                                />
                            </div>
                        </div>
                    ) : (
                        <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5 flex justify-between">
                                <span>Official Police Email</span>
                                <span className="text-[10px] text-blue-400 font-mono">Registered ID</span>
                            </label>
                            <div className="relative">
                                <Mail className="absolute top-3 left-3 h-4 w-4 text-blue-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-700 bg-slate-950 rounded-xl focus:border-blue-500 focus:outline-none text-white"
                                    placeholder="officer@police.gov.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                            Passkey Credentials
                        </label>
                        <div className="relative">
                            <Lock className="absolute top-3 left-3 h-4 w-4 text-slate-500" />
                            <input
                                type="password"
                                required
                                className="w-full pl-9 pr-3 py-2.5 text-xs border border-slate-700 bg-slate-950 rounded-xl focus:border-amber-500 focus:outline-none text-white"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full py-3.5 px-4 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 disabled:opacity-50 transition-all uppercase font-mono tracking-wider shadow-lg flex items-center justify-center gap-2"
                    >
                        <KeyRound className="w-4 h-4" />
                        <span>{isLoading ? 'Verifying Credentials...' : 'Authenticate Officer Terminal'}</span>
                    </button>
                </form>

                {/* Officer Clearance Notice */}
                <div className="p-3 bg-slate-950/90 border border-slate-800 rounded-xl text-[11px] space-y-1">
                    <span className="font-bold text-slate-400 block">Law Enforcement Verification Notice:</span>
                    <p className="text-slate-500 text-[10px]">
                        Officer access is strictly restricted to verified personnel with an active territorial Police Badge ID or official department email.
                    </p>
                </div>

                {/* Return to Citizen portal */}
                <div className="pt-2 border-t border-slate-800 text-center text-xs">
                    <Link to="/login" className="text-slate-400 hover:text-white transition-colors font-mono">
                        &larr; Return to Public Citizen Portal
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OfficerLogin;
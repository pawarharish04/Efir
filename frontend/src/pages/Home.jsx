import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import AIChatbot from '../components/AIChatbot';
import { Shield, Phone, Clock as ClockIcon, AlertTriangle, FileText, Activity, Lock, ArrowRight, CheckCircle, Users, BarChart } from 'lucide-react';

const Home = () => {
    const [time, setTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    const features = [
        {
            icon: <FileText className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
            title: "Instant Registration",
            desc: "File an FIR securely from any location without visiting the station immediately. Quick, easy, and legally compliant."
        },
        {
            icon: <Activity className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />,
            title: "Live Status Tracking",
            desc: "Monitor the progress of your case in real-time. Receive automated notifications and official updates instantly."
        },
        {
            icon: <Lock className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />,
            title: "Secure Digital Records",
            desc: "All your documents and evidence are encrypted with military-grade security and stored permanently in our digital vaults."
        }
    ];

    const stats = [
        { label: "Cases Registered", value: "12,500+" },
        { label: "Cases Solved", value: "9,800+" },
        { label: "Officers Active", value: "1,200+" },
        { label: "Response Time", value: "< 15 Mins" },
    ];

    const steps = [
        {
            id: 1,
            title: "Login / Register",
            desc: "Create an secure account using your email and mobile number verification."
        },
        {
            id: 2,
            title: "File Complaint",
            desc: "Fill in the detailed FIR form with incident description, location, and evidence."
        },
        {
            id: 3,
            title: "Investigation",
            desc: "An officer is assigned to your case immediately and begins the investigation."
        },
        {
            id: 4,
            title: "Resolution",
            desc: "Track the status until final resolution and case closure report."
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300">
            {/* Hero Section */}
            <section className="relative min-h-[90vh] flex items-center bg-slate-900 text-white overflow-hidden">
                {/* Dynamic Background */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="https://images.unsplash.com/photo-1554629947-334ff61d85dc?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="City Background"
                        className="w-full h-full object-cover opacity-20"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-900/95 to-blue-900/50"></div>
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-20">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ duration: 0.6 }}
                                className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-sm"
                            >
                                <span className="flex h-2 w-2 rounded-full bg-blue-400 animate-pulse"></span>
                                <span className="text-blue-300 text-xs font-semibold tracking-wider uppercase">Official Law Enforcement Portal</span>
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight"
                            >
                                Justice <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Simplified.</span><br />
                                Safety <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Guaranteed.</span>
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.4 }}
                                className="text-xl text-gray-400 leading-relaxed max-w-xl"
                            >
                                The next-generation E-FIR system. Report incidents instantly, track investigations in real-time, and access digital legal records securely.
                            </motion.p>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.6 }}
                                className="flex flex-wrap gap-4"
                            >
                                <Link
                                    to="/register"
                                    className="inline-flex items-center px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg hover:shadow-blue-500/25 transform hover:-translate-y-1"
                                >
                                    File a Complaint
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                                <Link
                                    to="/officer-login"
                                    className="inline-flex items-center px-8 py-4 bg-slate-800 hover:bg-slate-700 text-white font-semibold rounded-xl border border-slate-700 transition-all shadow-lg hover:shadow-slate-500/10 transform hover:-translate-y-1"
                                >
                                    Officer Portal
                                </Link>
                            </motion.div>
                        </div>

                        {/* Hero Visual/Stats */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                            className="hidden lg:block relative"
                        >
                            <div className="absolute -inset-4 bg-blue-500/20 blur-3xl rounded-full opacity-50"></div>
                            <div className="relative bg-slate-800/50 backdrop-blur-md border border-slate-700/50 p-8 rounded-2xl shadow-2xl">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between border-b border-slate-700 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-500/20 rounded-lg">
                                                <Activity className="h-6 w-6 text-blue-400" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-white">Live System Status</h3>
                                                <p className="text-xs text-blue-300">Updated {time.toLocaleTimeString()}</p>
                                            </div>
                                        </div>
                                        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse"></div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        {stats.map((stat, idx) => (
                                            <div key={idx} className="bg-slate-900/50 p-4 rounded-xl border border-slate-700/30">
                                                <p className="text-gray-400 text-sm">{stat.label}</p>
                                                <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-4 p-4 bg-blue-600/10 rounded-xl border border-blue-500/20 flex items-start gap-3">
                                        <Shield className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
                                        <div>
                                            <h4 className="text-sm font-semibold text-blue-100">Did you know?</h4>
                                            <p className="text-xs text-blue-200 mt-1">
                                                Digital FIRs reduce processing time by 60% compared to traditional manual filing.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* Emergency Info Bar */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-sm relative z-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors hover:border-blue-200 dark:hover:border-blue-900">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-600 dark:text-red-400">
                                <Phone className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Emergency</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">100 <span className="text-gray-400 font-normal">or</span> 112</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors hover:border-blue-200 dark:hover:border-blue-900">
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full text-blue-600 dark:text-blue-400">
                                <ClockIcon className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Support Available</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">24/7 Service</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 bg-gray-50 dark:bg-gray-700/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700 transition-colors hover:border-blue-200 dark:hover:border-blue-900">
                            <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full text-yellow-600 dark:text-yellow-400">
                                <AlertTriangle className="h-6 w-6" />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-500 dark:text-gray-400 uppercase tracking-wide">Women Helpline</p>
                                <p className="text-xl font-bold text-gray-900 dark:text-white">1091</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Features Section */}
            <section className="py-24 bg-gray-50 dark:bg-gray-900">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <span className="text-blue-600 dark:text-blue-400 font-semibold tracking-wider uppercase text-sm">Why choose E-FIR?</span>
                        <h2 className="mt-3 text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            Modernizing Law Enforcement
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                            Experience a transparent, efficient, and citizen-friendly legal process designed for the digital age.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                whileHover={{ y: -8 }}
                                className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
                            >
                                <div className="mb-6 inline-flex p-4 bg-gray-50 dark:bg-gray-700 rounded-2xl">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-gray-900 dark:text-white">{feature.title}</h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="py-24 bg-white dark:bg-gray-800 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-50 via-transparent to-transparent dark:from-blue-900/10 dark:via-transparent dark:to-transparent"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">
                            How It Works
                        </h2>
                        <p className="mt-4 text-lg text-gray-600 dark:text-gray-400">
                            A simple 4-step process to get justice.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        {steps.map((step, index) => (
                            <div key={index} className="relative group">
                                <div className="flex flex-col items-center text-center">
                                    <div className="relative mb-6">
                                        <div className="w-16 h-16 rounded-full bg-blue-600 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                                            {step.id}
                                        </div>
                                        {/* Connector Line */}
                                        {index !== steps.length - 1 && (
                                            <div className="hidden md:block absolute top-1/2 left-full w-full h-0.5 bg-gray-200 dark:bg-gray-700 -z-10 transform -translate-y-1/2 translate-x-4"></div>
                                        )}
                                    </div>
                                    <h3 className="text-xl font-bold mb-2 text-gray-900 dark:text-white">{step.title}</h3>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">{step.desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-20 bg-blue-900 overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="https://images.unsplash.com/photo-1589829085413-56de8ae18c73?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80"
                        alt="Background"
                        className="w-full h-full object-cover opacity-10"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900 via-blue-900/90 to-blue-800/90"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to file a complaint?</h2>
                    <p className="text-blue-100 text-lg mb-10 max-w-2xl mx-auto">
                        Don't wait. Our secure portal is accessible 24/7 from anywhere. Your safety is our priority.
                    </p>
                    <Link
                        to="/register"
                        className="inline-flex items-center px-8 py-4 bg-white text-blue-900 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-xl"
                    >
                        Get Started Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                    </Link>
                </div>
            </section>
            <AIChatbot />
        </div>
    );
};

export default Home;

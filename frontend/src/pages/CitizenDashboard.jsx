import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import FIRForm from '../components/FIRForm';
import FIRList from '../components/FIRList';
import AIChatbot from '../components/AIChatbot';
import { FileText, List, BarChart2, User } from 'lucide-react';
import { motion } from 'framer-motion';

const CitizenDashboard = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('submit');

    return (
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex">
            {/* Sidebar */}
            <aside className="w-64 bg-white dark:bg-gray-800 shadow-md hidden md:block">
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                            <User className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                        </div>
                        <div>
                            <h2 className="font-bold text-gray-800 dark:text-white">{user?.name}</h2>
                            <p className="text-xs text-gray-500 dark:text-gray-400">Citizen</p>
                        </div>
                    </div>

                    <nav className="space-y-2">
                        <button
                            onClick={() => setActiveTab('submit')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'submit'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <FileText className="h-5 w-5" />
                            Submit FIR
                        </button>
                        <button
                            onClick={() => setActiveTab('list')}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${activeTab === 'list'
                                ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                                }`}
                        >
                            <List className="h-5 w-5" />
                            My FIRs
                        </button>
                    </nav>
                </div>
            </aside>

            {/* Mobile Tabs (visible only on small screens) */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex justify-around p-4 z-40">
                <button onClick={() => setActiveTab('submit')} className={`flex flex-col items-center ${activeTab === 'submit' ? 'text-blue-600' : 'text-gray-500'}`}>
                    <FileText className="h-6 w-6" />
                    <span className="text-xs mt-1">Submit</span>
                </button>
                <button onClick={() => setActiveTab('list')} className={`flex flex-col items-center ${activeTab === 'list' ? 'text-blue-600' : 'text-gray-500'}`}>
                    <List className="h-6 w-6" />
                    <span className="text-xs mt-1">My FIRs</span>
                </button>
            </div>

            {/* Main Content */}
            <main className="flex-1 p-4 md:p-8 overflow-y-auto pb-20 md:pb-8">
                <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    {activeTab === 'submit' && <FIRForm onSuccess={() => setActiveTab('list')} />}
                    {activeTab === 'list' && <FIRList />}
                </motion.div>
            </main>
            <AIChatbot />
        </div>
    );
};

export default CitizenDashboard;

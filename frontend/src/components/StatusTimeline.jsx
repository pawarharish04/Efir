import { motion } from 'framer-motion';
import { Check, Clock, FileText, Search } from 'lucide-react';

const steps = [
    { id: 'Pending', label: 'Submitted', icon: FileText },
    { id: 'Accepted', label: 'Officer Assigned', icon: Search },
    { id: 'In Progress', label: 'Investigation', icon: Clock },
    { id: 'Resolved', label: 'Resolved', icon: Check }
];

const StatusTimeline = ({ currentStatus }) => {
    // Determine the active index based on currentStatus
    // Special handling: 'Rejected' usually stops the flow, so we might show it as a failed step or just red.
    // For this timeline, we'll mapping statuses to indices.

    let activeIndex = 0;
    if (currentStatus === 'Accepted') activeIndex = 1;
    if (currentStatus === 'In Progress') activeIndex = 2;
    if (currentStatus === 'Resolved') activeIndex = 3;

    // If Rejected, we handle it visually separately or just show 0 progress with a red badge elsewhere.
    const isRejected = currentStatus === 'Rejected';

    if (isRejected) {
        return (
            <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg border border-red-200 dark:border-red-800 text-center">
                <p className="text-red-700 dark:text-red-300 font-bold">Case Rejected</p>
                <p className="text-sm text-red-600 dark:text-red-400">This report has been reviewed and rejected by the officer.</p>
            </div>
        );
    }

    return (
        <div className="w-full py-4">
            <div className="relative flex justify-between items-center w-full max-w-lg mx-auto">
                {/* Connecting Line */}
                <div className="absolute top-1/2 left-0 w-full h-1 bg-gray-200 dark:bg-gray-700 -z-10 transform -translate-y-1/2 rounded-full"></div>
                <div
                    className="absolute top-1/2 left-0 h-1 bg-blue-500 transition-all duration-500 ease-in-out -z-10 transform -translate-y-1/2 rounded-full"
                    style={{ width: `${(activeIndex / (steps.length - 1)) * 100}%` }}
                ></div>

                {steps.map((step, index) => {
                    const Icon = step.icon;
                    const isActive = index <= activeIndex;
                    const isCurrent = index === activeIndex;

                    return (
                        <div key={step.id} className="flex flex-col items-center gap-2 bg-white dark:bg-gray-800 px-2">
                            <motion.div
                                initial={false}
                                animate={{
                                    scale: isCurrent ? 1.2 : 1,
                                    backgroundColor: isActive ? 'rgb(59, 130, 246)' : 'rgb(229, 231, 235)',
                                    borderColor: isActive ? 'rgb(59, 130, 246)' : 'rgb(209, 213, 219)'
                                }}
                                className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center border-2 z-10 transition-colors duration-300
                                    ${isActive ? 'bg-blue-500 border-blue-500 text-white' : 'bg-gray-200 border-gray-300 text-gray-500 dark:bg-gray-700 dark:border-gray-600'}`}
                            >
                                <Icon className="w-4 h-4 md:w-5 md:h-5" />
                            </motion.div>
                            <span className={`text-xs md:text-sm font-medium transition-colors duration-300 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default StatusTimeline;

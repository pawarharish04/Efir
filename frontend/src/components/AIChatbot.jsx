import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, Bot, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const AIChatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        { id: 1, text: "Hello! I'm your AI Assistant. I can help you understand how to file an FIR or guide you through the process. What happened?", sender: 'bot' }
    ]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef(null);
    const navigate = useNavigate();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user' };
        setMessages(prev => [...prev, userMsg]);
        setInput('');

        // Simulate AI "Thinking"
        setTimeout(() => {
            const botResponse = generateResponse(input);
            setMessages(prev => [...prev, { id: Date.now() + 1, text: botResponse, sender: 'bot' }]);
        }, 1000);
    };

    const generateResponse = (text) => {
        const lower = text.toLowerCase();

        if (lower.includes('stolen') || lower.includes('theft') || lower.includes('robbery')) {
            return "It sounds like a theft case. You should file an FIR under the category 'Theft'. Make sure to mention the approximate time and list of stolen items. Would you like to go to the filing page?";
        }
        if (lower.includes('hit') || lower.includes('fight') || lower.includes('attack')) {
            return "This seems like an 'Assault' case. Please ensure you are safe first. In your report, mention if there were any witnesses or weapons involved.";
        }
        if (lower.includes('fraud') || lower.includes('scam') || lower.includes('money')) {
            return "For financial fraud, select 'Fraud' or 'Cybercrime' if it happened online. Do you have transaction IDs or screenshots? They are important evidence.";
        }
        if (lower.includes('cyber') || lower.includes('hack') || lower.includes('online')) {
            return "For online crimes, please select 'Cybercrime'. You should upload screenshots of chats or emails as evidence in the form.";
        }
        if (lower.includes('file') || lower.includes('report') || lower.includes('create')) {
            return "You can file a report by clicking the 'Submit FIR' button on your dashboard. Do you want me to take you there?";
        }

        return "I understand. To file an official report, please provide as many details as possible in the 'Description' field of the FIR form. Is there anything specific you are unsure about?";
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-gray-800 w-80 md:w-96 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-4"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white">
                            <div className="flex items-center gap-2">
                                <Bot className="h-6 w-6" />
                                <span className="font-semibold">FIR Assistant</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded-full transition">
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        {/* Chat Body */}
                        <div className="h-80 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900/50">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] px-4 py-2 rounded-2xl text-sm ${msg.sender === 'user'
                                            ? 'bg-blue-600 text-white rounded-tr-none'
                                            : 'bg-white dark:bg-gray-700 dark:text-gray-200 text-gray-800 shadow-sm rounded-tl-none border border-gray-100 dark:border-gray-600'
                                        }`}>
                                        {msg.text}
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white dark:bg-gray-800 border-t dark:border-gray-700 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Type your query..."
                                className="flex-1 px-4 py-2 rounded-full border border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                            <button
                                onClick={handleSend}
                                className="bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition shadow-md disabled:opacity-50"
                                disabled={!input.trim()}
                            >
                                <Send className="h-5 w-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Floating Toggle Button */}
            <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center transition-colors"
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageSquare className="h-6 w-6" />}
            </motion.button>
        </div>
    );
};

export default AIChatbot;

import { useState, useEffect, useRef } from 'react';
import { MessageSquare, X, Send, ShieldAlert, Sparkles, Bot, User as UserIcon, CornerDownLeft, Shield, Mic, MicOff } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const AIChatbot = () => {
    const { currentLanguage } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            text: "Hello! I am your AI Legal Assistant for the National e-FIR Portal. How can I help you regarding offense classifications, required documents, or portal procedures today?",
            sender: 'bot',
            timestamp: new Date()
        }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (isOpen) {
            scrollToBottom();
        }
    }, [messages, isOpen]);

    const handleSend = () => {
        if (!input.trim()) return;

        const userMsg = { id: Date.now(), text: input, sender: 'user', timestamp: new Date() };
        setMessages(prev => [...prev, userMsg]);
        const currentQuery = input;
        setInput('');
        setIsTyping(true);

        setTimeout(() => {
            const botResponse = generateResponse(currentQuery);
            setMessages(prev => [...prev, {
                id: Date.now() + 1,
                text: botResponse,
                sender: 'bot',
                timestamp: new Date()
            }]);
            setIsTyping(false);
        }, 600);
    };

    const generateResponse = (text) => {
        const lower = text.toLowerCase();

        if (lower.includes('stolen') || lower.includes('theft') || lower.includes('robbery')) {
            return "For theft or stolen property: Choose 'Theft' under incident category. Be sure to note serial numbers (e.g. IMEI for phones, vehicle registration numbers) and attach bills or receipts under supporting documents.";
        }
        if (lower.includes('hit') || lower.includes('fight') || lower.includes('attack') || lower.includes('assault')) {
            return "For physical altercations or bodily harm: Select 'Assault'. If medical treatment or a Medico-Legal Examination (MLC) was done, please mention the hospital name and injury details in your narrative.";
        }
        if (lower.includes('fraud') || lower.includes('scam') || lower.includes('money') || lower.includes('bank')) {
            return "For financial fraud or cyber scams: Select 'Fraud' or 'Cybercrime'. Provide the transaction UTR number, beneficiary bank account details, and date/time. You can also call the 1930 Cyber Helpline immediately.";
        }
        if (lower.includes('cyber') || lower.includes('hack') || lower.includes('online')) {
            return "For digital offenses: Select 'Cybercrime'. Preserve screenshots of URLs, social media profiles, chat logs, or fake websites to upload as digital evidence.";
        }
        if (lower.includes('anonymous') || lower.includes('whistleblow') || lower.includes('hide')) {
            return "You can use the 'Anonymous Report' toggle or visit the dedicated Anonymous Report page. You do not need to register, and your report will be tracked using an 8-character confidential code.";
        }
        if (lower.includes('status') || lower.includes('track') || lower.includes('stage')) {
            return "You can track cases from your Citizen Dashboard using the 5-stage Status Stepper (Filed → Under Review → Registered → Investigating → Resolved). Updates are logged in real-time.";
        }

        return "To file an official FIR, please use the 'File an FIR' form on your dashboard. For crimes currently in progress or medical emergencies, please dial 112 immediately.";
    };

    const quickPrompts = [
        "How do I report online financial fraud?",
        "What evidence is needed for theft?",
        "How does anonymous reporting work?"
    ];

    return (
        <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end font-sans">
            {isOpen && (
                <div className="bg-white w-[92vw] sm:w-[380px] h-[520px] max-h-[80vh] rounded-2xl shadow-2xl border border-slate-200 overflow-hidden mb-3 flex flex-col transition-all animate-in fade-in duration-200">
                    {/* Header */}
                    <div className="bg-slate-900 text-white px-4 py-3.5 flex justify-between items-center border-b border-slate-800">
                        <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-lg bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <div className="flex items-center gap-1.5">
                                    <span className="font-bold text-xs text-white">e-FIR AI Legal Assistant</span>
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                </div>
                                <span className="text-[10px] text-slate-400 font-mono">Procedural Guidance & IPC Helper</span>
                            </div>
                        </div>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#F8FAFC] text-xs custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                {msg.sender === 'bot' && (
                                    <div className="w-6 h-6 rounded-md bg-gov-primary text-white flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5 shadow-2xs font-bold">
                                        AI
                                    </div>
                                )}
                                <div
                                    className={`max-w-[82%] p-3 rounded-xl text-xs leading-relaxed ${
                                        msg.sender === 'user'
                                            ? 'bg-gov-primary text-white rounded-br-none shadow-sm'
                                            : 'bg-white text-slate-800 border border-slate-200 rounded-tl-none shadow-2xs'
                                    }`}
                                >
                                    {msg.text}
                                    <div className={`text-[9px] mt-1 font-mono text-right ${msg.sender === 'user' ? 'text-blue-200' : 'text-slate-400'}`}>
                                        {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </div>
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-center gap-2 text-slate-400 text-xs pl-8">
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.2s]"></span>
                                <span className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce [animation-delay:0.4s]"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick Suggestions */}
                    <div className="px-3 py-2 bg-slate-100/70 border-t border-slate-200 flex gap-1.5 overflow-x-auto text-[11px]">
                        {quickPrompts.map((q, idx) => (
                            <button
                                key={idx}
                                onClick={() => { setInput(q); }}
                                className="whitespace-nowrap px-2.5 py-1 bg-white hover:bg-slate-50 text-slate-600 rounded-md border border-slate-200 shadow-2xs transition-colors"
                            >
                                {q}
                            </button>
                        ))}
                    </div>

                    {/* Input Area with Voice Support */}
                    <div className="p-3 bg-white border-t border-slate-200 flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
                                if (!SpeechRecognition) {
                                    alert("Speech recognition not supported in your browser.");
                                    return;
                                }
                                const rec = new SpeechRecognition();
                                rec.lang = currentLanguage;
                                rec.onresult = (e) => {
                                    const transcript = e.results[0][0].transcript;
                                    setInput(prev => prev ? `${prev} ${transcript}` : transcript);
                                };
                                rec.start();
                            }}
                            className="p-2 text-slate-500 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                            title="Speak query (Voice-to-Text)"
                        >
                            <Mic className="h-4 w-4" />
                        </button>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                            placeholder="Ask about IPC laws, evidence, FIR steps..."
                            className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-gov-primary focus:ring-1 focus:ring-gov-primary bg-slate-50 text-slate-900"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!input.trim()}
                            className="px-3.5 py-2 bg-gov-primary hover:bg-gov-hover text-white rounded-lg disabled:opacity-40 transition-colors shadow-sm flex items-center justify-center"
                        >
                            <Send className="h-3.5 w-3.5" />
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Action Button with Status Pulse */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative bg-slate-900 hover:bg-slate-800 text-white px-4 py-3 rounded-full shadow-xl border border-slate-700 flex items-center gap-2.5 text-xs font-semibold transition-all transform hover:scale-105 active:scale-95"
            >
                {isOpen ? (
                    <X className="h-4 w-4 text-slate-300" />
                ) : (
                    <div className="relative">
                        <Sparkles className="h-4 w-4 text-blue-400" />
                        <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-slate-900 animate-ping"></span>
                    </div>
                )}
                <span className="hidden sm:inline">{isOpen ? 'Close Assistant' : 'FIR AI Helpdesk'}</span>
            </button>
        </div>
    );
};

export default AIChatbot;
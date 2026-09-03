import { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, VolumeX, AlertCircle, CheckCircle, Radio, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

/**
 * VoiceInput — Speech-to-Text & Text-to-Speech Accessibility Widget
 * Integrates Web Speech API (webkitSpeechRecognition) and SpeechSynthesis
 * with regional language dictation for illiterate citizens and those unable to type.
 */
const VoiceInput = ({ onTranscript, textToRead = '', currentText = '' }) => {
    const { currentLanguage, languages, t } = useLanguage();
    const [isListening, setIsListening] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [speechSupported, setSpeechSupported] = useState(true);
    const [interimText, setInterimText] = useState('');
    const recognitionRef = useRef(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            setSpeechSupported(false);
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = currentLanguage;

        recognition.onresult = (event) => {
            let finalTranscript = '';
            let currentInterim = '';

            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    currentInterim += event.results[i][0].transcript;
                }
            }

            setInterimText(currentInterim);

            if (finalTranscript) {
                onTranscript(finalTranscript);
                setInterimText('');
            }
        };

        recognition.onerror = (event) => {
            console.warn('Speech Recognition Error:', event.error);
            if (event.error !== 'no-speech') {
                setIsListening(false);
            }
        };

        recognition.onend = () => {
            setIsListening(false);
            setInterimText('');
        };

        recognitionRef.current = recognition;

        return () => {
            if (recognitionRef.current) {
                try {
                    recognitionRef.current.stop();
                } catch (e) {}
            }
        };
    }, [currentLanguage, onTranscript]);

    const toggleListening = () => {
        if (!recognitionRef.current) return;

        if (isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        } else {
            try {
                recognitionRef.current.lang = currentLanguage;
                recognitionRef.current.start();
                setIsListening(true);
            } catch (err) {
                console.error('Failed to start recognition:', err);
                setIsListening(false);
            }
        }
    };

    // Text-to-Speech (Read statement aloud in regional language)
    const handleSpeak = () => {
        if (!('speechSynthesis' in window)) return;

        if (isSpeaking) {
            window.speechSynthesis.cancel();
            setIsSpeaking(false);
            return;
        }

        const targetText = textToRead || currentText;
        if (!targetText || !targetText.trim()) return;

        const utterance = new SpeechSynthesisUtterance(targetText);
        utterance.lang = currentLanguage;
        utterance.rate = 0.95; // slightly slower for high clarity

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = () => setIsSpeaking(false);

        setIsSpeaking(true);
        window.speechSynthesis.speak(utterance);
    };

    const currentLangObj = languages.find(l => l.code === currentLanguage) || languages[0];

    return (
        <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl space-y-2.5 shadow-2xs">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                        <Mic className={`w-4 h-4 ${isListening ? 'animate-bounce text-amber-300' : ''}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs text-blue-950">
                                {t('voiceInputTitle')}
                            </span>
                            <span className="px-1.5 py-0.2 text-[10px] font-bold uppercase rounded bg-blue-200/70 text-blue-800">
                                {currentLangObj.native}
                            </span>
                        </div>
                        <p className="text-[11px] text-blue-800/80">
                            {t('voiceInputDesc')}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {/* Read Aloud Button */}
                    {(textToRead || currentText) && (
                        <button
                            type="button"
                            onClick={handleSpeak}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg border transition-all shadow-2xs ${
                                isSpeaking
                                    ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                            }`}
                            title="Listen to your statement (Text-to-Speech)"
                        >
                            {isSpeaking ? <VolumeX className="w-3.5 h-3.5 text-amber-600" /> : <Volume2 className="w-3.5 h-3.5 text-blue-600" />}
                            <span>{isSpeaking ? t('reading') : t('listenNarrative')}</span>
                        </button>
                    )}

                    {/* Mic Toggle Button */}
                    <button
                        type="button"
                        onClick={toggleListening}
                        disabled={!speechSupported}
                        className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-sm ${
                            isListening
                                ? 'bg-red-600 hover:bg-red-700 text-white animate-pulse ring-4 ring-red-200'
                                : 'bg-blue-600 hover:bg-blue-700 text-white'
                        } disabled:opacity-50`}
                    >
                        {isListening ? (
                            <>
                                <MicOff className="w-4 h-4 text-white" />
                                <span>{t('stopRecording')}</span>
                            </>
                        ) : (
                            <>
                                <Mic className="w-4 h-4 text-white" />
                                <span>{t('startRecording')}</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Live Visualizer Status */}
            {isListening && (
                <div className="flex items-center gap-2 p-2 bg-red-100/90 border border-red-300 rounded-lg text-xs text-red-900 font-medium">
                    <Radio className="w-3.5 h-3.5 text-red-600 animate-ping" />
                    <span>{t('listening')} ({currentLangObj.native})</span>
                    {interimText && (
                        <span className="italic opacity-80 truncate max-w-xs">"{interimText}"</span>
                    )}
                </div>
            )}

            {!speechSupported && (
                <p className="text-[11px] text-amber-800 flex items-center gap-1 font-medium">
                    <AlertCircle className="w-3 h-3 text-amber-600" /> {t('speechNotSupported')}
                </p>
            )}
        </div>
    );
};

export default VoiceInput;
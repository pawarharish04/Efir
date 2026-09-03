import { Languages } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const LanguageSelector = ({ variant = 'light' }) => {
    const { currentLanguage, setCurrentLanguage, languages } = useLanguage();

    const isDark = variant === 'dark';

    return (
        <div className="relative inline-flex items-center gap-1.5">
            <Languages className={`w-3.5 h-3.5 ${isDark ? 'text-amber-400' : 'text-blue-700'}`} />
            <select
                value={currentLanguage}
                onChange={(e) => setCurrentLanguage(e.target.value)}
                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border transition-colors focus:outline-none cursor-pointer ${
                    isDark
                        ? 'bg-slate-950 text-white border-slate-700 focus:border-amber-400'
                        : 'bg-white text-slate-900 border-slate-300 focus:border-blue-600 shadow-2xs'
                }`}
                title="Select Regional Language"
            >
                {languages.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                        {lang.native} ({lang.name.split(' ')[0]})
                    </option>
                ))}
            </select>
        </div>
    );
};

export default LanguageSelector;
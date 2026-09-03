import { createContext, useContext, useState, useEffect } from 'react';
import { languages, translations } from '../utils/translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
    // Default language to English or saved preference in localStorage
    const [currentLanguage, setCurrentLanguage] = useState(() => {
        return localStorage.getItem('app_language') || 'en-IN';
    });

    useEffect(() => {
        localStorage.setItem('app_language', currentLanguage);
    }, [currentLanguage]);

    const t = (key) => {
        const langDict = translations[currentLanguage] || translations['en-IN'];
        return langDict[key] || translations['en-IN'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ currentLanguage, setCurrentLanguage, languages, t }}>
            {children}
        </LanguageContext.Provider>
    );
};

export const useLanguage = () => useContext(LanguageContext);
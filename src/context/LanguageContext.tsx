import React, { createContext, useContext, useState } from 'react';

type Language = 'en' | 'bn';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  t: (key: string) => string;
}

const DICTIONARY: Record<string, Record<Language, string>> = {
  appName: { en: 'SHOHAY', bn: 'সহায়' },
  subTitle: { en: 'Bangladesh Flood Relief Platform', bn: 'বাংলাদেশ বন্যা সহায়তা প্ল্যাটফর্ম' },
  home: { en: 'Home', bn: 'হোম' },
  alerts: { en: 'Alerts', bn: 'সতর্কতা' },
  shelters: { en: 'Shelters', bn: 'আশ্রয়কেন্দ্র' },
  getHelp: { en: 'Get Help', bn: 'সাহায্য নিন' },
  campaigns: { en: 'Campaigns', bn: 'ক্যাম্পেইন' },
  contacts: { en: 'Contacts', bn: 'যোগাযোগ' },
  signIn: { en: 'Sign In', bn: 'সাইন ইন' },
  volunteer: { en: 'Volunteer', bn: 'স্বেচ্ছাসেবক' },
  admin: { en: 'Command Center', bn: 'কমান্ড সেন্টার' },
  banglaBtn: { en: 'বাং', bn: 'EN' }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const toggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'bn' : 'en'));
  };

  const t = (key: string): string => {
    return DICTIONARY[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within LanguageProvider');
  return context;
};

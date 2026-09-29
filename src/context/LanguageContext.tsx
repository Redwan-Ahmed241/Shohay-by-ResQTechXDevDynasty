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
  signOut: { en: 'Sign Out', bn: 'সাইন আউট' },
  exit: { en: 'Exit', bn: 'বাহির' },
  volunteer: { en: 'Volunteer', bn: 'স্বেচ্ছাসেবক' },
  admin: { en: 'Command Center', bn: 'কমান্ড সেন্টার' },
  fieldDashboard: { en: 'Field Dashboard', bn: 'ফিল্ড ড্যাশবোর্ড' },
  banglaBtn: { en: 'বাং', bn: 'EN' },
  signedInAs: { en: 'Signed in as', bn: 'লগইন আছেন' },
  // Footer
  footerDesc: { en: 'Coordinating immediate rescue, shelter, and relief operations for flood-affected communities.', bn: 'বন্যা কবলিত সম্প্রদায়ের জন্য তাৎক্ষণিক উদ্ধার, আশ্রয় ও ত্রাণ কার্যক্রম সমন্বয় করা হচ্ছে।' },
  publicServices: { en: 'Public Services', bn: 'জনসেবা' },
  floodAlerts: { en: 'Flood Alerts', bn: 'বন্যা সতর্কতা' },
  findShelter: { en: 'Find Shelter', bn: 'আশ্রয় খুঁজুন' },
  requestAssistance: { en: 'Request Assistance', bn: 'সাহায্যের আবেদন' },
  reportHazard: { en: 'Report Hazard', bn: 'দুর্যোগ রিপোর্ট করুন' },
  emergencyContacts: { en: 'Emergency Contacts', bn: 'জরুরি যোগাযোগ' },
  platformHeading: { en: 'Platform', bn: 'প্ল্যাটফর্ম' },
  trackRequest: { en: 'Track Request', bn: 'আবেদন ট্র্যাক করুন' },
  campaignsDonations: { en: 'Campaigns & Donations', bn: 'ক্যাম্পেইন ও অনুদান' },
  feedback: { en: 'Feedback', bn: 'মতামত' },
  staffLogin: { en: 'Staff Login', bn: 'স্টাফ লগইন' },
  footerDisclaimer1: { en: 'SHOHAY / সহায় — Prototype Platform for Bangladesh Flood Relief Coordination', bn: 'সহায় — বাংলাদেশ বন্যা ত্রাণ সমন্বয় প্রোটোটাইপ প্ল্যাটফর্ম' },
  footerDisclaimer2: { en: 'All data shown is placeholder content for demonstration purposes', bn: 'প্রদর্শিত সমস্ত তথ্য প্রদর্শনের উদ্দেশ্যে সংরক্ষিত ডেমো তথ্য' },
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

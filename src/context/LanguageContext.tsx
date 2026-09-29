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
  // Home Page
  homeAlertLabel: { en: 'Critical Alert — Immediate Action Required', bn: 'জরুরি সতর্কতা — অবিলম্বে পদক্ষেপ নিন' },
  homeAlertTitle: { en: 'Extreme Flash Flood Warning — Sunamganj Sadar', bn: 'মারাত্মক আকস্মিক বন্যা সতর্কতা — সুনামগঞ্জ সদর' },
  homeAlertAreas: { en: 'Sunamganj Sadar, Bishwambarpur, Tahirpur, Derai', bn: 'সুনামগঞ্জ সদর, বিশ্বম্ভরপুর, তাহিরপুর, দিরাই' },
  homeViewAlert: { en: 'View Alert', bn: 'সতর্কতা দেখুন' },
  homeGetHelpNow: { en: 'Get Help Now', bn: 'জরুরি সাহায্য নিন' },
  homeSetLocation: { en: 'Set Location:', bn: 'স্থান নির্ধারণ:' },
  homeGps: { en: 'GPS', bn: 'জিপিএস' },
  homeSelectUpazila: { en: 'Select Upazila...', bn: 'উপজেলা নির্বাচন করুন...' },
  homeSkip: { en: 'Skip', bn: 'এড়িয়ে যান' },
  homeStatReached: { en: 'Reached', bn: 'সাহায্যপ্রাপ্ত' },
  homeStatShelters: { en: 'Shelters', bn: 'আশ্রয়কেন্দ্র' },
  homeStatPackages: { en: 'Packages', bn: 'ত্রাণ সামগ্রী' },
  homeStatRescues: { en: 'Rescues', bn: 'উদ্ধারকৃত' },
  homeWaterRisk: { en: 'Water Risk', bn: 'পানির বিপদসীমা' },
  homeLiveTicker: { 
    en: '🔴 LIVE — Sunamganj: Water level 3.2m above danger level · Brahmaputra rising at 5cm/hr · 14 upazilas on red alert · Evacuations ongoing in Bishwambarpur · BNCC deploying additional rescue boats',
    bn: '🔴 সরাসরি — সুনামগঞ্জ: পানি বিপদসীমার ৩.২ মিটার উপরে · ব্রহ্মপুত্রের পানি প্রতি ঘণ্টায় ৫ সেমি বৃদ্ধি পাচ্ছে · ১৪টি উপজেলায় লাল সতর্কতা · বিশ্বম্ভরপুরে স্থানান্তর কার্যক্রম চলমান · বিএনসিসি অতিরিক্ত উদ্ধারকারী নৌকা মোতায়েন করেছে'
  },
  homeHeroBadge: { en: 'Emergency Response · Bangladesh', bn: 'জরুরি সাড়াদান · বাংলাদেশ' },
  homeHeroTitle: { en: 'Standing With Bangladesh in Times of Crisis.', bn: 'সংকটময় মুহূর্তে বাংলাদেশের পাশে।' },
  homeHeroDesc: { en: 'Coordinating immediate rescue, shelter access, and transparent relief tracking for flood-affected communities across Bangladesh.', bn: 'বাংলাদেশ জুড়ে বন্যা কবলিত সম্প্রদায়ের জন্য তাৎক্ষণিক উদ্ধার, নিরাপদ আশ্রয় এবং স্বচ্ছ ত্রাণ পর্যবেক্ষণ সমন্বয় করা হচ্ছে।' },
  homeHeroRequestAssistance: { en: 'Request Assistance', bn: 'সাহায্যের আবেদন' },
  homeHeroDonate: { en: 'Donate', bn: 'অনুদান দিন' },
  homeHeroScroll: { en: 'Scroll', bn: 'স্ক্রোল করুন' },
  homeMissionTag: { en: 'Our Mission', bn: 'আমাদের লক্ষ্য' },
  homeMissionHeading: { en: 'We coordinate with communities impacted by floods to save lives, restore dignity, and rebuild resilience across Bangladesh.', bn: 'জীবন বাঁচাতে, মর্যাদা রক্ষা করতে এবং দুর্যোগ কাটিয়ে উঠতে আমরা বন্যা দুর্গত মানুষের পাশে কাজ করছি।' },
  homeLearnMore: { en: 'Learn More', bn: 'আরও জানুন' },
  homeMissionStat1Label: { en: 'people served in 2024', bn: '২০২৪ সালে সেবা প্রাপ্ত নাগরিক' },
  homeMissionStat2Label: { en: 'partner orgs nationwide', bn: 'সারাদেশে সহযোগী সংস্থা' },
  homeMissionStat3Label: { en: 'led by local staff', bn: 'স্থানীয় স্বেচ্ছাসেবক পরিচালিত' },
  homeRescueOpsBadge: { en: 'Rescue Ops', bn: 'উদ্ধার অভিযান' },
  homeRescueOpsSub: { en: 'coordinated rescues · 2024', bn: 'সমন্বিত উদ্ধার · ২০২৪' },
  homeFindShelterTitle: { en: 'Find Shelter', bn: 'আশ্রয় খুঁজুন' },
  homeFindShelterDesc: { en: 'Real-time capacity at safe havens near you', bn: 'নিকটস্থ আশ্রয়কেন্দ্রে বর্তমান খালি আসনের তথ্য' },
  homeReportHazardTitle: { en: 'Report Hazard', bn: 'দুর্যোগ রিপোর্ট করুন' },
  homeReportHazardDesc: { en: 'Anonymously flag flooded roads or dangers', bn: 'প্লাবিত রাস্তা বা বিপদের তথ্য নিরাপদে জানান' },
  homeRequestHelpTitle: { en: 'Request Help', bn: 'সাহায্য চান' },
  homeRequestHelpDesc: { en: 'Submit rescue or relief assistance requests', bn: 'উদ্ধার বা ত্রাণ সহায়তার জন্য আবেদন করুন' },
  homeEmergencyLinesTitle: { en: 'Emergency Lines', bn: 'জরুরি হটলাইন' },
  homeEmergencyLinesDesc: { en: 'Direct lines to rescue and medical services', bn: 'উদ্ধার ও চিকিৎসা সেবার সরাসরি নম্বর' },
  homeLiveSituationTitle: { en: 'Live Situation · Bangladesh Floods 2024', bn: 'বর্তমান পরিস্থিতি · বাংলাদেশ বন্যা ২০২৪' },
  homePeopleAffected: { en: 'People Affected', bn: 'ক্ষতিগ্রস্ত মানুষ' },
  homeAcrossDistricts: { en: 'across 18 districts', bn: '১৮টি জেলা জুড়ে' },
  homeHomesDamaged: { en: 'Homes Damaged', bn: 'ক্ষতিগ্রস্ত ঘরবাড়ি' },
  homeFullPartialDamage: { en: 'full or partial damage', bn: 'সম্পূর্ণ বা আংশিক ক্ষতি' },
  homeKmSubmerged: { en: 'km² Submerged', bn: 'বর্গকিমি প্লাবিত' },
  homeCroplandsInundated: { en: 'croplands inundated', bn: 'ফসলি জমি জলমগ্ন' },
  homeRescueBoatsActive: { en: 'Rescue Boats Active', bn: 'সক্রিয় উদ্ধারকারী নৌকা' },
  homeBnccArmyDeployed: { en: 'BNCC + Army deployed', bn: 'বিএনসিসি ও সেনা মোতায়েন' },
  homeNewsTag: { en: 'Our Work Across Bangladesh', bn: 'সারা বাংলাদেশে আমাদের কার্যক্রম' },
  homeNewsTitle: { en: 'News and Stories', bn: 'সংবাদ ও বিশেষ প্রতিবেদন' },
  homeReadMore: { en: 'Read More', bn: 'বিস্তারিত পড়ুন' },
  homeRead: { en: 'Read', bn: 'পড়ুন' },
  homeFieldReport: { en: 'FIELD REPORT', bn: 'মাঠপর্যায় রিপোর্ট' },
  homeRescueCat: { en: 'RESCUE', bn: 'উদ্ধার' },
  homeFeaturedNewsTitle: { en: 'Over 12,000 families evacuated as floodwaters breach Sunamganj embankments', bn: 'সুনামগঞ্জে বাঁধ ভেঙে প্লাবিত এলাকা থেকে ১২,০০০-এর বেশি পরিবারকে নিরাপদে স্থানান্তর' },
  homeFeaturedNewsExcerpt: { en: 'Coordinated rescue boats deployed across 14 upazilas to move stranded families to safety.', bn: 'আটকে পড়া পরিবারগুলোকে নিরাপদে সরিয়ে নিতে ১৪টি উপজেলায় সমন্বিত উদ্ধার নৌকা মোতায়েন করা হয়েছে।' },
  homeHealthCat: { en: 'HEALTH', bn: 'স্বাস্থ্য' },
  homeNews2Title: { en: 'Mobile medical units reach flood-isolated char communities in Sirajganj', bn: 'সিরাজগঞ্জের দুর্গম চরে চিকিৎসা সেবা পৌঁছে দিচ্ছে ভ্রাম্যমাণ মেডিকেল টিম' },
  homeCommunityCat: { en: 'COMMUNITY', bn: 'সম্প্রদায়' },
  homeNews3Title: { en: 'Women-led distribution networks ensure equitable relief in Netrokona', bn: 'নেত্রকোনায় নারী পরিচালিত নেটওয়ার্কের মাধ্যমে সুষম ত্রাণ বিতরণ নিশ্চিত' },
  homeResilienceCat: { en: 'RESILIENCE', bn: 'পুনর্বাসন' },
  homeNews4Title: { en: 'Local leaders coordinate post-flood recovery in Kurigram char areas', bn: 'কুড়িগ্রামের চরাঞ্চলে বন্যা পরবর্তী পুনর্বাসনে স্থানীয় নেতৃবৃন্দের সমন্বয়' },
  homeHowHelpTag: { en: 'There are many ways to help flood-affected families', bn: 'বন্যা দুর্গতদের পাশে দাঁড়ানোর নানান উপায় রয়েছে' },
  homeHowHelpTitle: { en: 'How You Can Help', bn: 'আপনি যেভাবে সাহায্য করতে পারেন' },
  homeHowHelpDesc: { en: 'Support rescue logistics, deliver relief supplies, and help families reach safe shelter through the most urgent response channels.', bn: 'জরুরি উদ্ধার কার্যক্রম, ত্রাণ সহায়তা পৌঁছে দেওয়া এবং পরিবারগুলোকে নিরাপদ আশ্রয়ে পৌঁছাতে সহযোগিতা করুন।' },
  homeReliefTransport: { en: 'Relief Transport', bn: 'ত্রাণ পরিবহন' },
  homeReliefTransportTitle: { en: 'Supplies moving into flooded communities', bn: 'প্লাবিত এলাকায় ত্রাণ সামগ্রী পৌঁছে দেওয়া হচ্ছে' },
  homeCommunitySupport: { en: 'Community Support', bn: 'কমিউনিটি সহযোগিতা' },
  homeCommunitySupportTitle: { en: 'Local responders guiding families to safety', bn: 'স্থানীয় স্বেচ্ছাসেবকদের সহায়তায় পরিবারগুলোকে নিরাপদ আশ্রয়ে পৌঁছানো' },
  homeLatestUpdates: { en: 'Latest Situation Updates', bn: 'সর্বশেষ পরিস্থিতি ও আপডেট' },
  homeAllAlerts: { en: 'All Alerts', bn: 'সকল সতর্কতা' },
  homeGovtVerified: { en: 'Government Verified', bn: 'সরকারিভাবে যাচাইকৃত' },
  homeTrackYourRequest: { en: 'Track Your Request', bn: 'আবেদনের অবস্থা দেখুন' },
  homeTrackDesc: { en: 'Enter your tracking ID to view rescue or relief status in real-time.', bn: 'রিয়েল-টাইমে উদ্ধার বা ত্রাণ আবেদনের অগ্রগতি দেখতে ট্র্যাকিং আইডি লিখুন।' },
  homeTrackSubmit: { en: 'Go', bn: 'অনুসন্ধান' },
  homeTrackErrorEmpty: { en: 'Please enter a valid tracking ID', bn: 'অনুগ্রহ করে একটি সঠিক ট্র্যাকিং আইডি লিখুন' },
  homeTrackErrorNotFound: { en: 'Request ID not found. Try SHY-2024-89211', bn: 'আইডি খুঁজে পাওয়া যায়নি। চেষ্টা করুন: SHY-2024-89211' },
  homeSubmittedFor: { en: 'Submitted for:', bn: 'আবেদনকৃত এলাকা:' },
  homeEmergencyHotlines: { en: 'Emergency Hotlines', bn: 'জরুরি হটলাইনসমূহ' },
  homeNationalEmergency: { en: 'National Emergency', bn: 'জাতীয় জরুরি সেবা' },
  homeFireService: { en: 'Fire Service & Civil Defence', bn: 'ফায়ার সার্ভিস ও সিভিল ডিফেন্স' },
  homeAmbulanceService: { en: 'Ambulance Service', bn: 'অ্যাম্বুলেন্স সার্ভিস' },
  homeAllContacts: { en: 'All Contacts →', bn: 'সকল যোগাযোগ →' },
  homeBottomVolunteerTitle: { en: 'Volunteer', bn: 'স্বেচ্ছাসেবক' },
  homeBottomVolunteerDesc: { en: 'Join field teams and help distribute relief to families in need across affected districts.', bn: 'মাঠপর্যায়ের দলের সাথে যুক্ত হয়ে ক্ষতিগ্রস্ত জেলাগুলোতে পরিবারগুলোর মাঝে ত্রাণ পৌঁছে দিন।' },
  homeJoinNow: { en: 'Join Now', bn: 'যুক্ত হোন' },
  homeBottomTransparencyTitle: { en: 'Transparency', bn: 'স্বচ্ছতা' },
  homeBottomTransparencyDesc: { en: 'Track how donated funds and materials are utilized with real-time audit logs and field reports.', bn: 'রিয়েল-টাইম অডিট লগ এবং ফিল্ড রিপোর্টের মাধ্যমে অনুদানের অর্থ ও উপকরণের সঠিক ব্যবহার পর্যবেক্ষণ করুন।' },
  homeViewReports: { en: 'View Reports', bn: 'প্রতিবেদন দেখুন' },
  homeBottomImpactTitle: { en: 'Our Impact', bn: 'আমাদের কার্যক্রমের প্রভাব' },
  homeBottomImpactDesc: { en: '5,000+ rescues coordinated and 50,000+ meals distributed in the past 14 days.', bn: 'গত ১৪ দিনে ৫,০০০+ উদ্ধার অভিযান এবং ৫০,০০০+ মানুষের মাঝে খাবার বিতরণ করা হয়েছে।' },
  homeImpactReport: { en: 'Impact Report', bn: 'ইমপ্যাক্ট রিপোর্ট' },
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

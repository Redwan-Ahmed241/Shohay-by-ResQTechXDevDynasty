import React, { useState } from 'react';
import { Phone, Copy, Bookmark, Check } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useContacts } from '../hooks/queries';
import { ContactCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './Contacts.css';

export const Contacts: React.FC = () => {
  const { t } = useLanguage();
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | 'All'>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { data: contacts = [] } = useContacts(selectedCategory, selectedDistrict);

  const handleCopy = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories: Array<{ id: ContactCategory | 'All'; labelKey: string }> = [
    { id: 'All', labelKey: 'filterAll' },
    { id: 'National Emergency', labelKey: 'catNationalEmergency' },
    { id: 'Fire Service', labelKey: 'catFireService' },
    { id: 'Medical', labelKey: 'catMedical' },
    { id: 'Disaster Management', labelKey: 'catDisasterManagement' },
    { id: 'District Control Room', labelKey: 'catDistrictControlRoom' },
    { id: 'Protection', labelKey: 'catProtection' },
    { id: 'Platform Hotline', labelKey: 'catPlatformHotline' },
    { id: 'Rescue', labelKey: 'catRescue' },
    { id: 'Hospital', labelKey: 'catHospital' }
  ];

  const districts = ['All Districts', 'Sunamganj', 'Sirajganj', 'Kurigram', 'Feni'];

  return (
    <PageLayout showAlertBanner={false}>
      <div className="contacts-page-bg">
        <div className="contacts-container">
          {/* Header Title */}
          <h1 className="contacts-title">{t('emergencyContacts')}</h1>

          {/* Yellow Warning Banner matching Figma */}
          <div className="contacts-warning-banner">
            {t('contactsWarning')}
          </div>

          {/* Dark Navy Hero Box - National Emergency Numbers */}
          <div className="national-hero-box">
            <div className="hero-box-header">
              <Phone size={18} className="hero-phone-icon" />
              <div>
                <h3 className="hero-box-title">{t('nationalEmergencyNumbersHeading')}</h3>
                <p className="hero-box-sub">{t('nationalEmergencyNumbersSub')}</p>
              </div>
            </div>

            <div className="national-numbers-grid">
              <div className="nat-card">
                <div className="nat-card-number">999 {t('demoTag')}</div>
                <div className="nat-card-label">{t('catNationalEmergency')}</div>
              </div>
              <div className="nat-card">
                <div className="nat-card-number">102 {t('demoTag')}</div>
                <div className="nat-card-label">{t('catFireService')} &amp; Civil Defence</div>
              </div>
              <div className="nat-card">
                <div className="nat-card-number">199 {t('demoTag')}</div>
                <div className="nat-card-label">{t('homeAmbulanceService')}</div>
              </div>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="contact-category-filters">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className={`cat-filter-btn ${selectedCategory === cat.id ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {t(cat.labelKey)}
              </button>
            ))}
          </div>

          {/* District Filter Chips */}
          <div className="contact-district-chips">
            {districts.map((d) => (
              <button
                key={d}
                className={`district-chip-btn ${selectedDistrict === d ? 'active' : ''}`}
                onClick={() => setSelectedDistrict(d)}
              >
                {d === 'All Districts' ? t('allDistricts') : d}
              </button>
            ))}
          </div>

          {/* Contacts List Stack */}
          <div className="contacts-list-stack">
            {contacts.map((contact) => (
              <div key={contact.id} className="contact-figma-card">
                <div className="contact-card-top">
                  <div className="contact-left-info">
                    <div className="contact-name-row">
                      <h3 className="contact-name">{contact.title}</h3>
                      {contact.isTollFree && <span className="tag-pill tag-tollfree">{t('tollFree')}</span>}
                      {contact.isVerified && <span className="tag-pill tag-verified">{t('verified')}</span>}
                    </div>

                    <div className="contact-phone-code">{contact.phone}</div>

                    {contact.notes && <div className="contact-demo-note">{contact.notes}</div>}

                    <div className="contact-verified-date">{t('lastVerified')} {contact.lastVerified}</div>
                  </div>

                  <div className="contact-right-actions">
                    <div className="availability-label">24/7</div>
                    {contact.district && <div className="district-label">{contact.district}</div>}

                    <div className="action-buttons-row">
                      <button className="btn-call" onClick={() => window.open(`tel:${contact.phone}`)}>
                        <Phone size={14} /> {t('callBtn')}
                      </button>
                      <button
                        className="btn-icon-action"
                        onClick={() => handleCopy(contact.id, contact.phone)}
                        title={t('copyPhoneNumber')}
                      >
                        {copiedId === contact.id ? <Check size={14} style={{ color: '#006a4e' }} /> : <Copy size={14} />}
                      </button>
                      <button className="btn-icon-action" title={t('bookmark')}>
                        <Bookmark size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

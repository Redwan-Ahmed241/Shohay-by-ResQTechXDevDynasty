import React, { useState, useEffect } from 'react';
import { Phone, Copy, Bookmark, AlertCircle, Check } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { contactService } from '../services/contactService';
import { EmergencyContact, ContactCategory } from '../types';
import './Contacts.css';

export const Contacts: React.FC = () => {
  const [contacts, setContacts] = useState<EmergencyContact[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ContactCategory | 'All'>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All Districts');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, [selectedCategory, selectedDistrict]);

  const fetchContacts = async () => {
    const list = await contactService.getContacts(selectedCategory, selectedDistrict);
    setContacts(list);
  };

  const handleCopy = (id: string, phone: string) => {
    navigator.clipboard.writeText(phone);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const categories: Array<ContactCategory | 'All'> = [
    'All',
    'National Emergency',
    'Fire Service',
    'Medical',
    'Disaster Management',
    'District Control Room',
    'Protection',
    'Platform Hotline',
    'Rescue',
    'Hospital'
  ];

  const districts = ['All Districts', 'Sunamganj', 'Sirajganj', 'Kurigram', 'Feni'];

  return (
    <PageLayout showAlertBanner={false}>
      <div className="contacts-page-bg">
        <div className="contacts-container">
          {/* Header Title */}
          <h1 className="contacts-title">Emergency Contacts</h1>

          {/* Yellow Warning Banner matching Figma */}
          <div className="contacts-warning-banner">
            Please verify all contact numbers with official sources before use in an emergency.
          </div>

          {/* Dark Navy Hero Box - National Emergency Numbers */}
          <div className="national-hero-box">
            <div className="hero-box-header">
              <Phone size={18} className="hero-phone-icon" />
              <div>
                <h3 className="hero-box-title">National Emergency Numbers</h3>
                <p className="hero-box-sub">Available 24/7. Verify numbers from primary sources.</p>
              </div>
            </div>

            <div className="national-numbers-grid">
              <div className="nat-card">
                <div className="nat-card-number">999 (DEMO)</div>
                <div className="nat-card-label">National Emergency</div>
              </div>
              <div className="nat-card">
                <div className="nat-card-number">102 (DEMO)</div>
                <div className="nat-card-label">Fire Service &amp; Civil Defence</div>
              </div>
              <div className="nat-card">
                <div className="nat-card-number">199 (DEMO)</div>
                <div className="nat-card-label">Ambulance Service</div>
              </div>
            </div>
          </div>

          {/* Category Filter Buttons */}
          <div className="contact-category-filters">
            {categories.map((cat) => (
              <button
                key={cat}
                className={`cat-filter-btn ${selectedCategory === cat ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
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
                {d}
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
                      {contact.isTollFree && <span className="tag-pill tag-tollfree">Toll Free</span>}
                      {contact.isVerified && <span className="tag-pill tag-verified">Verified</span>}
                    </div>

                    <div className="contact-phone-code">{contact.phone}</div>

                    {contact.notes && <div className="contact-demo-note">{contact.notes}</div>}

                    <div className="contact-verified-date">Last verified: {contact.lastVerified}</div>
                  </div>

                  <div className="contact-right-actions">
                    <div className="availability-label">24/7</div>
                    {contact.district && <div className="district-label">{contact.district}</div>}

                    <div className="action-buttons-row">
                      <button className="btn-call" onClick={() => window.open(`tel:${contact.phone}`)}>
                        <Phone size={14} /> Call
                      </button>
                      <button
                        className="btn-icon-action"
                        onClick={() => handleCopy(contact.id, contact.phone)}
                        title="Copy Phone Number"
                      >
                        {copiedId === contact.id ? <Check size={14} style={{ color: '#006a4e' }} /> : <Copy size={14} />}
                      </button>
                      <button className="btn-icon-action" title="Bookmark">
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

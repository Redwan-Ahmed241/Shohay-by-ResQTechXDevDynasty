import React, { useState, useEffect } from 'react';
import { Phone, Copy, Bookmark, AlertCircle, Check } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
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
      <div className="container contacts-page">
        {/* Header Title */}
        <div className="page-header text-center mb-4">
          <h1>Emergency Contacts</h1>
        </div>

        {/* Warning Banner */}
        <div className="warning-banner mb-6">
          <AlertCircle size={14} />
          <span>Please verify all contact numbers with official sources before use in an emergency.</span>
        </div>

        {/* National Emergency Numbers Banner Box */}
        <Card className="national-banner-card mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Phone size={18} className="text-accent-teal" />
            <h3 className="banner-card-title">National Emergency Numbers</h3>
          </div>
          <p className="text-xs text-muted mb-4">Available 24/7. Verify numbers from primary sources.</p>

          <div className="national-numbers-grid grid-3 gap-4">
            <div className="nat-num-box">
              <div className="nat-num">999 (DEMO)</div>
              <div className="nat-lbl">National Emergency</div>
            </div>
            <div className="nat-num-box">
              <div className="nat-num">102 (DEMO)</div>
              <div className="nat-lbl">Fire Service &amp; Civil Defence</div>
            </div>
            <div className="nat-num-box">
              <div className="nat-num">199 (DEMO)</div>
              <div className="nat-lbl">Ambulance Service</div>
            </div>
          </div>
        </Card>

        {/* Category Filters */}
        <div className="category-filters flex gap-2 flex-wrap mb-4">
          {categories.map((cat) => (
            <button
              key={cat}
              className={`cat-btn ${selectedCategory === cat ? 'active' : ''}`}
              onClick={() => setSelectedCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* District Filter Tags */}
        <div className="district-tags flex gap-2 flex-wrap mb-6">
          {districts.map((d) => (
            <Tag
              key={d}
              active={selectedDistrict === d}
              onClick={() => setSelectedDistrict(d)}
            >
              {d}
            </Tag>
          ))}
        </div>

        {/* Contacts List */}
        <div className="contacts-list flex flex-col gap-4">
          {contacts.map((contact) => (
            <Card key={contact.id} className="contact-item-card">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="contact-title">{contact.title}</h3>
                    {contact.isVerified && <Badge variant="LOW">Verified</Badge>}
                    {contact.isTollFree && <Badge variant="ALL CLEAR">Toll Free</Badge>}
                  </div>
                  <div className="contact-meta mt-1">
                    {contact.availability} {contact.district ? `• ${contact.district}` : ''}
                  </div>
                </div>

                {/* Right Action Buttons: Call, Copy, Bookmark */}
                <div className="contact-actions flex items-center gap-2">
                  <Button variant="primary" size="sm" onClick={() => window.open(`tel:${contact.phone}`)}>
                    <Phone size={12} /> Call
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy(contact.id, contact.phone)}
                    title="Copy Phone Number"
                  >
                    {copiedId === contact.id ? <Check size={12} className="text-success" /> : <Copy size={12} />}
                  </Button>
                  <Button variant="ghost" size="sm" title="Bookmark">
                    <Bookmark size={12} />
                  </Button>
                </div>
              </div>

              {/* Large Monospace Phone Display */}
              <div className="phone-number-display mt-3">{contact.phone}</div>

              {contact.notes && <div className="contact-notes mt-2">{contact.notes}</div>}
              <div className="last-verified-text mt-2">Last verified: {contact.lastVerified}</div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

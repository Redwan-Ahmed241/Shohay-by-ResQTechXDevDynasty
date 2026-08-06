import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Anchor,
  Home as HomeIcon,
  Utensils,
  Droplets,
  Pill,
  Activity,
  Heart,
  Baby,
  Accessibility,
  Sparkles,
  Search,
  Truck,
  HelpCircle,
  CheckCircle,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { StepIndicator } from '../components/ui/StepIndicator';
import { requestService } from '../services/requestService';
import { AssistanceType, AssistanceRequestPayload } from '../types';
import './GetHelp.css';

export const GetHelp: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Form State
  const [selectedTypes, setSelectedTypes] = useState<AssistanceType[]>([]);
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [vulnerable, setVulnerable] = useState({
    children: 1,
    elderly: 0,
    pregnant: 0,
    disabled: 0
  });
  const [location, setLocation] = useState({
    district: 'Sunamganj',
    upazila: 'Sunamganj Sadar',
    union: 'Jahangirnagar',
    address: 'Village Nabinagar, Ward 3',
    landmark: 'Near Govt Primary School'
  });
  const [contact, setContact] = useState({
    name: 'Rahim Uddin',
    phone: '01712345678',
    altPhone: '',
    isAnonymous: false
  });

  const steps = [
    { number: 1, label: 'Type' },
    { number: 2, label: 'Household' },
    { number: 3, label: 'Location' },
    { number: 4, label: 'Contact' },
    { number: 5, label: 'Review' }
  ];

  const assistanceOptionList: Array<{
    id: AssistanceType;
    label: string;
    icon: React.ReactNode;
    iconColor: string;
    priority?: boolean;
  }> = [
    { id: 'rescue', label: 'Rescue / Evacuation', icon: <Anchor size={22} />, iconColor: '#006a4e', priority: true },
    { id: 'shelter', label: 'Shelter', icon: <HomeIcon size={22} />, iconColor: '#2563eb' },
    { id: 'food', label: 'Food', icon: <Utensils size={22} />, iconColor: '#d97706' },
    { id: 'water', label: 'Safe Water', icon: <Droplets size={22} />, iconColor: '#0284c7' },
    { id: 'medicine', label: 'Medicine / Medical Supply', icon: <Pill size={22} />, iconColor: '#9333ea' },
    { id: 'medical_emergency', label: 'Medical Emergency', icon: <Activity size={22} />, iconColor: '#dc2626', priority: true },
    { id: 'maternal', label: 'Maternal / Newborn Care', icon: <Heart size={22} />, iconColor: '#e11d48', priority: true },
    { id: 'child_welfare', label: 'Child Welfare', icon: <Baby size={22} />, iconColor: '#db2777' },
    { id: 'disability', label: 'Disability Assistance', icon: <Accessibility size={22} />, iconColor: '#4f46e5' },
    { id: 'hygiene', label: 'Hygiene Supplies', icon: <Sparkles size={22} />, iconColor: '#0d9488' },
    { id: 'missing_person', label: 'Missing Person', icon: <Search size={22} />, iconColor: '#ea580c', priority: true },
    { id: 'evacuation', label: 'Evacuation Transport', icon: <Truck size={22} />, iconColor: '#475569' },
    { id: 'other', label: 'Other / Multiple', icon: <HelpCircle size={22} />, iconColor: '#64748b' }
  ];

  const toggleType = (typeId: AssistanceType) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const handleSubmit = async () => {
    const payload: AssistanceRequestPayload = {
      types: selectedTypes,
      householdSize,
      vulnerableCount: vulnerable,
      location,
      contact
    };

    const res = await requestService.submitRequest(payload);
    setSubmittedId(res.trackingId);
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="get-help-page-bg">
        <div className="get-help-container">
          <div className="page-header text-center">
            <h1 className="get-help-title">Request Assistance</h1>
            <p className="get-help-subtitle">No account needed. Anonymous if preferred.</p>
          </div>

          <div className="get-help-card">
            <StepIndicator steps={steps} currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

            {submittedId ? (
              /* Success Screen */
              <div className="submission-success text-center flex flex-col items-center gap-4 py-8 animate-fade-in">
                <CheckCircle size={56} style={{ color: '#006a4e' }} />
                <h2 className="success-heading">Assistance Request Submitted!</h2>
                <p className="success-sub">Your request has been registered in the SHOHAY response network.</p>

                <div className="tracking-id-display mt-4">
                  <span className="id-label">YOUR TRACKING ID:</span>
                  <div className="id-code">{submittedId}</div>
                  <span className="id-hint">Save this ID to check rescue or relief status on the homepage.</span>
                </div>

                <button className="get-help-btn-primary mt-6" onClick={() => navigate('/')}>
                  Return to Home
                </button>
              </div>
            ) : (
              <>
                {/* Step 1: Type Selection */}
                {currentStep === 1 && (
                  <div className="step-content animate-fade-in">
                    <h3 className="step-heading">What do you need?</h3>

                    <div className="types-grid">
                      {assistanceOptionList.map((opt) => {
                        const selected = selectedTypes.includes(opt.id);
                        return (
                          <div
                            key={opt.id}
                            className={`type-card ${selected ? 'selected' : ''}`}
                            onClick={() => toggleType(opt.id)}
                          >
                            <div className="type-icon-wrapper" style={{ color: opt.iconColor }}>
                              {opt.icon}
                            </div>
                            <div className="type-card-text">
                              <span className="type-label">{opt.label}</span>
                              {opt.priority && <span className="priority-text">Priority</span>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Household Details */}
                {currentStep === 2 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">Household Details</h3>

                    <Input
                      label="Total Number of People in Household"
                      type="number"
                      value={householdSize}
                      onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
                    />

                    <div className="vulnerable-counters-grid grid-2 gap-4 mt-2">
                      <Input
                        label="Children (Under 12)"
                        type="number"
                        value={vulnerable.children}
                        onChange={(e) => setVulnerable({ ...vulnerable, children: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label="Elderly (60+)"
                        type="number"
                        value={vulnerable.elderly}
                        onChange={(e) => setVulnerable({ ...vulnerable, elderly: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label="Pregnant Women"
                        type="number"
                        value={vulnerable.pregnant}
                        onChange={(e) => setVulnerable({ ...vulnerable, pregnant: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label="Disabled / Special Care"
                        type="number"
                        value={vulnerable.disabled}
                        onChange={(e) => setVulnerable({ ...vulnerable, disabled: parseInt(e.target.value) || 0 })}
                      />
                    </div>
                  </div>
                )}

                {/* Step 3: Location */}
                {currentStep === 3 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">Your Location</h3>

                    <div className="grid-2 gap-4">
                      <Input
                        label="District"
                        value={location.district}
                        onChange={(e) => setLocation({ ...location, district: e.target.value })}
                      />
                      <Input
                        label="Upazila"
                        value={location.upazila}
                        onChange={(e) => setLocation({ ...location, upazila: e.target.value })}
                      />
                    </div>

                    <Input
                      label="Union / Ward"
                      value={location.union}
                      onChange={(e) => setLocation({ ...location, union: e.target.value })}
                    />

                    <Input
                      label="Full Address / Village"
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                    />

                    <Input
                      label="Landmark (Optional, e.g., near high school)"
                      value={location.landmark}
                      onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
                    />
                  </div>
                )}

                {/* Step 4: Contact */}
                {currentStep === 4 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">Contact Information</h3>

                    <Input
                      label="Your Name"
                      value={contact.name}
                      disabled={contact.isAnonymous}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    />

                    <Input
                      label="Mobile Phone Number"
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    />

                    <Input
                      label="Alternative Phone Number (Optional)"
                      value={contact.altPhone}
                      onChange={(e) => setContact({ ...contact, altPhone: e.target.value })}
                    />

                    <Checkbox
                      label="Keep my request anonymous to public"
                      checked={contact.isAnonymous}
                      onChange={(e) => setContact({ ...contact, isAnonymous: e.target.checked })}
                    />
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">Review &amp; Submit</h3>

                    <div className="review-box flex flex-col gap-3">
                      <div className="review-row">
                        <strong>Requested Services:</strong> {selectedTypes.join(', ') || 'General Relief'}
                      </div>
                      <div className="review-row">
                        <strong>Household Size:</strong> {householdSize} people ({vulnerable.children} children, {vulnerable.elderly} elderly)
                      </div>
                      <div className="review-row">
                        <strong>Location:</strong> {location.address}, {location.upazila}, {location.district}
                      </div>
                      <div className="review-row">
                        <strong>Contact:</strong> {contact.isAnonymous ? 'Anonymous' : contact.name} ({contact.phone})
                      </div>
                    </div>
                  </div>
                )}

                {/* Navigation Buttons Footer */}
                <div className="wizard-actions">
                  {currentStep > 1 ? (
                    <button className="get-help-btn-outline" onClick={() => setCurrentStep(currentStep - 1)}>
                      <ChevronLeft size={16} /> Back
                    </button>
                  ) : (
                    <button className="get-help-btn-outline disabled" disabled>
                      <ChevronLeft size={16} /> Back
                    </button>
                  )}

                  {currentStep < 5 ? (
                    <button className="get-help-btn-primary" onClick={() => setCurrentStep(currentStep + 1)}>
                      Next <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button className="get-help-btn-success" onClick={handleSubmit}>
                      Submit Assistance Request
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

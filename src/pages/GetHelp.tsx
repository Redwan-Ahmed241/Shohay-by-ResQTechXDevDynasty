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
  ChevronLeft,
  MapPin,
  PhoneCall
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { StepIndicator } from '../components/ui/StepIndicator';
import { requestService } from '../services/requestService';
import { ApiError } from '../services/api';
import { AssistanceType, AssistanceRequestPayload } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './GetHelp.css';

export const GetHelp: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  // Form State
  const [selectedTypes, setSelectedTypes] = useState<AssistanceType[]>([]);
  const [householdSize, setHouseholdSize] = useState<number>(4);
  const [vulnerable, setVulnerable] = useState({
    children: 0,
    elderly: 0,
    pregnant: 0,
    disabled: 0
  });
  const [location, setLocation] = useState({
    district: '',
    upazila: '',
    union: '',
    address: '',
    landmark: '',
    gpsCoords: ''
  });
  const [contact, setContact] = useState({
    name: '',
    phone: '',
    altPhone: '',
    isAnonymous: false
  });
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);

  const steps = [
    { number: 1, label: t('stepType') },
    { number: 2, label: t('stepHousehold') },
    { number: 3, label: t('stepLocation') },
    { number: 4, label: t('stepContact') },
    { number: 5, label: t('stepReview') }
  ];

  const assistanceOptionList: Array<{
    id: AssistanceType;
    labelKey: string;
    icon: React.ReactNode;
    iconColor: string;
    priority?: boolean;
  }> = [
    { id: 'rescue', labelKey: 'assistanceTypeRescue', icon: <Anchor size={22} />, iconColor: '#006a4e', priority: true },
    { id: 'shelter', labelKey: 'assistanceTypeShelter', icon: <HomeIcon size={22} />, iconColor: '#2563eb' },
    { id: 'food', labelKey: 'assistanceTypeFood', icon: <Utensils size={22} />, iconColor: '#d97706' },
    { id: 'water', labelKey: 'assistanceTypeWater', icon: <Droplets size={22} />, iconColor: '#0284c7' },
    { id: 'medicine', labelKey: 'assistanceTypeMedicine', icon: <Pill size={22} />, iconColor: '#9333ea' },
    { id: 'medical_emergency', labelKey: 'assistanceTypeMedicalEmergency', icon: <Activity size={22} />, iconColor: '#dc2626', priority: true },
    { id: 'maternal', labelKey: 'assistanceTypeMaternal', icon: <Heart size={22} />, iconColor: '#e11d48', priority: true },
    { id: 'child_welfare', labelKey: 'assistanceTypeChildWelfare', icon: <Baby size={22} />, iconColor: '#db2777' },
    { id: 'disability', labelKey: 'assistanceTypeDisability', icon: <Accessibility size={22} />, iconColor: '#4f46e5' },
    { id: 'hygiene', labelKey: 'assistanceTypeHygiene', icon: <Sparkles size={22} />, iconColor: '#0d9488' },
    { id: 'missing_person', labelKey: 'assistanceTypeMissingPerson', icon: <Search size={22} />, iconColor: '#ea580c', priority: true },
    { id: 'evacuation', labelKey: 'assistanceTypeEvacuation', icon: <Truck size={22} />, iconColor: '#475569' },
    { id: 'other', labelKey: 'assistanceTypeOther', icon: <HelpCircle size={22} />, iconColor: '#64748b' }
  ];

  const toggleType = (typeId: AssistanceType) => {
    setSelectedTypes((prev) =>
      prev.includes(typeId) ? prev.filter((t) => t !== typeId) : [...prev, typeId]
    );
  };

  const shareGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('This device cannot share its location.');
      return;
    }
    setGpsStatus('Finding your location…');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = `${pos.coords.latitude.toFixed(6)},${pos.coords.longitude.toFixed(6)}`;
        setLocation((prev) => ({ ...prev, gpsCoords: coords }));
        setGpsStatus(`Location added (${coords}).`);
      },
      () => setGpsStatus('Could not get your location. Please describe it in the address instead.'),
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  // Returns the step to fix and why, or null when the request can be sent.
  const findMissing = (): { step: number; message: string } | null => {
    if (selectedTypes.length === 0) return { step: 1, message: 'Choose at least one kind of help you need.' };
    if (householdSize < 1) return { step: 2, message: 'Household size must be at least 1.' };
    if (!location.district.trim()) return { step: 3, message: 'Enter your district.' };
    if (!location.address.trim() && !location.gpsCoords) return { step: 3, message: 'Enter your village / address or share your GPS location so rescuers can find you.' };
    if (!contact.phone.trim()) return { step: 4, message: 'Enter a mobile number so responders can call you back.' };
    if (!contact.isAnonymous && !contact.name.trim()) return { step: 4, message: 'Enter your name, or tick "Keep my request anonymous".' };
    return null;
  };

  const handleSubmit = async () => {
    setSubmitError(null);
    const missing = findMissing();
    if (missing) {
      setSubmitError(missing.message);
      setCurrentStep(missing.step);
      return;
    }

    const payload: AssistanceRequestPayload = {
      types: selectedTypes,
      householdSize,
      vulnerableCount: vulnerable,
      location: { ...location, gpsCoords: location.gpsCoords || undefined, landmark: location.landmark || undefined },
      contact: { ...contact, name: contact.isAnonymous ? contact.name || 'Anonymous' : contact.name }
    };

    setIsSubmitting(true);
    try {
      const res = await requestService.submitRequest(payload);
      setSubmittedId(res.trackingId);
    } catch (err) {
      setSubmitError(
        err instanceof ApiError
          ? `Your request was NOT sent: ${err.message}`
          : 'Your request was NOT sent — there is no connection to the Shohay server. Please try again.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTypeName = (id: AssistanceType) => {
    const opt = assistanceOptionList.find((o) => o.id === id);
    return opt ? t(opt.labelKey) : id;
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="get-help-page-bg">
        <div className="get-help-container">
          <div className="page-header text-center">
            <h1 className="get-help-title">{t('getHelp')}</h1>
            <p className="get-help-subtitle">{t('getHelpSubtitle')}</p>
          </div>

          <div className="get-help-card">
            <StepIndicator steps={steps} currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

            {submittedId ? (
              /* Success Screen */
              <div className="submission-success text-center flex flex-col items-center gap-4 py-8 animate-fade-in">
                <CheckCircle size={56} style={{ color: '#006a4e' }} />
                <h2 className="success-heading">{t('assistanceRequestSubmitted')}</h2>
                <p className="success-sub">{t('requestRegisteredNotice')}</p>

                <div className="tracking-id-display mt-4">
                  <span className="id-label">{t('yourTrackingIdLabel')}</span>
                  <div className="id-code">{submittedId}</div>
                  <span className="id-hint">{t('saveIdHint')}</span>
                </div>

                <button className="get-help-btn-primary mt-6" onClick={() => navigate('/')}>
                  {t('returnToHomeBtn')}
                </button>
              </div>
            ) : (
              <>
                {/* Step 1: Type Selection */}
                {currentStep === 1 && (
                  <div className="step-content animate-fade-in">
                    <h3 className="step-heading">{t('whatDoYouNeed')}</h3>

                    <div className="types-grid">
                      {assistanceOptionList.map((opt) => {
                        const selected = selectedTypes.includes(opt.id);
                        return (
                          <button
                            type="button"
                            key={opt.id}
                            className={`type-card ${selected ? 'selected' : ''}`}
                            aria-pressed={selected}
                            onClick={() => toggleType(opt.id)}
                          >
                            <div className="type-icon-wrapper" style={{ color: opt.iconColor }}>
                              {opt.icon}
                            </div>
                            <div className="type-card-text">
                              <span className="type-label">{t(opt.labelKey)}</span>
                              {opt.priority && <span className="priority-text">{t('priorityTag')}</span>}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Step 2: Household Details */}
                {currentStep === 2 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">{t('householdDetails')}</h3>

                    <Input
                      label={t('totalPeopleHousehold')}
                      type="number"
                      value={householdSize}
                      onChange={(e) => setHouseholdSize(parseInt(e.target.value) || 1)}
                    />

                    <div className="vulnerable-counters-grid grid-2 gap-4 mt-2">
                      <Input
                        label={t('childrenUnder12')}
                        type="number"
                        value={vulnerable.children}
                        onChange={(e) => setVulnerable({ ...vulnerable, children: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label={t('elderly60')}
                        type="number"
                        value={vulnerable.elderly}
                        onChange={(e) => setVulnerable({ ...vulnerable, elderly: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label={t('pregnantWomen')}
                        type="number"
                        value={vulnerable.pregnant}
                        onChange={(e) => setVulnerable({ ...vulnerable, pregnant: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        label={t('disabledSpecialCare')}
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
                    <h3 className="step-heading">{t('yourLocation')}</h3>

                    <div className="grid-2 gap-4">
                      <Input
                        label={t('districtLabel')}
                        value={location.district}
                        onChange={(e) => setLocation({ ...location, district: e.target.value })}
                      />
                      <Input
                        label={t('upazilaLabel')}
                        value={location.upazila}
                        onChange={(e) => setLocation({ ...location, upazila: e.target.value })}
                      />
                    </div>

                    <Input
                      label={t('unionWardLabel')}
                      value={location.union}
                      onChange={(e) => setLocation({ ...location, union: e.target.value })}
                    />

                    <Input
                      label={t('fullAddressVillageLabel')}
                      value={location.address}
                      onChange={(e) => setLocation({ ...location, address: e.target.value })}
                    />

                    <Input
                      label={t('landmarkOptionalLabel')}
                      value={location.landmark}
                      onChange={(e) => setLocation({ ...location, landmark: e.target.value })}
                    />

                    <div>
                      <button type="button" className="get-help-btn-outline" onClick={shareGps}>
                        <MapPin size={16} /> {location.gpsCoords ? 'Update my GPS location' : 'Share my GPS location'}
                      </button>
                      {gpsStatus && <p style={{ fontSize: 13, color: '#475569', margin: '6px 0 0' }} role="status">{gpsStatus}</p>}
                    </div>
                  </div>
                )}

                {/* Step 4: Contact */}
                {currentStep === 4 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">{t('contactInformation')}</h3>

                    <Input
                      label={t('yourNameLabel')}
                      value={contact.name}
                      disabled={contact.isAnonymous}
                      onChange={(e) => setContact({ ...contact, name: e.target.value })}
                    />

                    <Input
                      label={t('mobilePhoneLabel')}
                      value={contact.phone}
                      onChange={(e) => setContact({ ...contact, phone: e.target.value })}
                    />

                    <Input
                      label={t('altPhoneOptionalLabel')}
                      value={contact.altPhone}
                      onChange={(e) => setContact({ ...contact, altPhone: e.target.value })}
                    />

                    <Checkbox
                      label={t('anonymousCheckboxLabel')}
                      checked={contact.isAnonymous}
                      onChange={(e) => setContact({ ...contact, isAnonymous: e.target.checked })}
                    />
                  </div>
                )}

                {/* Step 5: Review */}
                {currentStep === 5 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">{t('reviewSubmitHeading')}</h3>

                    <div className="review-box flex flex-col gap-3">
                      <div className="review-row">
                        <strong>{t('requestedServicesLabel')}</strong> {selectedTypes.map(getTypeName).join(', ') || t('generalRelief')}
                      </div>
                      <div className="review-row">
                        <strong>{t('stepHousehold')}:</strong> {householdSize} {t('peopleLabel')} ({vulnerable.children} {t('childrenLabel')}, {vulnerable.elderly} {t('elderlyLabel')})
                      </div>
                      <div className="review-row">
                        <strong>{t('stepLocation')}:</strong> {[location.address, location.upazila, location.district].filter(Boolean).join(', ') || 'Not given'}
                        {location.gpsCoords && <> (GPS {location.gpsCoords})</>}
                      </div>
                      <div className="review-row">
                        <strong>{t('stepContact')}:</strong> {contact.isAnonymous ? t('anonymousText') : contact.name} ({contact.phone})
                      </div>
                    </div>
                  </div>
                )}

                {submitError && (
                  <div role="alert" style={{ margin: '16px 0 0', padding: '12px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#991b1b', fontSize: 14 }}>
                    <div style={{ fontWeight: 600 }}>{submitError}</div>
                    <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <PhoneCall size={14} /> In a life-threatening emergency call <a href="tel:999" style={{ fontWeight: 700, color: '#991b1b' }}>999</a> now.
                    </div>
                  </div>
                )}

                {/* Navigation Buttons Footer */}
                <div className="wizard-actions">
                  {currentStep > 1 ? (
                    <button className="get-help-btn-outline" onClick={() => setCurrentStep(currentStep - 1)}>
                      <ChevronLeft size={16} /> {t('backBtn')}
                    </button>
                  ) : (
                    <button className="get-help-btn-outline disabled" disabled>
                      <ChevronLeft size={16} /> {t('backBtn')}
                    </button>
                  )}

                  {currentStep < 5 ? (
                    <button className="get-help-btn-primary" onClick={() => setCurrentStep(currentStep + 1)}>
                      {t('nextBtn')} <ChevronRight size={16} />
                    </button>
                  ) : (
                    <button className="get-help-btn-success" onClick={handleSubmit} disabled={isSubmitting}>
                      {isSubmitting ? 'Sending…' : submitError ? 'Try Again' : t('submitAssistanceRequestBtn')}
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

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Checkbox } from '../components/ui/Checkbox';
import { Select } from '../components/ui/Select';
import { StepIndicator } from '../components/ui/StepIndicator';
import { useAuth } from '../context/AuthContext';
import { VolunteerSignupData } from '../services/authService';
import { errorText } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import { BD_UPAZILAS } from '../data/upazilas';
import './VolunteerRegister.css';

export const VolunteerRegister: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, sendCode, verifyCode, registerVolunteer } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedId, setAssignedId] = useState('');
  const [awaitingCode, setAwaitingCode] = useState(false);
  const [code, setCode] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: user?.email || '',
    district: 'Sunamganj',
    skills: {
      boatRescue: true,
      foodDistribution: true,
      firstAid: false,
      shelterAdmin: true,
      dataEntry: false
    },
    hasBoat: true,
    hasVehicle: false,
    availableDays: 'Full-time'
  });

  const steps = [
    { number: 1, label: t('basicInfoStep') },
    { number: 2, label: t('skillsStep') },
    { number: 3, label: t('availabilityStep') }
  ];

  const buildSignupData = (): VolunteerSignupData => {
    const skillsList: string[] = [];
    if (formData.skills.boatRescue) skillsList.push('Boat Operation & Navigation');
    if (formData.skills.foodDistribution) skillsList.push('Food & Relief Distribution');
    if (formData.skills.firstAid) skillsList.push('First Aid & CPR');
    if (formData.skills.shelterAdmin) skillsList.push('Shelter Management');
    if (formData.skills.dataEntry) skillsList.push('Information & Logistics');

    const equipmentList: string[] = [];
    if (formData.hasBoat) equipmentList.push('Engine Boat / Rescue Boat');
    if (formData.hasVehicle) equipmentList.push('Emergency Transport Vehicle');

    return {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      mobile: formData.mobile.trim() || undefined,
      district: formData.district.trim() || undefined,
      skills: skillsList,
      equipment: equipmentList
    };
  };

  const completeRegistration = async () => {
    const registeredUser = await registerVolunteer(buildSignupData());
    setAssignedId(registeredUser.id);
    setIsCompleted(true);
  };

  // Signed-in users register straight away; everyone else first verifies their email with a code.
  const handleNextStep = () => {
    setErrorMessage(null);
    if (currentStep === 1) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        setErrorMessage('Please enter both your first name and last name.');
        return;
      }
      if (!isAuthenticated && !formData.email.trim()) {
        setErrorMessage('Please enter your email address.');
        return;
      }
      if (!isAuthenticated && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
        setErrorMessage('Please enter a valid email address.');
        return;
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, 3));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const email = formData.email.trim();
    if (!formData.firstName.trim() || !formData.lastName.trim() || (!isAuthenticated && !email)) {
      setErrorMessage('Please enter your first name, last name and email address.');
      setCurrentStep(1);
      return;
    }

    setIsSubmitting(true);
    try {
      if (isAuthenticated) {
        await completeRegistration();
      } else {
        await sendCode('email', email, {
          requested_role: 'fieldworker',
          first_name: formData.firstName.trim(),
          last_name: formData.lastName.trim(),
          phone: formData.mobile.trim() || undefined
        });
        setAwaitingCode(true);
      }
    } catch (err: any) {
      setErrorMessage(errorText(err, 'Registration failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);
    try {
      await verifyCode('email', formData.email.trim(), code);
      await completeRegistration();
    } catch (err: any) {
      setErrorMessage(errorText(err, 'Verification failed. Please try again.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="vol-register-page-bg">
        <div className="vol-register-container">
          {/* Top Back Link */}
          <button className="top-back-btn" onClick={() => navigate('/volunteer')}>
            <ArrowLeft size={14} /> {t('backBtn')}
          </button>

          {/* Stepper Bar */}
          <div className="register-stepper-box">
            <StepIndicator
              steps={steps}
              currentStep={currentStep}
              onStepClick={(s) => {
                if (s > currentStep) {
                  handleNextStep();
                } else {
                  setCurrentStep(s);
                }
              }}
            />
          </div>

          {/* Card Box */}
          <div className="vol-register-card">
            {errorMessage && !isCompleted && (
              <div className="register-error-box" role="alert">
                <div>{errorMessage}</div>
                {errorMessage.toLowerCase().includes('too many codes') && !awaitingCode && (
                  <div style={{ marginTop: '8px' }}>
                    <button
                      type="button"
                      className="btn-outline-subtle"
                      style={{ fontSize: '12px', padding: '4px 10px', background: '#fff' }}
                      onClick={() => {
                        setErrorMessage(null);
                        setAwaitingCode(true);
                      }}
                    >
                      Already received a code in your email? Enter it here
                    </button>
                  </div>
                )}
              </div>
            )}

            {isCompleted ? (
              <div className="submission-success text-center flex flex-col items-center gap-4 py-8 animate-fade-in">
                <CheckCircle size={56} style={{ color: '#006a4e' }} />
                <h2 className="success-title">{t('registrationComplete')}</h2>
                <p className="success-sub">{t('welcomeVolunteerNotice')} <strong>{assignedId}</strong>. A coordinator will verify your profile.</p>
                <button className="btn-navy-primary mt-4" onClick={() => navigate('/volunteer/dashboard')}>
                  {t('goToVolunteerDashboard')}
                </button>
              </div>
            ) : awaitingCode ? (
              <form onSubmit={handleVerify}>
                <div className="step-content-stack">
                  <h2 className="step-card-title">Verify Your Email</h2>
                  <p className="verify-hint">
                    We sent a sign-in code to <strong>{formData.email.trim()}</strong>. Enter it below to finish registering.
                  </p>
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="[0-9]{6,10}"
                    maxLength={10}
                    placeholder="Enter code"
                    className="form-input-field verify-code-input"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    required
                    autoFocus
                  />
                </div>

                <div className="register-actions-row">
                  <button
                    type="button"
                    className="btn-outline-subtle"
                    onClick={() => { setAwaitingCode(false); setCode(''); setErrorMessage(null); }}
                  >
                    Back
                  </button>
                  <button type="submit" className="btn-green-submit" disabled={isSubmitting || code.length < 6}>
                    {isSubmitting ? 'Verifying...' : 'Verify & Finish'}
                  </button>
                </div>
              </form>
            ) : (
              <form
                onSubmit={handleSubmit}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (currentStep < 3) {
                      e.preventDefault();
                      handleNextStep();
                    }
                  }
                }}
              >
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="step-content-stack">
                    <h2 className="step-card-title">{t('basicInformationTitle')}</h2>

                    <div className="name-inputs-grid">
                      <input
                        type="text"
                        placeholder={t('firstNamePlaceholder')}
                        className="form-input-field"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder={t('lastNamePlaceholder')}
                        className="form-input-field"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>

                    <input
                      type="text"
                      placeholder={t('mobileNumberPlaceholder')}
                      className="form-input-field"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                    />

                    <input
                      type="email"
                      placeholder="Email (we'll send you a sign-in code)"
                      className="form-input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      autoComplete="email"
                      disabled={isAuthenticated}
                      required
                    />
                  </div>
                )}

                {/* Step 2: Skills & Equipment */}
                {currentStep === 2 && (
                  <div className="step-content-stack">
                    <h2 className="step-card-title">{t('skillsEquipmentTitle')}</h2>

                    <div className="checkbox-section">
                      <label className="checkbox-section-label">{t('selectYourSkillsLabel')}</label>
                      <div className="checkbox-stack">
                        <Checkbox
                          label={t('skillBoatRescue')}
                          checked={formData.skills.boatRescue}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, boatRescue: e.target.checked }
                            })
                          }
                        />
                        <Checkbox
                          label={t('skillFoodDistribution')}
                          checked={formData.skills.foodDistribution}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, foodDistribution: e.target.checked }
                            })
                          }
                        />
                        <Checkbox
                          label={t('skillFirstAid')}
                          checked={formData.skills.firstAid}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, firstAid: e.target.checked }
                            })
                          }
                        />
                        <Checkbox
                          label={t('skillShelterAdmin')}
                          checked={formData.skills.shelterAdmin}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, shelterAdmin: e.target.checked }
                            })
                          }
                        />
                      </div>
                    </div>

                    <div className="checkbox-section">
                      <label className="checkbox-section-label">{t('doYouHaveEquipment')}</label>
                      <div className="checkbox-stack">
                        <Checkbox
                          label={t('equipBoat')}
                          checked={formData.hasBoat}
                          onChange={(e) => setFormData({ ...formData, hasBoat: e.target.checked })}
                        />
                        <Checkbox
                          label={t('equipVehicle')}
                          checked={formData.hasVehicle}
                          onChange={(e) => setFormData({ ...formData, hasVehicle: e.target.checked })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 3: Availability & District */}
                {currentStep === 3 && (
                  <div className="step-content-stack">
                    <h2 className="step-card-title">{t('availabilityDistrictTitle')}</h2>

                    <div className="field-group-item">
                      <Select
                        label={t('primaryOperatingDistrict')}
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        options={[
                          { label: '-- Select Operating District --', value: '' },
                          ...BD_UPAZILAS.map((d) => d.district)
                            .sort((a, b) => a.localeCompare(b))
                            .map((dist) => ({ label: dist, value: dist }))
                        ]}
                        required
                      />
                    </div>

                    <div className="field-group-item">
                      <label className="field-label-text">{t('availabilityFieldLabel')}</label>
                      <input
                        type="text"
                        className="form-input-field"
                        value={formData.availableDays}
                        onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                )}

                {/* Form Buttons */}
                <div className="register-actions-row">
                  <button
                    type="button"
                    className="btn-outline-subtle"
                    onClick={() => (currentStep > 1 ? setCurrentStep(currentStep - 1) : navigate('/volunteer'))}
                  >
                    {t('backBtn')}
                  </button>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      className="btn-navy-primary"
                      onClick={handleNextStep}
                    >
                      {t('nextBtn')}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      {!isAuthenticated && (
                        <button
                          type="button"
                          className="btn-outline-subtle"
                          style={{ fontSize: '12px', padding: '8px 14px' }}
                          onClick={() => {
                            if (!formData.email.trim()) {
                              setErrorMessage('Please enter your email first in step 1.');
                              setCurrentStep(1);
                              return;
                            }
                            setErrorMessage(null);
                            setAwaitingCode(true);
                          }}
                        >
                          Already have a code?
                        </button>
                      )}
                      <button type="submit" className="btn-green-submit" disabled={isSubmitting}>
                        {isSubmitting ? 'Sending code...' : t('completeRegistrationBtn')}
                      </button>
                    </div>
                  )}
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Checkbox } from '../components/ui/Checkbox';
import { StepIndicator } from '../components/ui/StepIndicator';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './VolunteerRegister.css';

export const VolunteerRegister: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { t } = useLanguage();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    mobile: '',
    email: '',
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('volunteer', formData.mobile || '01712345678');
    setIsCompleted(true);
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
            <StepIndicator steps={steps} currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />
          </div>

          {/* Card Box */}
          <div className="vol-register-card">
            {isCompleted ? (
              <div className="submission-success text-center flex flex-col items-center gap-4 py-8 animate-fade-in">
                <CheckCircle size={56} style={{ color: '#006a4e' }} />
                <h2 className="success-title">{t('registrationComplete')}</h2>
                <p className="success-sub">{t('welcomeVolunteerNotice')} <strong>VOL-2024-DEMO</strong>.</p>
                <button className="btn-navy-primary mt-4" onClick={() => navigate('/volunteer/dashboard')}>
                  {t('goToVolunteerDashboard')}
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
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
                      placeholder={t('emailOptionalPlaceholder')}
                      className="form-input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
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
                      <label className="field-label-text">{t('primaryOperatingDistrict')}</label>
                      <input
                        type="text"
                        className="form-input-field"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
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
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      {t('nextBtn')}
                    </button>
                  ) : (
                    <button type="submit" className="btn-green-submit">
                      {t('completeRegistrationBtn')}
                    </button>
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

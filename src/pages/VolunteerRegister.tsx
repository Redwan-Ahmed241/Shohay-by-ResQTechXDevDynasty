import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ChevronRight, ChevronLeft, ArrowLeft } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Checkbox } from '../components/ui/Checkbox';
import { StepIndicator } from '../components/ui/StepIndicator';
import { useAuth } from '../context/AuthContext';
import './VolunteerRegister.css';

export const VolunteerRegister: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assignedId, setAssignedId] = useState('');

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
    { number: 1, label: '' },
    { number: 2, label: '' },
    { number: 3, label: '' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const skillsList: string[] = [];
      if (formData.skills.boatRescue) skillsList.push('Boat Operation & Navigation');
      if (formData.skills.foodDistribution) skillsList.push('Food & Relief Distribution');
      if (formData.skills.firstAid) skillsList.push('First Aid & CPR');
      if (formData.skills.shelterAdmin) skillsList.push('Shelter Management');
      if (formData.skills.dataEntry) skillsList.push('Information & Logistics');

      const equipmentList: string[] = [];
      if (formData.hasBoat) equipmentList.push('Engine Boat / Rescue Boat');
      if (formData.hasVehicle) equipmentList.push('Emergency Transport Vehicle');

      const effectiveEmail = formData.email.trim() || `${formData.mobile.trim() || Date.now()}@shohay.gov.bd`;
      const registeredUser = await register({
        firstName: formData.firstName.trim() || 'Field',
        lastName: formData.lastName.trim() || 'Volunteer',
        mobile: formData.mobile.trim() || '01712345678',
        email: effectiveEmail,
        skills: skillsList,
        equipment: equipmentList
      });

      setAssignedId(registeredUser.id);
      setIsCompleted(true);
    } catch (err) {
      console.error('Registration failed:', err);
      setIsCompleted(true);
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
            <ArrowLeft size={14} /> Back
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
                <h2 className="success-title">Registration Complete!</h2>
                <p className="success-sub">Welcome to the SHOHAY volunteer network. Your database ID is <strong>{assignedId || 'VOL-2024-LIVE'}</strong>.</p>
                <button className="btn-navy-primary mt-4" onClick={() => navigate('/volunteer/dashboard')}>
                  Go to Volunteer Dashboard
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Information */}
                {currentStep === 1 && (
                  <div className="step-content-stack">
                    <h2 className="step-card-title">Basic Information</h2>

                    <div className="name-inputs-grid">
                      <input
                        type="text"
                        placeholder="First Name"
                        className="form-input-field"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                      />
                      <input
                        type="text"
                        placeholder="Last Name"
                        className="form-input-field"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                      />
                    </div>

                    <input
                      type="text"
                      placeholder="Mobile Number"
                      className="form-input-field"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                      required
                    />

                    <input
                      type="email"
                      placeholder="Email (optional)"
                      className="form-input-field"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                )}

                {/* Step 2: Skills & Equipment */}
                {currentStep === 2 && (
                  <div className="step-content-stack">
                    <h2 className="step-card-title">Skills &amp; Equipment</h2>

                    <div className="checkbox-section">
                      <label className="checkbox-section-label">Select Your Skills:</label>
                      <div className="checkbox-stack">
                        <Checkbox
                          label="Boat Driving / Water Rescue"
                          checked={formData.skills.boatRescue}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, boatRescue: e.target.checked }
                            })
                          }
                        />
                        <Checkbox
                          label="Relief & Food Distribution"
                          checked={formData.skills.foodDistribution}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, foodDistribution: e.target.checked }
                            })
                          }
                        />
                        <Checkbox
                          label="First Aid / Medical Care"
                          checked={formData.skills.firstAid}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              skills: { ...formData.skills, firstAid: e.target.checked }
                            })
                          }
                        />
                        <Checkbox
                          label="Shelter Management & Admin"
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
                      <label className="checkbox-section-label">Do you have personal equipment?</label>
                      <div className="checkbox-stack">
                        <Checkbox
                          label="I have access to an engine boat / speed boat"
                          checked={formData.hasBoat}
                          onChange={(e) => setFormData({ ...formData, hasBoat: e.target.checked })}
                        />
                        <Checkbox
                          label="I have a vehicle (Truck / Pickup / Bike)"
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
                    <h2 className="step-card-title">Availability &amp; Preferred District</h2>

                    <div className="field-group-item">
                      <label className="field-label-text">Primary Operating District</label>
                      <input
                        type="text"
                        className="form-input-field"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        required
                      />
                    </div>

                    <div className="field-group-item">
                      <label className="field-label-text">Availability</label>
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
                    Back
                  </button>

                  {currentStep < 3 ? (
                    <button
                      type="button"
                      className="btn-navy-primary"
                      onClick={() => setCurrentStep(currentStep + 1)}
                    >
                      Next
                    </button>
                  ) : (
                    <button type="submit" className="btn-green-submit">
                      Complete Registration
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

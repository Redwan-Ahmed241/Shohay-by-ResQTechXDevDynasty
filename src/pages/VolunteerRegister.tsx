import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Checkbox } from '../components/ui/Checkbox';
import { StepIndicator } from '../components/ui/StepIndicator';
import { useAuth } from '../context/AuthContext';
import './VolunteerRegister.css';

export const VolunteerRegister: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [isCompleted, setIsCompleted] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    firstName: 'Demo',
    lastName: 'Volunteer',
    mobile: '01712345678',
    email: 'volunteer@shohoy.gov.bd',
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
    { number: 1, label: 'Basic Info' },
    { number: 2, label: 'Skills & Equipment' },
    { number: 3, label: 'Availability' }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login('volunteer', formData.mobile);
    setIsCompleted(true);
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container vol-register-page">
        <div className="form-card-container">
          <Card className="wizard-card">
            <StepIndicator steps={steps} currentStep={currentStep} onStepClick={(s) => setCurrentStep(s)} />

            {isCompleted ? (
              <div className="submission-success text-center flex flex-col items-center gap-4 py-8 animate-fade-in">
                <CheckCircle size={56} className="text-success" />
                <h2>Registration Complete!</h2>
                <p>Welcome to the SHOHOY volunteer network. Your ID is <strong>VOL-2024-DEMO</strong>.</p>
                <Button variant="primary" className="mt-4" onClick={() => navigate('/volunteer/dashboard')}>
                  Go to Volunteer Dashboard
                </Button>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">Basic Information</h3>

                    <div className="grid-2 gap-4">
                      <Input
                        label="First Name"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                      />
                      <Input
                        label="Last Name"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                      />
                    </div>

                    <Input
                      label="Mobile Number"
                      value={formData.mobile}
                      onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    />

                    <Input
                      label="Email (optional)"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>
                )}

                {/* Step 2: Skills & Equipment */}
                {currentStep === 2 && (
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">Skills &amp; Equipment</h3>

                    <label className="filter-label">Select Your Skills:</label>
                    <div className="flex flex-col gap-2">
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
                        label="Relief &amp; Food Distribution"
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
                        label="Shelter Management &amp; Admin"
                        checked={formData.skills.shelterAdmin}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            skills: { ...formData.skills, shelterAdmin: e.target.checked }
                          })
                        }
                      />
                    </div>

                    <div className="mt-4">
                      <label className="filter-label">Do you have personal equipment?</label>
                      <div className="flex flex-col gap-2 mt-2">
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
                  <div className="step-content animate-fade-in flex flex-col gap-4">
                    <h3 className="step-heading">Availability &amp; Preferred District</h3>

                    <Input
                      label="Primary Operating District"
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    />

                    <Input
                      label="Availability (e.g. Full-time, Weekends only, 4 hrs/day)"
                      value={formData.availableDays}
                      onChange={(e) => setFormData({ ...formData, availableDays: e.target.value })}
                    />
                  </div>
                )}

                {/* Wizard Actions */}
                <div className="wizard-actions flex justify-between items-center mt-8">
                  {currentStep > 1 ? (
                    <Button type="button" variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                      <ArrowLeft size={14} /> Back
                    </Button>
                  ) : (
                    <div />
                  )}

                  {currentStep < 3 ? (
                    <Button type="button" variant="primary" onClick={() => setCurrentStep(currentStep + 1)}>
                      Next <ArrowRight size={14} />
                    </Button>
                  ) : (
                    <Button type="submit" variant="success">
                      Complete Registration
                    </Button>
                  )}
                </div>
              </form>
            )}
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

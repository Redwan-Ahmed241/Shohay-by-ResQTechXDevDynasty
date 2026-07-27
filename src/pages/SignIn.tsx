import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Phone, Mail, ArrowRight } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import './SignIn.css';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('volunteer');
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');
  const [mobileNumber, setMobileNumber] = useState('01XXXXXXXXX');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    login(selectedRole, mobileNumber);

    if (selectedRole === 'admin') {
      navigate('/admin/command-center');
    } else if (selectedRole === 'volunteer') {
      navigate('/volunteer/dashboard');
    } else {
      navigate('/');
    }
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container signin-page">
        <div className="signin-grid grid-2">
          {/* Left Visual Column */}
          <div className="signin-visual-col">
            <div className="visual-overlay" />
            <img
              src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80"
              alt="Community flood relief work"
              className="visual-bg"
            />
            <div className="visual-content">
              <div className="brand-logo-white flex items-center gap-2 mb-4">
                <Shield size={24} />
                <span>SHOHOY / সহায়</span>
              </div>
              <h2>Coordinating relief where it matters most.</h2>
              <p>Sign in to manage shelters, track inventory, coordinate volunteers, and oversee district relief operations.</p>

              <div className="visual-stats-grid grid-2 gap-4 mt-8">
                <div className="v-stat-card">
                  <div className="v-stat-num">1.2M+</div>
                  <div className="v-stat-lbl">People served</div>
                </div>
                <div className="v-stat-card">
                  <div className="v-stat-num">847</div>
                  <div className="v-stat-lbl">Open shelters</div>
                </div>
                <div className="v-stat-card">
                  <div className="v-stat-num">38</div>
                  <div className="v-stat-lbl">Partner orgs</div>
                </div>
                <div className="v-stat-card">
                  <div className="v-stat-num">98%</div>
                  <div className="v-stat-lbl">Verified ops</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="signin-form-col">
            <div className="form-wrapper">
              <h2>Sign In</h2>
              <p className="form-sub">Bangladesh Flood Relief Coordination Platform</p>

              {/* Role Selection Tabs */}
              <div className="role-tabs grid-3 gap-2 mt-6">
                <button
                  className={`r-tab ${selectedRole === 'public' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('public')}
                >
                  PUBLIC ACCESS
                </button>
                <button
                  className={`r-tab ${selectedRole === 'volunteer' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('volunteer')}
                >
                  FIELD WORKER
                </button>
                <button
                  className={`r-tab ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  COORDINATOR / ADMIN
                </button>
              </div>

              {/* Auth Method Tabs */}
              <div className="method-tabs flex gap-4 mt-6">
                <button
                  className={`m-tab ${authMethod === 'otp' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('otp')}
                >
                  <Phone size={14} /> Mobile OTP
                </button>
                <button
                  className={`m-tab ${authMethod === 'email' ? 'active' : ''}`}
                  onClick={() => setAuthMethod('email')}
                >
                  <Mail size={14} /> Email
                </button>
              </div>

              {/* OTP Form */}
              {!otpSent ? (
                <form onSubmit={handleSendOtp} className="auth-form flex flex-col gap-4 mt-6">
                  {authMethod === 'otp' ? (
                    <div className="phone-input-group">
                      <label className="input-label">MOBILE NUMBER</label>
                      <div className="flex gap-2">
                        <span className="country-prefix">+880</span>
                        <input
                          type="text"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="phone-field"
                          placeholder="01XXXXXXXXX"
                        />
                      </div>
                    </div>
                  ) : (
                    <Input
                      label="EMAIL ADDRESS"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@shohoy.gov.bd"
                    />
                  )}

                  <Button type="submit" variant="primary" fullWidth size="lg">
                    Send OTP <ArrowRight size={14} />
                  </Button>
                  <span className="otp-hint text-center">A one-time code will be sent to your mobile/email.</span>
                </form>
              ) : (
                /* OTP Code Verification Form */
                <form onSubmit={handleVerifyOtp} className="auth-form flex flex-col gap-4 mt-6 animate-fade-in">
                  <Input
                    label="ENTER 6-DIGIT OTP CODE"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="123456"
                  />
                  <Button type="submit" variant="success" fullWidth size="lg">
                    Verify &amp; Enter System
                  </Button>
                </form>
              )}

              <div className="form-footer mt-8 text-center">
                <span>Don't have an account? </span>
                <Link to="/volunteer/register" className="text-accent-teal font-bold">
                  Create one
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Radio, Phone, Mail, ArrowRight } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import './SignIn.css';

const SIGNIN_BG_IMAGE = 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=1200&q=80';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('volunteer');
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('otp');
  const [mobileNumber, setMobileNumber] = useState('');
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
      <div className="signin-page-bg">
        <div className="signin-container-card">
          {/* Left Visual Image Panel */}
          <div className="signin-visual-panel">
            <img src={SIGNIN_BG_IMAGE} alt="Coordinating relief" className="visual-bg-img" />
            <div className="visual-gradient-overlay" />

            <div className="visual-panel-content">
              <div className="brand-header">
                <div className="brand-icon-box">
                  <Radio size={16} />
                </div>
                <div className="brand-title">SHOHOY</div>
              </div>

              <h2 className="visual-heading">Coordinating relief where it matters most.</h2>
              <p className="visual-subtext">
                Sign in to manage shelters, track inventory, coordinate volunteers, and oversee district relief operations.
              </p>

              <div className="visual-stats-grid">
                <div className="v-stat-box">
                  <div className="v-stat-num">1.2M+</div>
                  <div className="v-stat-lbl">People served</div>
                </div>
                <div className="v-stat-box">
                  <div className="v-stat-num">847</div>
                  <div className="v-stat-lbl">Open shelters</div>
                </div>
                <div className="v-stat-box">
                  <div className="v-stat-num">38</div>
                  <div className="v-stat-lbl">Partner orgs</div>
                </div>
                <div className="v-stat-box">
                  <div className="v-stat-num">98%</div>
                  <div className="v-stat-lbl">Special ops</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="signin-form-panel">
            <div className="signin-form-box">
              <h1 className="signin-title">Sign In</h1>
              <p className="signin-subtitle">Bangladesh Flood Relief Coordination Platform</p>

              {/* Role Selection Tabs */}
              <div className="role-selector-tabs">
                <button
                  className={`role-tab ${selectedRole === 'public' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('public')}
                >
                  PUBLIC ACCESS
                </button>
                <button
                  className={`role-tab ${selectedRole === 'volunteer' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('volunteer')}
                >
                  FIELD WORKER
                </button>
                <button
                  className={`role-tab ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  COORDINATOR / ADMIN
                </button>
              </div>

              {/* White Form Card Box matching Figma */}
              <div className="auth-card-box">
                {/* Auth Method Toggle */}
                <div className="auth-method-toggle">
                  <button
                    className={`method-btn ${authMethod === 'otp' ? 'active' : ''}`}
                    onClick={() => setAuthMethod('otp')}
                  >
                    <Phone size={14} /> Mobile OTP
                  </button>
                  <button
                    className={`method-btn ${authMethod === 'email' ? 'active' : ''}`}
                    onClick={() => setAuthMethod('email')}
                  >
                    <Mail size={14} /> Email
                  </button>
                </div>

                {!otpSent ? (
                  <form onSubmit={handleSendOtp} className="auth-form-stack">
                    {authMethod === 'otp' ? (
                      <div className="field-group">
                        <label className="field-label">MOBILE NUMBER</label>
                        <div className="phone-prefix-group">
                          <span className="phone-prefix">+880</span>
                          <input
                            type="text"
                            value={mobileNumber}
                            onChange={(e) => setMobileNumber(e.target.value)}
                            className="phone-input"
                            placeholder="01XXXXXXXXX"
                            required
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="field-group">
                        <label className="field-label">EMAIL ADDRESS</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="email-input"
                          placeholder="admin@shohay.gov.bd"
                          required
                        />
                      </div>
                    )}

                    <button type="submit" className="submit-btn-navy">
                      Send OTP <ArrowRight size={14} />
                    </button>
                    <span className="otp-disclaimer">A one-time code will be sent to your number.</span>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="auth-form-stack">
                    <div className="field-group">
                      <label className="field-label">ENTER 6-DIGIT OTP CODE</label>
                      <input
                        type="text"
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="email-input"
                        placeholder="123456"
                        required
                      />
                    </div>
                    <button type="submit" className="submit-btn-success">
                      Verify &amp; Enter System
                    </button>
                  </form>
                )}
              </div>

              <div className="signin-footer-row">
                <span>Don't have an account? </span>
                <Link to="/volunteer/register" className="create-link">
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

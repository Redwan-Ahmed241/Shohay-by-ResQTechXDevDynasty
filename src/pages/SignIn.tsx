import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Phone, Mail, ArrowRight, ArrowLeft, Zap, CheckCircle2 } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import './SignIn.css';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [selectedRole, setSelectedRole] = useState<UserRole>('volunteer');
  const [authMethod, setAuthMethod] = useState<'otp' | 'email'>('email');
  const [mobileNumber, setMobileNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('123456');

  const executeRedirect = (role: UserRole) => {
    if (role === 'admin') {
      navigate('/admin/command-center');
    } else if (role === 'volunteer') {
      navigate('/volunteer/dashboard');
    } else {
      navigate('/');
    }
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveEmail = email.trim() || (selectedRole === 'admin' ? 'admin@shohay.gov.bd' : 'volunteer@shohay.gov.bd');
    const name = selectedRole === 'admin' ? 'District Coordinator' : selectedRole === 'volunteer' ? 'Field Volunteer' : 'Public Citizen';
    login(selectedRole, effectiveEmail, name);
    executeRedirect(selectedRole);
  };

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setOtpSent(true);
    setOtpCode('123456');
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const identifier = mobileNumber.trim() || '01712345678';
    const name = selectedRole === 'admin' ? 'District Coordinator' : selectedRole === 'volunteer' ? 'Field Volunteer' : 'Public Citizen';
    login(selectedRole, identifier, name);
    executeRedirect(selectedRole);
  };

  const handleQuickDemoLogin = (role: UserRole) => {
    const demoEmail = role === 'admin' ? 'admin@shohay.gov.bd' : role === 'volunteer' ? 'volunteer@shohay.gov.bd' : 'citizen@shohay.gov.bd';
    const name = role === 'admin' ? 'District Coordinator' : role === 'volunteer' ? 'Field Volunteer' : 'Public Citizen';
    login(role, demoEmail, name);
    executeRedirect(role);
  };

  return (
    <PageLayout showAlertBanner={false} showFooter={false}>
      <div className="signin-page-viewport">
        <div className="signin-modal-container">
          {/* Left Visual Panel: Frosted Glass with Hadith Quote & Stats */}
          <div className="signin-glass-panel">
            <div className="quote-container">
              <blockquote className="hadith-quote">
                “And whoever helps his brother (in need), Allah will be helping him; and whoever helps a believer to be free of a grievance, Allah will remove one of his grievances on the Day of Resurrection.”
              </blockquote>
              <cite className="hadith-citation">(Sahih Muslim 2699)</cite>
            </div>

            <div className="signin-stats-grid">
              <div className="signin-stat-card">
                <div className="signin-stat-number">1.2M+</div>
                <div className="signin-stat-label">People helped</div>
              </div>
              <div className="signin-stat-card">
                <div className="signin-stat-number">847</div>
                <div className="signin-stat-label">Special shelters</div>
              </div>
              <div className="signin-stat-card">
                <div className="signin-stat-number">38</div>
                <div className="signin-stat-label">Partner orgs</div>
              </div>
              <div className="signin-stat-card">
                <div className="signin-stat-number">98%</div>
                <div className="signin-stat-label">Special ops</div>
              </div>
            </div>

            <div className="panel-footer-meta">
              <span className="platform-tag">SHOHAY PORTAL</span>
              <span className="dot-divider">•</span>
              <span className="platform-tag">SECURE ACCESS</span>
            </div>
          </div>

          {/* Right Form Panel */}
          <div className="signin-form-panel">
            <div className="signin-form-box">
              <div className="signin-header-block">
                <h1 className="signin-title">Sign In</h1>
                <p className="signin-subtitle">
                  Choose your role and sign in with any email or phone number.
                </p>
              </div>

              {/* Role Selection Tabs */}
              <div className="role-selector-tabs" role="tablist">
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedRole === 'public'}
                  className={`role-tab ${selectedRole === 'public' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('public')}
                >
                  PUBLIC ACCESS
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedRole === 'volunteer'}
                  className={`role-tab ${selectedRole === 'volunteer' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('volunteer')}
                >
                  FIELD WORKER
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={selectedRole === 'admin'}
                  className={`role-tab ${selectedRole === 'admin' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('admin')}
                >
                  COORDINATOR / ADMIN
                </button>
              </div>

              {/* Main Auth Card Box */}
              <div className="auth-card-box">
                {/* Auth Method Toggle */}
                <div className="auth-method-toggle" role="tablist">
                  <button
                    type="button"
                    className={`method-btn ${authMethod === 'email' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthMethod('email');
                      setOtpSent(false);
                    }}
                  >
                    <Mail size={14} />
                    <span>Email Address</span>
                  </button>
                  <button
                    type="button"
                    className={`method-btn ${authMethod === 'otp' ? 'active' : ''}`}
                    onClick={() => {
                      setAuthMethod('otp');
                      setOtpSent(false);
                    }}
                  >
                    <Phone size={14} />
                    <span>Mobile OTP</span>
                  </button>
                </div>

                {/* Email Sign In (Works with ANY email immediately) */}
                {authMethod === 'email' ? (
                  <form onSubmit={handleEmailSubmit} className="auth-form-stack">
                    <div className="field-group">
                      <label className="field-label" htmlFor="email-input">EMAIL ADDRESS</label>
                      <input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-text-input"
                        placeholder={selectedRole === 'admin' ? 'admin@shohay.gov.bd' : 'volunteer@shohay.gov.bd'}
                        required
                        autoFocus
                      />
                    </div>

                    <button type="submit" className="submit-btn-navy">
                      <span>Sign In as {selectedRole === 'admin' ? 'Coordinator' : selectedRole === 'volunteer' ? 'Volunteer' : 'Public'}</span>
                      <ArrowRight size={15} />
                    </button>
                    <p className="otp-disclaimer">
                      Works with any email address. Instant sign-in enabled for presentation.
                    </p>
                  </form>
                ) : !otpSent ? (
                  /* Mobile OTP Request Step */
                  <form onSubmit={handleSendOtp} className="auth-form-stack">
                    <div className="field-group">
                      <label className="field-label" htmlFor="phone-input">MOBILE NUMBER</label>
                      <div className="phone-prefix-group">
                        <span className="phone-prefix">+880</span>
                        <input
                          id="phone-input"
                          type="tel"
                          value={mobileNumber}
                          onChange={(e) => setMobileNumber(e.target.value)}
                          className="phone-input"
                          placeholder="01XXXXXXXXX"
                          required
                        />
                      </div>
                    </div>

                    <button type="submit" className="submit-btn-navy">
                      <span>Send OTP</span>
                      <ArrowRight size={15} />
                    </button>
                    <p className="otp-disclaimer">
                      A one-time verification code will be generated.
                    </p>
                  </form>
                ) : (
                  /* Mobile OTP Verification Step */
                  <form onSubmit={handleVerifyOtp} className="auth-form-stack">
                    <div className="field-group">
                      <div className="otp-header-row">
                        <label className="field-label" htmlFor="otp-input">ENTER 6-DIGIT OTP</label>
                        <button
                          type="button"
                          className="change-auth-btn"
                          onClick={() => setOtpSent(false)}
                        >
                          <ArrowLeft size={11} />
                          <span>Change</span>
                        </button>
                      </div>
                      <input
                        id="otp-input"
                        type="text"
                        maxLength={6}
                        value={otpCode}
                        onChange={(e) => setOtpCode(e.target.value)}
                        className="auth-text-input otp-code-input"
                        placeholder="123456"
                        required
                        autoFocus
                      />
                    </div>
                    <button type="submit" className="submit-btn-navy">
                      <CheckCircle2 size={15} />
                      <span>Verify &amp; Enter System</span>
                    </button>
                    <p className="otp-disclaimer" style={{ color: '#006a4e', fontWeight: 500 }}>
                      ✓ Demo Code 123456 is pre-filled. Click verify to enter.
                    </p>
                  </form>
                )}

                {/* 1-Click Fast Demo Sign-In Bar (Ideal for presentations) */}
                <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px dashed #e2e8f0' }}>
                  <div style={{ fontSize: '11px', color: '#64748b', fontWeight: 600, letterSpacing: '0.05em', marginBottom: '8px', textTransform: 'uppercase' }}>
                    ⚡ 1-Click Presentation Access:
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('volunteer')}
                      style={{
                        flex: 1,
                        padding: '7px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid #10b981',
                        background: '#ecfdf5',
                        color: '#065f46',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Zap size={12} /> Volunteer
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemoLogin('admin')}
                      style={{
                        flex: 1,
                        padding: '7px 8px',
                        fontSize: '11px',
                        fontWeight: 600,
                        borderRadius: '6px',
                        border: '1px solid #3b82f6',
                        background: '#eff6ff',
                        color: '#1e40af',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <Zap size={12} /> Admin
                    </button>
                  </div>
                </div>
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

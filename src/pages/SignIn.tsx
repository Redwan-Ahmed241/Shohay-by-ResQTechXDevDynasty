import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, ArrowRight, ArrowLeft, CheckCircle2, ShieldCheck, Plus, X, Sparkles } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { authService, AuthOptionsResponse, PRESET_AVATARS, FALLBACK_OPTIONS } from '../services/authService';
import './SignIn.css';

type AuthMode = 'signin' | 'signup';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Role: 'public' or 'fieldworker' (admin deferred as requested)
  const [selectedRole, setSelectedRole] = useState<UserRole>('public');
  const [authMode, setAuthMode] = useState<AuthMode>('signin');

  // Sign In State
  const [signInEmail, setSignInEmail] = useState('');
  const [signInError, setSignInError] = useState('');
  const [signInLoading, setSignInLoading] = useState(false);
  const [showOtpSignIn, setShowOtpSignIn] = useState(false);
  const [signInOtpCode, setSignInOtpCode] = useState('');
  const [signInOtpSent, setSignInOtpSent] = useState(false);
  const [signInDebugOtp, setSignInDebugOtp] = useState<string | null>(null);

  // Sign Up State
  const [signUpStep, setSignUpStep] = useState<1 | 2>(1); // 1: Email + OTP, 2: Profile Form
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpOtpCode, setSignUpOtpCode] = useState('');
  const [signUpOtpSent, setSignUpOtpSent] = useState(false);
  const [signUpDebugOtp, setSignUpDebugOtp] = useState<string | null>(null);
  const [verificationTicket, setVerificationTicket] = useState<string | null>(null);
  const [signUpLoading, setSignUpLoading] = useState(false);
  const [signUpError, setSignUpError] = useState('');

  // Profile Form State (Step 2)
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [gender, setGender] = useState('Male');
  const [selectedAvatar, setSelectedAvatar] = useState(PRESET_AVATARS[0].url);
  const [customAvatarUrl, setCustomAvatarUrl] = useState('');
  const [showCustomAvatarInput, setShowCustomAvatarInput] = useState(false);

  // Skills & Equipment
  const [authOptions, setAuthOptions] = useState<AuthOptionsResponse>(FALLBACK_OPTIONS);
  const [selectedSkills, setSelectedSkills] = useState<string[]>(['First Aid & CPR']);
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>(['Life Jackets & Buoys']);
  const [customEquipmentInput, setCustomEquipmentInput] = useState('');

  // Fieldworker Verification State
  const [nidNumber, setNidNumber] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('1998-05-15');
  const [experienceCertificate, setExperienceCertificate] = useState('');

  // Load Auth Options on mount
  useEffect(() => {
    authService.getOptions().then((opts) => {
      setAuthOptions(opts);
    });
  }, []);

  // ══════════════════════════════════════
  // Sign In Handlers
  // ══════════════════════════════════════
  const handleDirectSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);

    try {
      // Direct sign-in without OTP for registered users
      const res = await authService.directSignIn(signInEmail, selectedRole);
      login(res.user.role, res.user.email || signInEmail, res.user);

      if (res.user.role === 'fieldworker' || selectedRole === 'fieldworker') {
        navigate('/volunteer/dashboard');
      } else {
        navigate('/');
      }
    } catch (err: any) {
      setSignInError(err.message || 'Error signing in. Please check your email.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleSendSignInOtp = async () => {
    if (!signInEmail) {
      setSignInError('Please enter your email first.');
      return;
    }
    setSignInError('');
    setSignInLoading(true);
    try {
      const res = await authService.sendOtp(signInEmail);
      setSignInOtpSent(true);
      if (res.debug_otp) {
        setSignInDebugOtp(res.debug_otp);
      }
    } catch (err: any) {
      setSignInError(err.message || 'Failed to dispatch OTP code.');
    } finally {
      setSignInLoading(false);
    }
  };

  const handleVerifySignInOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignInError('');
    setSignInLoading(true);
    try {
      const res = await authService.verifyOtp(signInEmail, signInOtpCode);
      if (res.user) {
        login(res.user.role, res.user.email || signInEmail, res.user);
        if (res.user.role === 'fieldworker' || selectedRole === 'fieldworker') {
          navigate('/volunteer/dashboard');
        } else {
          navigate('/');
        }
      } else {
        // Unregistered user verified -> switch to signup
        setSignUpEmail(signInEmail);
        setVerificationTicket(res.verification_ticket || null);
        setSignUpStep(2);
        setAuthMode('signup');
      }
    } catch (err: any) {
      setSignInError(err.message || 'Invalid verification code.');
    } finally {
      setSignInLoading(false);
    }
  };

  // ══════════════════════════════════════
  // Sign Up Handlers
  // ══════════════════════════════════════
  const handleSendSignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);
    try {
      const res = await authService.sendOtp(signUpEmail);
      setSignUpOtpSent(true);
      if (res.debug_otp) {
        setSignUpDebugOtp(res.debug_otp);
      }
    } catch (err: any) {
      setSignUpError(err.message || 'Failed to send OTP to your email.');
    } finally {
      setSignUpLoading(false);
    }
  };

  const handleVerifySignUpOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);
    try {
      const res = await authService.verifyOtp(signUpEmail, signUpOtpCode);
      setVerificationTicket(res.verification_ticket || null);
      setSignUpStep(2); // Proceed to Profile details
    } catch (err: any) {
      setSignUpError(err.message || 'Invalid or expired OTP code.');
    } finally {
      setSignUpLoading(false);
    }
  };

  // Skill toggles
  const toggleSkill = (skill: string) => {
    if (selectedSkills.includes(skill)) {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill));
    } else {
      setSelectedSkills([...selectedSkills, skill]);
    }
  };

  const addCustomSkill = () => {
    const trimmed = customSkillInput.trim();
    if (trimmed && !selectedSkills.includes(trimmed)) {
      setSelectedSkills([...selectedSkills, trimmed]);
      setCustomSkillInput('');
    }
  };

  // Equipment toggles
  const toggleEquipment = (item: string) => {
    if (selectedEquipment.includes(item)) {
      setSelectedEquipment(selectedEquipment.filter((e) => e !== item));
    } else {
      setSelectedEquipment([...selectedEquipment, item]);
    }
  };

  const addCustomEquipment = () => {
    const trimmed = customEquipmentInput.trim();
    if (trimmed && !selectedEquipment.includes(trimmed)) {
      setSelectedEquipment([...selectedEquipment, trimmed]);
      setCustomEquipmentInput('');
    }
  };

  // Complete Registration Form Submission
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignUpError('');
    setSignUpLoading(true);

    try {
      const finalAvatar = showCustomAvatarInput && customAvatarUrl ? customAvatarUrl : selectedAvatar;

      if (selectedRole === 'fieldworker') {
        const payload = {
          email: signUpEmail,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phoneNumber.trim() || undefined,
          skills: selectedSkills,
          equipment: selectedEquipment,
          avatar: finalAvatar,
          gender,
          nid_number: nidNumber.trim(),
          address: address.trim(),
          dob,
          experience_certificate: experienceCertificate.trim() || undefined
        };

        const res = await authService.registerFieldworker(payload, verificationTicket || undefined);
        login('fieldworker', res.user.email || signUpEmail, res.user);
        navigate('/volunteer/dashboard');
      } else {
        const payload = {
          email: signUpEmail,
          first_name: firstName.trim(),
          last_name: lastName.trim(),
          phone_number: phoneNumber.trim() || undefined,
          skills: selectedSkills,
          equipment: selectedEquipment,
          avatar: finalAvatar,
          gender
        };

        const res = await authService.registerPublic(payload, verificationTicket || undefined);
        login('public', res.user.email || signUpEmail, res.user);
        navigate('/');
      }
    } catch (err: any) {
      setSignUpError(err.message || 'Registration failed. Please check form entries.');
    } finally {
      setSignUpLoading(false);
    }
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
          </div>

          {/* Right Form Panel: Solid White Auth Card */}
          <div className="signin-form-panel">
            <div className="signin-form-box">
              {/* Header */}
              <div className="auth-header-block">
                <h1 className="signin-title">
                  {authMode === 'signin'
                    ? 'Sign In'
                    : selectedRole === 'fieldworker'
                    ? 'Fieldworker Registration'
                    : 'Public Registration'}
                </h1>
                <p className="signin-subtitle">
                  {authMode === 'signin'
                    ? 'Bangladesh Flood Relief Coordination Platform'
                    : selectedRole === 'fieldworker'
                    ? 'Fieldworker credentials and personal verification'
                    : 'Minimal, fast registration for community volunteers'}
                </p>
              </div>

              {/* Role Selection Tabs: Public Access vs Field Worker */}
              <div className="role-selector-tabs" role="tablist">
                <button
                  type="button"
                  className={`role-tab ${selectedRole === 'public' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('public')}
                >
                  PUBLIC ACCESS
                </button>
                <button
                  type="button"
                  className={`role-tab ${selectedRole === 'fieldworker' ? 'active' : ''}`}
                  onClick={() => setSelectedRole('fieldworker')}
                >
                  FIELD WORKER
                </button>
              </div>

              {/* Auth Mode Toggle: Sign In vs Create Account */}
              <div className="auth-mode-pill-toggle">
                <button
                  type="button"
                  className={`mode-pill ${authMode === 'signin' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('signin');
                    setSignInError('');
                  }}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  className={`mode-pill ${authMode === 'signup' ? 'active' : ''}`}
                  onClick={() => {
                    setAuthMode('signup');
                    setSignUpError('');
                  }}
                >
                  Create Account
                </button>
              </div>

              {/* Inner Auth Box */}
              <div className="auth-card-box">
                {/* ══════════════════════════════════════
                    MODE 1: SIGN IN (Direct email, no OTP required)
                   ══════════════════════════════════════ */}
                {authMode === 'signin' && (
                  <div>
                    {!showOtpSignIn ? (
                      <form onSubmit={handleDirectSignIn} className="auth-form-stack">
                        <div className="field-group">
                          <label className="field-label" htmlFor="signin-email-input">
                            EMAIL ADDRESS
                          </label>
                          <div className="input-with-icon-row">
                            <Mail size={16} className="input-leading-icon" />
                            <input
                              id="signin-email-input"
                              type="email"
                              value={signInEmail}
                              onChange={(e) => setSignInEmail(e.target.value)}
                              className="auth-text-input leading-icon-input"
                              placeholder="name@example.com"
                              required
                              autoFocus
                            />
                          </div>
                        </div>

                        {signInError && (
                          <div className="auth-error-banner">
                            <span>{signInError}</span>
                            {signInError.includes('No registered account') && (
                              <button
                                type="button"
                                className="inline-link-btn"
                                onClick={() => {
                                  setSignUpEmail(signInEmail);
                                  setAuthMode('signup');
                                }}
                              >
                                Create Account
                              </button>
                            )}
                          </div>
                        )}

                        <button
                          type="submit"
                          className="submit-btn-navy"
                          disabled={signInLoading}
                        >
                          <span>{signInLoading ? 'Signing In...' : 'Sign In'}</span>
                          <ArrowRight size={15} />
                        </button>

                        <div className="or-divider-row">
                          <span className="or-line" />
                          <span className="or-text">or</span>
                          <span className="or-line" />
                        </div>

                        <button
                          type="button"
                          className="btn-outline-navy"
                          onClick={() => {
                            setShowOtpSignIn(true);
                            if (signInEmail) handleSendSignInOtp();
                          }}
                        >
                          Sign In with Email OTP
                        </button>

                        <p className="otp-disclaimer">
                          Registered accounts log in directly without waiting for OTP.
                        </p>
                      </form>
                    ) : (
                      /* Sign In with OTP flow */
                      <div className="auth-form-stack">
                        <div className="otp-header-row">
                          <span className="field-label">SIGN IN VIA RESEND OTP</span>
                          <button
                            type="button"
                            className="change-auth-btn"
                            onClick={() => {
                              setShowOtpSignIn(false);
                              setSignInOtpSent(false);
                            }}
                          >
                            <ArrowLeft size={11} />
                            <span>Direct Login</span>
                          </button>
                        </div>

                        {!signInOtpSent ? (
                          <div className="auth-form-stack">
                            <div className="field-group">
                              <label className="field-label">CONFIRM EMAIL</label>
                              <input
                                type="email"
                                value={signInEmail}
                                onChange={(e) => setSignInEmail(e.target.value)}
                                className="auth-text-input"
                                placeholder="name@example.com"
                                required
                              />
                            </div>
                            <button
                              type="button"
                              className="submit-btn-navy"
                              onClick={handleSendSignInOtp}
                              disabled={signInLoading}
                            >
                              <span>{signInLoading ? 'Dispatching...' : 'Send OTP via Resend'}</span>
                              <ArrowRight size={15} />
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleVerifySignInOtp} className="auth-form-stack">
                            <div className="field-group">
                              <label className="field-label">ENTER 6-DIGIT OTP CODE</label>
                              <input
                                type="text"
                                maxLength={6}
                                value={signInOtpCode}
                                onChange={(e) => setSignInOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="auth-text-input otp-code-input"
                                placeholder="123456"
                                required
                                autoFocus
                              />
                            </div>

                            {signInDebugOtp && (
                              <button
                                type="button"
                                className="dev-otp-badge"
                                onClick={() => setSignInOtpCode(signInDebugOtp)}
                              >
                                <Sparkles size={12} />
                                <span>Dev OTP: {signInDebugOtp} (Click to fill)</span>
                              </button>
                            )}

                            {signInError && (
                              <div className="auth-error-banner">
                                <span>{signInError}</span>
                              </div>
                            )}

                            <button
                              type="submit"
                              className="submit-btn-navy"
                              disabled={signInLoading}
                            >
                              <span>{signInLoading ? 'Verifying...' : 'Verify & Enter System'}</span>
                              <ArrowRight size={15} />
                            </button>
                          </form>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* ══════════════════════════════════════
                    MODE 2: SIGN UP (Requires Resend Email OTP)
                   ══════════════════════════════════════ */}
                {authMode === 'signup' && (
                  <div>
                    {/* Step 1: Send & Verify OTP */}
                    {signUpStep === 1 && (
                      <div className="auth-form-stack">
                        {!signUpOtpSent ? (
                          <form onSubmit={handleSendSignUpOtp} className="auth-form-stack">
                            <div className="field-group">
                              <label className="field-label" htmlFor="signup-email-input">
                                EMAIL ADDRESS (VERIFIED VIA RESEND)
                              </label>
                              <div className="input-with-icon-row">
                                <Mail size={16} className="input-leading-icon" />
                                <input
                                  id="signup-email-input"
                                  type="email"
                                  value={signUpEmail}
                                  onChange={(e) => setSignUpEmail(e.target.value)}
                                  className="auth-text-input leading-icon-input"
                                  placeholder="you@example.com"
                                  required
                                  autoFocus
                                />
                              </div>
                            </div>

                            {signUpError && (
                              <div className="auth-error-banner">
                                <span>{signUpError}</span>
                              </div>
                            )}

                            <button
                              type="submit"
                              className="submit-btn-navy"
                              disabled={signUpLoading}
                            >
                              <span>{signUpLoading ? 'Sending...' : 'Send Verification OTP'}</span>
                              <ArrowRight size={15} />
                            </button>
                            <p className="otp-disclaimer">
                              A 6-digit security code will be sent to your email via Resend.
                            </p>
                          </form>
                        ) : (
                          <form onSubmit={handleVerifySignUpOtp} className="auth-form-stack">
                            <div className="field-group">
                              <div className="otp-header-row">
                                <label className="field-label" htmlFor="signup-otp-input">
                                  ENTER 6-DIGIT CODE SENT TO {signUpEmail}
                                </label>
                                <button
                                  type="button"
                                  className="change-auth-btn"
                                  onClick={() => setSignUpOtpSent(false)}
                                >
                                  <ArrowLeft size={11} />
                                  <span>Edit</span>
                                </button>
                              </div>
                              <input
                                id="signup-otp-input"
                                type="text"
                                maxLength={6}
                                value={signUpOtpCode}
                                onChange={(e) => setSignUpOtpCode(e.target.value.replace(/\D/g, ''))}
                                className="auth-text-input otp-code-input"
                                placeholder="123456"
                                required
                                autoFocus
                              />
                            </div>

                            {signUpDebugOtp && (
                              <button
                                type="button"
                                className="dev-otp-badge"
                                onClick={() => setSignUpOtpCode(signUpDebugOtp)}
                              >
                                <Sparkles size={12} />
                                <span>Dev OTP: {signUpDebugOtp} (Click to fill)</span>
                              </button>
                            )}

                            {signUpError && (
                              <div className="auth-error-banner">
                                <span>{signUpError}</span>
                              </div>
                            )}

                            <button
                              type="submit"
                              className="submit-btn-navy"
                              disabled={signUpLoading}
                            >
                              <span>{signUpLoading ? 'Verifying...' : 'Verify & Continue Profile'}</span>
                              <ArrowRight size={15} />
                            </button>
                          </form>
                        )}
                      </div>
                    )}

                    {/* Step 2: Minimal Profile Setup (Public / Fieldworker) */}
                    {signUpStep === 2 && (
                      <form onSubmit={handleCompleteRegistration} className="auth-form-stack profile-scroll-stack">
                        {/* Verified Email Banner */}
                        <div className="verified-email-badge">
                          <CheckCircle2 size={15} className="verified-icon" />
                          <span className="verified-text">{signUpEmail}</span>
                          <span className="verified-tag">Email Verified</span>
                        </div>

                        {/* First Name & Last Name */}
                        <div className="form-two-cols">
                          <div className="field-group">
                            <label className="field-label" htmlFor="first-name">FIRST NAME *</label>
                            <input
                              id="first-name"
                              type="text"
                              value={firstName}
                              onChange={(e) => setFirstName(e.target.value)}
                              className="auth-text-input"
                              placeholder="e.g. Rahim"
                              required
                            />
                          </div>
                          <div className="field-group">
                            <label className="field-label" htmlFor="last-name">LAST NAME *</label>
                            <input
                              id="last-name"
                              type="text"
                              value={lastName}
                              onChange={(e) => setLastName(e.target.value)}
                              className="auth-text-input"
                              placeholder="e.g. Uddin"
                              required
                            />
                          </div>
                        </div>

                        {/* Gender & Phone */}
                        <div className="form-two-cols">
                          <div className="field-group">
                            <label className="field-label">GENDER</label>
                            <select
                              value={gender}
                              onChange={(e) => setGender(e.target.value)}
                              className="auth-select-input"
                            >
                              {authOptions.genders.map((g) => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>
                          <div className="field-group">
                            <label className="field-label" htmlFor="phone-number">PHONE (OPTIONAL)</label>
                            <input
                              id="phone-number"
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="auth-text-input"
                              placeholder="01XXXXXXXXX"
                            />
                          </div>
                        </div>

                        {/* Avatar Picker */}
                        <div className="field-group">
                          <label className="field-label">CHOOSE AVATAR</label>
                          <div className="avatar-picker-row">
                            {PRESET_AVATARS.map((av) => (
                              <button
                                key={av.id}
                                type="button"
                                className={`avatar-item-btn ${selectedAvatar === av.url && !showCustomAvatarInput ? 'active' : ''}`}
                                onClick={() => {
                                  setSelectedAvatar(av.url);
                                  setShowCustomAvatarInput(false);
                                }}
                                title={av.name}
                              >
                                <img src={av.url} alt={av.name} className="avatar-img" />
                              </button>
                            ))}
                            <button
                              type="button"
                              className={`avatar-item-btn custom-av-toggle ${showCustomAvatarInput ? 'active' : ''}`}
                              onClick={() => setShowCustomAvatarInput(!showCustomAvatarInput)}
                              title="Custom Avatar URL"
                            >
                              +
                            </button>
                          </div>
                          {showCustomAvatarInput && (
                            <input
                              type="url"
                              value={customAvatarUrl}
                              onChange={(e) => setCustomAvatarUrl(e.target.value)}
                              className="auth-text-input mt-2"
                              placeholder="Paste custom image URL (https://...)"
                            />
                          )}
                        </div>

                        {/* Skills Selection (Predefined + Custom) */}
                        <div className="field-group">
                          <div className="chips-header-row">
                            <label className="field-label">SKILLS (SELECT OR ADD CUSTOM)</label>
                            <span className="chips-count">{selectedSkills.length} selected</span>
                          </div>
                          <div className="chips-container">
                            {authOptions.skills.map((skill) => {
                              const isSelected = selectedSkills.includes(skill);
                              return (
                                <button
                                  key={skill}
                                  type="button"
                                  className={`chip-btn ${isSelected ? 'active' : ''}`}
                                  onClick={() => toggleSkill(skill)}
                                >
                                  {isSelected && <CheckCircle2 size={12} />}
                                  <span>{skill}</span>
                                </button>
                              );
                            })}
                            {/* Render custom added skills */}
                            {selectedSkills
                              .filter((s) => !authOptions.skills.includes(s))
                              .map((customSkill) => (
                                <button
                                  key={customSkill}
                                  type="button"
                                  className="chip-btn active custom-chip"
                                  onClick={() => toggleSkill(customSkill)}
                                >
                                  <span>{customSkill}</span>
                                  <X size={11} />
                                </button>
                              ))}
                          </div>
                          {/* Custom Skill Input */}
                          <div className="custom-tag-input-row">
                            <input
                              type="text"
                              value={customSkillInput}
                              onChange={(e) => setCustomSkillInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCustomSkill();
                                }
                              }}
                              className="auth-text-input tag-input-field"
                              placeholder="Type custom skill..."
                            />
                            <button
                              type="button"
                              className="add-tag-btn"
                              onClick={addCustomSkill}
                            >
                              <Plus size={13} /> Add
                            </button>
                          </div>
                        </div>

                        {/* Equipment Selection (Predefined + Custom) */}
                        <div className="field-group">
                          <div className="chips-header-row">
                            <label className="field-label">EQUIPMENT (SELECT OR ADD CUSTOM)</label>
                            <span className="chips-count">{selectedEquipment.length} selected</span>
                          </div>
                          <div className="chips-container">
                            {authOptions.equipment.map((item) => {
                              const isSelected = selectedEquipment.includes(item);
                              return (
                                <button
                                  key={item}
                                  type="button"
                                  className={`chip-btn ${isSelected ? 'active' : ''}`}
                                  onClick={() => toggleEquipment(item)}
                                >
                                  {isSelected && <CheckCircle2 size={12} />}
                                  <span>{item}</span>
                                </button>
                              );
                            })}
                            {/* Render custom added equipment */}
                            {selectedEquipment
                              .filter((e) => !authOptions.equipment.includes(e))
                              .map((customItem) => (
                                <button
                                  key={customItem}
                                  type="button"
                                  className="chip-btn active custom-chip"
                                  onClick={() => toggleEquipment(customItem)}
                                >
                                  <span>{customItem}</span>
                                  <X size={11} />
                                </button>
                              ))}
                          </div>
                          {/* Custom Equipment Input */}
                          <div className="custom-tag-input-row">
                            <input
                              type="text"
                              value={customEquipmentInput}
                              onChange={(e) => setCustomEquipmentInput(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  addCustomEquipment();
                                }
                              }}
                              className="auth-text-input tag-input-field"
                              placeholder="Type custom equipment..."
                            />
                            <button
                              type="button"
                              className="add-tag-btn"
                              onClick={addCustomEquipment}
                            >
                              <Plus size={13} /> Add
                            </button>
                          </div>
                        </div>

                        {/* ══════════════════════════════════════
                            FIELDWORKER EXTRA FIELDS (Verification)
                           ══════════════════════════════════════ */}
                        {selectedRole === 'fieldworker' && (
                          <div className="fieldworker-verification-box">
                            <div className="verification-box-header">
                              <ShieldCheck size={16} className="text-emerald-500" />
                              <span className="verification-box-title">
                                Personal Verification &amp; Certification
                              </span>
                            </div>

                            <div className="form-two-cols">
                              <div className="field-group">
                                <label className="field-label" htmlFor="nid-input">
                                  NID NUMBER *
                                </label>
                                <input
                                  id="nid-input"
                                  type="text"
                                  value={nidNumber}
                                  onChange={(e) => setNidNumber(e.target.value)}
                                  className="auth-text-input"
                                  placeholder="10-17 digit NID"
                                  minLength={10}
                                  required
                                />
                              </div>

                              <div className="field-group">
                                <label className="field-label" htmlFor="dob-input">
                                  DATE OF BIRTH *
                                </label>
                                <input
                                  id="dob-input"
                                  type="date"
                                  value={dob}
                                  onChange={(e) => setDob(e.target.value)}
                                  className="auth-text-input"
                                  required
                                />
                              </div>
                            </div>

                            <div className="field-group">
                              <label className="field-label" htmlFor="address-input">
                                RESIDENTIAL / OPERATING ADDRESS *
                              </label>
                              <input
                                id="address-input"
                                type="text"
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                className="auth-text-input"
                                placeholder="House / Village, Upazila, District"
                                required
                              />
                            </div>

                            <div className="field-group">
                              <label className="field-label" htmlFor="cert-input">
                                EXPERIENCE CERTIFICATE / CREDENTIALS
                              </label>
                              <input
                                id="cert-input"
                                type="text"
                                value={experienceCertificate}
                                onChange={(e) => setExperienceCertificate(e.target.value)}
                                className="auth-text-input"
                                placeholder="e.g. Red Crescent First Aid Certified, Volunteer ID"
                              />
                            </div>
                          </div>
                        )}

                        {signUpError && (
                          <div className="auth-error-banner">
                            <span>{signUpError}</span>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="submit-btn-navy"
                          disabled={signUpLoading}
                        >
                          <span>{signUpLoading ? 'Creating Profile...' : 'Complete Registration & Enter'}</span>
                          <ArrowRight size={15} />
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Switcher */}
              <div className="signin-footer-row">
                {authMode === 'signin' ? (
                  <>
                    <span>Don't have an account? </span>
                    <button
                      type="button"
                      className="inline-toggle-link"
                      onClick={() => {
                        setAuthMode('signup');
                        setSignUpStep(1);
                      }}
                    >
                      Create one
                    </button>
                  </>
                ) : (
                  <>
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      className="inline-toggle-link"
                      onClick={() => setAuthMode('signin')}
                    >
                      Sign In
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

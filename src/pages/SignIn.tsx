import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { errorText } from '../services/api';
import { UserRole } from '../types';
import {
  validateWithSchema,
  emailSchema,
  otpCodeSchema
} from '../utils/validationSchemas';
import './SignIn.css';

const RESEND_COOLDOWN_SECONDS = 60;

const dashboardPath = (role: UserRole) =>
  role === 'admin' ? '/admin/command-center' : role === 'volunteer' ? '/volunteer/dashboard' : '/';

export const SignIn: React.FC = () => {
  const navigate = useNavigate();
  // Page the user was sent here from (see RequireRole), e.g. /admin/uav
  const returnTo = (useLocation().state as { from?: string } | null)?.from;
  const { user, isLoading: isRestoringSession, sendCode, verifyCode } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<'identify' | 'verify'>('identify');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [resendIn, setResendIn] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Already signed in (restored session, or arrived here from the emailed sign-in link)
  useEffect(() => {
    if (!isRestoringSession && user && step === 'identify') {
      navigate(returnTo || dashboardPath(user.role));
    }
  }, [isRestoringSession, user, step, navigate, returnTo]);

  useEffect(() => {
    if (resendIn <= 0) return;
    const timer = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendIn]);

  const resetToIdentify = () => {
    setStep('identify');
    setCode('');
    setErrorMessage(null);
  };

  const validateEmail = () => validateWithSchema(emailSchema, email.trim());

  const requestCode = async () => {
    const val = validateEmail();
    if (!val.success) {
      throw new Error(val.error);
    }
    await sendCode('email', val.data);
    setResendIn(RESEND_COOLDOWN_SECONDS);
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const val = validateEmail();
    if (!val.success) {
      setErrorMessage(val.error);
      return;
    }

    setIsLoading(true);
    try {
      await requestCode();
      setStep('verify');
    } catch (err: any) {
      setErrorMessage(errorText(err, 'Could not send the code. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setErrorMessage(null);
    const val = validateEmail();
    if (!val.success) {
      setErrorMessage(val.error);
      return;
    }
    try {
      await requestCode();
    } catch (err: any) {
      setErrorMessage(errorText(err, 'Could not resend the code. Please try again.'));
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const codeVal = validateWithSchema(otpCodeSchema, code);
    if (!codeVal.success) {
      setErrorMessage(codeVal.error);
      return;
    }

    setIsLoading(true);
    try {
      const signedIn = await verifyCode('email', email.trim(), codeVal.data);
      navigate(returnTo || dashboardPath(signedIn.role));
    } catch (err: any) {
      setErrorMessage(errorText(err, 'Failed to sign in. Please try again.'));
    } finally {
      setIsLoading(false);
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
                {t('hadithQuote')}
              </blockquote>
              <cite className="hadith-citation">{t('hadithCitation')}</cite>
            </div>

            <div className="signin-stats-grid">
              <div className="signin-stat-card">
                <div className="signin-stat-number">1.2M+</div>
                <div className="signin-stat-label">{t('peopleHelped')}</div>
              </div>
              <div className="signin-stat-card">
                <div className="signin-stat-number">847</div>
                <div className="signin-stat-label">{t('specialShelters')}</div>
              </div>
              <div className="signin-stat-card">
                <div className="signin-stat-number">38</div>
                <div className="signin-stat-label">{t('partnerOrgs')}</div>
              </div>
              <div className="signin-stat-card">
                <div className="signin-stat-number">98%</div>
                <div className="signin-stat-label">{t('specialOps')}</div>
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
                <h1 className="signin-title">{t('signIn')}</h1>
                <p className="signin-subtitle">
                  Enter your email address and we'll send a one-time sign-in code. No password needed.
                </p>
              </div>

              {/* Main Auth Card Box */}
              <div className="auth-card-box">
                {errorMessage && (
                  <div role="alert" style={{ padding: '8px 12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', color: '#991b1b', fontSize: '12px', marginBottom: '12px' }}>
                    {errorMessage}
                  </div>
                )}

                {step === 'identify' ? (
                  <form onSubmit={handleSendCode} className="auth-form-stack">
                    <div className="field-group">
                      <label className="field-label" htmlFor="email-input">EMAIL ADDRESS</label>
                      <input
                        id="email-input"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="auth-text-input"
                        placeholder="name@example.com"
                        autoComplete="email"
                        required
                        autoFocus
                      />
                    </div>

                    <button type="submit" className="submit-btn-navy" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Sending code...</span>
                        </>
                      ) : (
                        <>
                          <span>Send Sign-In Code</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                    <p className="otp-disclaimer">
                      We'll email you a one-time code and a sign-in link.
                    </p>
                  </form>
                ) : (
                  <form onSubmit={handleVerify} className="auth-form-stack">
                    <div className="field-group">
                      <div className="otp-header-row">
                        <label className="field-label" htmlFor="code-input">ENTER CODE</label>
                        <button type="button" className="change-auth-btn" onClick={resetToIdentify}>
                          <ArrowLeft size={12} />
                          Change email
                        </button>
                      </div>
                      <input
                        id="code-input"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        pattern="[0-9]{6,10}"
                        maxLength={10}
                        value={code}
                        onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                        className="auth-text-input otp-code-input"
                        placeholder="••••••"
                        required
                        autoFocus
                      />
                      <p className="otp-disclaimer" style={{ textAlign: 'left' }}>
                        Sent to <strong>{email.trim()}</strong>. You can also tap the sign-in link in the email.
                      </p>
                    </div>

                    <button type="submit" className="submit-btn-navy" disabled={isLoading || code.length < 6}>
                      {isLoading ? (
                        <>
                          <Loader2 size={15} className="animate-spin" />
                          <span>Verifying...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify &amp; Sign In</span>
                          <ArrowRight size={15} />
                        </>
                      )}
                    </button>
                    <p className="otp-disclaimer">
                      Didn't get it?{' '}
                      <button type="button" className="change-auth-btn" onClick={handleResend} disabled={resendIn > 0}>
                        {resendIn > 0 ? `Resend code in ${resendIn}s` : 'Resend code'}
                      </button>
                    </p>
                  </form>
                )}
              </div>

              <div className="signin-footer-row">
                <span>{t('dontHaveAccount')} </span>
                <Link to="/volunteer/register" className="create-link">
                  {t('createOne')}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

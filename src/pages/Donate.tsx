import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, Loader2, AlertCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useCampaigns } from '../hooks/queries';
import { donationService } from '../services/donationService';
import { ApiError } from '../services/api';
import { useLanguage } from '../context/LanguageContext';
import './Donate.css';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

export const Donate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const { data: campaigns = [] } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);

  const [amount, setAmount] = useState<number>(1000);
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');
  const [donorPhone, setDonorPhone] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setError(null);
    setBusy(true);
    try {
      const { gatewayUrl } = await donationService.initDonation({
        campaignId: id,
        amount,
        donorName,
        donorEmail,
        donorPhone
      });
      // Full browser redirect — this leaves the app for SSLCommerz's real hosted checkout.
      window.location.href = gatewayUrl;
    } catch (err) {
      setBusy(false);
      setError(err instanceof ApiError ? err.message : 'Could not start the payment. Check your connection and try again.');
    }
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="donate-page-bg">
        <div className="donate-container">
          <Link to="/campaigns" className="donate-back-link">
            <ArrowLeft size={14} /> {t('donateBackToCampaigns')}
          </Link>

          <div className="donate-grid">
            {/* Order summary */}
            <div className="donate-summary-card">
              <div className="donate-gateway-badge">
                <ShieldCheck size={14} /> {t('donateSecuredBy')}
              </div>
              <h3>{campaign ? campaign.title : t('donateReliefCampaign')}</h3>
              {campaign && <p className="donate-summary-org">{campaign.organization} • {campaign.district}</p>}
              <div className="donate-summary-row">
                <span>{t('donateAmountLabel')}</span>
                <strong>৳{amount.toLocaleString()}</strong>
              </div>
              <p className="donate-summary-note">
                You'll be redirected to SSLCommerz's real sandbox checkout to choose a card, bKash,
                Nagad, Rocket, or net banking test payment. No real money moves — this is SSLCommerz's
                own test environment, not a simulation built by Shohay.
              </p>
            </div>

            {/* Donor + amount form */}
            <form className="donate-form-card" onSubmit={handlePay}>
              {error && (
                <div role="alert" style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#fef2f2', border: '1px solid #fecaca', color: '#991b1b', borderRadius: 6, padding: '10px 12px', fontSize: 13, marginBottom: 16 }}>
                  <AlertCircle size={16} />
                  <span>{error}</span>
                </div>
              )}

              <h3 className="donate-form-title">{t('donateChooseAmountTitle')}</h3>
              <div className="donate-amount-grid">
                {PRESET_AMOUNTS.map((a) => (
                  <button
                    type="button"
                    key={a}
                    className={`donate-amount-btn ${amount === a ? 'active' : ''}`}
                    onClick={() => setAmount(a)}
                  >
                    ৳{a.toLocaleString()}
                  </button>
                ))}
              </div>
              <input
                type="number"
                min={10}
                max={500000}
                className="donate-amount-input"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder={t('donateCustomAmountPlaceholder')}
                required
              />

              <h3 className="donate-form-title" style={{ marginTop: 20 }}>{t('donateYourDetailsTitle')}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <input
                  type="text"
                  className="donate-text-input"
                  placeholder={t('donateFullNamePlaceholder')}
                  value={donorName}
                  onChange={(e) => setDonorName(e.target.value)}
                  required
                  minLength={2}
                />
                <input
                  type="email"
                  className="donate-text-input"
                  placeholder={t('donateEmailPlaceholder')}
                  value={donorEmail}
                  onChange={(e) => setDonorEmail(e.target.value)}
                  required
                />
                <input
                  type="tel"
                  className="donate-text-input"
                  placeholder={t('donateMobilePlaceholder')}
                  value={donorPhone}
                  onChange={(e) => setDonorPhone(e.target.value)}
                  required
                  minLength={6}
                />
              </div>

              <button type="submit" className="donate-btn-primary" disabled={busy || amount < 10 || !campaign} style={{ width: '100%', marginTop: 18 }}>
                {busy ? <Loader2 size={16} className="animate-spin" /> : `${t('donateContinueToPayment')} — ৳${amount.toLocaleString()}`}
              </button>
              <p className="donate-disclaimer">You'll leave Shohay to complete payment on SSLCommerz's secure sandbox page.</p>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

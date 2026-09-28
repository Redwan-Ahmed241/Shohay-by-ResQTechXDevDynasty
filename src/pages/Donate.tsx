import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, CheckCircle2, Loader2 } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useCampaigns } from '../hooks/queries';
import './Donate.css';

type PayMethod = 'bkash' | 'nagad' | 'rocket' | 'card';

const PRESET_AMOUNTS = [500, 1000, 2500, 5000];

const METHODS: Array<{ id: PayMethod; label: string; color: string }> = [
  { id: 'bkash', label: 'bKash', color: '#e2136e' },
  { id: 'nagad', label: 'Nagad', color: '#f6921e' },
  { id: 'rocket', label: 'Rocket', color: '#8c3494' },
  { id: 'card', label: 'Card', color: '#0f172a' }
];

export const Donate: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: campaigns = [] } = useCampaigns();
  const campaign = campaigns.find((c) => c.id === id);

  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<PayMethod>('bkash');
  const [phone, setPhone] = useState('');
  const [status, setStatus] = useState<'idle' | 'processing' | 'done'>('idle');

  const handlePay = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('processing');
    // Demo checkout only — no real payment gateway is called.
    setTimeout(() => setStatus('done'), 1400);
  };

  if (status === 'done') {
    return (
      <PageLayout showAlertBanner={false}>
        <div className="donate-page-bg">
          <div className="donate-card donate-success">
            <CheckCircle2 size={40} color="#059669" />
            <h2>Thank you for your support</h2>
            <p>
              ৳{amount.toLocaleString()} for {campaign ? campaign.title : 'this campaign'} — a confirmation would
              normally be emailed to you. This is a demo checkout, so no real payment was made.
            </p>
            <button className="donate-btn-primary" onClick={() => navigate('/campaigns')}>
              Back to Campaigns
            </button>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showAlertBanner={false}>
      <div className="donate-page-bg">
        <div className="donate-container">
          <Link to="/campaigns" className="donate-back-link">
            <ArrowLeft size={14} /> Back to Campaigns
          </Link>

          <div className="donate-grid">
            {/* Order summary */}
            <div className="donate-summary-card">
              <div className="donate-gateway-badge">
                <ShieldCheck size={14} /> Secured Checkout (Demo)
              </div>
              <h3>{campaign ? campaign.title : 'Relief Campaign'}</h3>
              {campaign && <p className="donate-summary-org">{campaign.organization} • {campaign.district}</p>}
              <div className="donate-summary-row">
                <span>Donation amount</span>
                <strong>৳{amount.toLocaleString()}</strong>
              </div>
              <p className="donate-summary-note">
                This is a demo checkout page styled after SSLCommerz, Bangladesh's common payment
                gateway. No real transaction or money transfer happens here.
              </p>
            </div>

            {/* Payment form */}
            <form className="donate-form-card" onSubmit={handlePay}>
              <h3 className="donate-form-title">Choose Amount (BDT)</h3>
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
                min={50}
                className="donate-amount-input"
                value={amount}
                onChange={(e) => setAmount(Math.max(0, parseInt(e.target.value) || 0))}
                placeholder="Custom amount"
              />

              <h3 className="donate-form-title" style={{ marginTop: 20 }}>Payment Method</h3>
              <div className="donate-method-grid">
                {METHODS.map((m) => (
                  <button
                    type="button"
                    key={m.id}
                    className={`donate-method-btn ${method === m.id ? 'active' : ''}`}
                    style={{ ['--method-color' as any]: m.color }}
                    onClick={() => setMethod(m.id)}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              {method !== 'card' ? (
                <input
                  type="tel"
                  className="donate-text-input"
                  placeholder={`${METHODS.find((m) => m.id === method)?.label} account number`}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              ) : (
                <div className="donate-card-fields">
                  <input type="text" className="donate-text-input" placeholder="Card number" required />
                  <div style={{ display: 'flex', gap: 10 }}>
                    <input type="text" className="donate-text-input" placeholder="MM/YY" required />
                    <input type="text" className="donate-text-input" placeholder="CVC" required />
                  </div>
                </div>
              )}

              <button type="submit" className="donate-btn-primary" disabled={status === 'processing' || amount <= 0} style={{ width: '100%', marginTop: 16 }}>
                {status === 'processing' ? <Loader2 size={16} className="animate-spin" /> : `Pay ৳${amount.toLocaleString()}`}
              </button>
              <p className="donate-disclaimer">Demo gateway — for evaluation purposes only.</p>
            </form>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

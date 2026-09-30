import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle2, XCircle, Ban, Loader2 } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { donationService, DonationStatus } from '../services/donationService';
import { useLanguage } from '../context/LanguageContext';
import './Donate.css';

interface Props {
  outcome: 'success' | 'fail' | 'cancel';
}

export const DonateResult: React.FC<Props> = ({ outcome }) => {
  const { t } = useLanguage();
  const [params] = useSearchParams();
  const tranId = params.get('tran_id') || '';
  const [status, setStatus] = useState<DonationStatus | null>(null);
  const [loading, setLoading] = useState(!!tranId);

  useEffect(() => {
    if (!tranId) return;
    donationService.getStatus(tranId).then(setStatus).catch(() => undefined).finally(() => setLoading(false));
  }, [tranId]);

  const copy = {
    success: {
      icon: <CheckCircle2 size={40} color="#059669" />,
      title: t('donateSuccessTitle'),
      fallback: t('donateSuccessFallback')
    },
    fail: {
      icon: <XCircle size={40} color="#dc2626" />,
      title: t('donateFailTitle'),
      fallback: t('donateFailedFallback')
    },
    cancel: {
      icon: <Ban size={40} color="#d97706" />,
      title: t('donateCancelTitle'),
      fallback: t('donatePendingFallback')
    }
  }[outcome];

  return (
    <PageLayout showAlertBanner={false}>
      <div className="donate-page-bg">
        <div className="donate-card donate-success">
          {loading ? <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto' }} /> : copy.icon}
          <h2>{copy.title}</h2>
          <p>
            {status
              ? `৳${status.amount.toLocaleString()} — ${status.status === 'Success' ? 'confirmed by SSLCommerz.' : `status: ${status.status}.`}`
              : copy.fallback}
            {tranId && <><br /><span style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>Ref: {tranId}</span></>}
          </p>
          <div className="donate-result-actions">
            <Link to="/campaigns" className="donate-btn-primary">{t('donateBackToCampaigns')}</Link>
            {outcome !== 'success' && <Link to="/campaigns" className="donate-btn-outline">{t('donateTryAgain')}</Link>}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

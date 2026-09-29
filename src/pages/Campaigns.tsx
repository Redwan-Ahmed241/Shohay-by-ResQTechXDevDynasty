import React from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout } from '../components/layout/PageLayout';
import { useCampaigns, useCampaignSummary } from '../hooks/queries';
import { useLanguage } from '../context/LanguageContext';
import './Campaigns.css';

export const Campaigns: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { data: summaryStats } = useCampaignSummary();
  const { data: campaigns = [] } = useCampaigns();

  return (
    <PageLayout showAlertBanner={false}>
      <div className="campaigns-page-bg">
        <div className="campaigns-container">
          {/* Header Title */}
          <div className="campaigns-header-text text-center">
            <h1 className="campaigns-title">{t('campaignsTitle')}</h1>
            <p className="campaigns-subtitle">{t('campaignsSubtitle')}</p>
          </div>

          {/* Top 3 Summary Cards */}
          {summaryStats && (
            <div className="campaign-summary-grid">
              <div className="c-stat-box box-green">
                <div className="c-stat-num">{summaryStats.activeCampaigns}</div>
                <div className="c-stat-lbl">{t('activeCampaignsLabel')}</div>
              </div>
              <div className="c-stat-box box-blue">
                <div className="c-stat-num">{summaryStats.householdsReached}</div>
                <div className="c-stat-lbl">{t('householdsReachedLabel')}</div>
              </div>
              <div className="c-stat-box box-purple">
                <div className="c-stat-num">৳{summaryStats.totalRaisedBDT}</div>
                <div className="c-stat-lbl">{t('totalRaisedBDTLabel')}</div>
              </div>
            </div>
          )}

          {/* Campaign Cards List */}
          <div className="campaigns-cards-stack">
            {campaigns.map((camp) => {
              const fundingPct = Math.round((camp.raisedAmount / camp.targetAmount) * 100);

              return (
                <div key={camp.id} className="campaign-item-card">
                  <div className="c-card-top-row">
                    <div>
                      <h3 className="c-card-title">{camp.title}</h3>
                      <div className="c-card-org">{camp.organization} • {camp.district}</div>
                    </div>
                    <span className="badge-verified-gov">{camp.verificationStatus}</span>
                  </div>

                  {/* Funding Progress */}
                  <div className="c-progress-section">
                    <div className="c-progress-text-row">
                      <span className="c-raised-amount">৳{camp.raisedAmount.toLocaleString()}</span>
                      <span className="c-target-amount">{t('ofTarget')} ৳{camp.targetAmount.toLocaleString()} ({fundingPct}%)</span>
                    </div>
                    <div className="c-progress-track">
                      <div className="c-progress-fill" style={{ width: `${fundingPct}%` }} />
                    </div>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="c-card-bottom-row">
                    <span className="c-households-text">
                      {camp.householdsReached.toLocaleString()} / {camp.householdsTarget.toLocaleString()} {t('householdsReachedText')}
                    </span>
                    <button className="c-btn-donate" onClick={() => navigate(`/donate/${camp.id}`)}>
                      {t('viewDonateBtn')}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

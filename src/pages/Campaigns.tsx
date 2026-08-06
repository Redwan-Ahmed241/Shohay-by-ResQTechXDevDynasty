import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { campaignService } from '../services/campaignService';
import { ReliefCampaign } from '../types';
import './Campaigns.css';

export const Campaigns: React.FC = () => {
  const [campaigns, setCampaigns] = useState<ReliefCampaign[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const stats = await campaignService.getCampaignSummaryStats();
    setSummaryStats(stats);

    const list = await campaignService.getCampaigns();
    setCampaigns(list);
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="campaigns-page-bg">
        <div className="campaigns-container">
          {/* Header Title */}
          <div className="campaigns-header-text text-center">
            <h1 className="campaigns-title">Relief Campaigns &amp; Donations</h1>
            <p className="campaigns-subtitle">All campaigns are verified by SHOHAY before listing. Track fund usage transparently.</p>
          </div>

          {/* Top 3 Summary Cards */}
          {summaryStats && (
            <div className="campaign-summary-grid">
              <div className="c-stat-box box-green">
                <div className="c-stat-num">{summaryStats.activeCampaigns}</div>
                <div className="c-stat-lbl">Active Campaigns</div>
              </div>
              <div className="c-stat-box box-blue">
                <div className="c-stat-num">{summaryStats.householdsReached}</div>
                <div className="c-stat-lbl">Households Reached</div>
              </div>
              <div className="c-stat-box box-purple">
                <div className="c-stat-num">৳{summaryStats.totalRaisedBDT}</div>
                <div className="c-stat-lbl">Total Raised (BDT)</div>
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
                      <span className="c-target-amount">of ৳{camp.targetAmount.toLocaleString()} ({fundingPct}%)</span>
                    </div>
                    <div className="c-progress-track">
                      <div className="c-progress-fill" style={{ width: `${fundingPct}%` }} />
                    </div>
                  </div>

                  {/* Card Bottom Row */}
                  <div className="c-card-bottom-row">
                    <span className="c-households-text">
                      {camp.householdsReached.toLocaleString()} / {camp.householdsTarget.toLocaleString()} households reached
                    </span>
                    <button className="c-btn-donate">
                      View &amp; Donate →
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

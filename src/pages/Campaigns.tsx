import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Button } from '../components/ui/Button';
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
      <div className="container campaigns-page">
        {/* Header Title */}
        <div className="page-header text-center mb-6">
          <h1>Relief Campaigns</h1>
          <p>All campaigns are verified by SHOHAY before listing. Track fund usage transparently.</p>
        </div>

        {/* Top Summary Stats Bar */}
        {summaryStats && (
          <div className="campaign-stats-bar grid-3 gap-4 mb-8">
            <div className="summary-stat-box box-green">
              <div className="summary-num">{summaryStats.activeCampaigns}</div>
              <div className="summary-lbl">Active Campaigns</div>
            </div>
            <div className="summary-stat-box box-blue">
              <div className="summary-num">{summaryStats.householdsReached}</div>
              <div className="summary-lbl">Households Reached</div>
            </div>
            <div className="summary-stat-box box-purple">
              <div className="summary-num">{summaryStats.totalRaisedBDT}</div>
              <div className="summary-lbl">Total Raised (BDT)</div>
            </div>
          </div>
        )}

        {/* Campaign Cards List */}
        <div className="campaigns-list flex flex-col gap-6">
          {campaigns.map((camp) => {
            const fundingPct = Math.round((camp.raisedAmount / camp.targetAmount) * 100);

            return (
              <Card key={camp.id} className="campaign-card">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="campaign-title">{camp.title}</h3>
                    <div className="campaign-org">{camp.organization} — {camp.district}</div>
                  </div>
                  <Badge variant={camp.verificationStatus}>{camp.verificationStatus}</Badge>
                </div>

                {/* Progress Bar 1: Raised Amount BDT */}
                <div className="mt-4">
                  <ProgressBar
                    value={fundingPct}
                    label={`৳${camp.raisedAmount.toLocaleString()} / ৳${camp.targetAmount.toLocaleString()}`}
                    colorVariant="teal"
                  />
                </div>

                {/* Footer Details: Households reached & View/Donate CTA */}
                <div className="flex justify-between items-center mt-4">
                  <span className="households-text">
                    {camp.householdsReached.toLocaleString()} / {camp.householdsTarget.toLocaleString()} households reached
                  </span>
                  <Button variant="ghost" size="sm" className="donate-link">
                    View &amp; Donate &rarr;
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Anchor, Utensils, Activity, FileText } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import './VolunteerLanding.css';

export const VolunteerLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout showAlertBanner={false}>
      <div className="volunteer-landing-bg">
        <div className="volunteer-landing-container">
          {/* Top Hero Navy Card matching Figma */}
          <div className="vol-hero-card">
            <div className="vol-hero-icon-box">
              <Users size={28} />
            </div>
            <h1 className="vol-hero-title">Volunteer with SHOHOY</h1>
            <p className="vol-hero-sub">Join thousands of volunteers coordinating flood relief across Bangladesh.</p>

            <div className="vol-stats-grid">
              <div className="v-stat-card-navy">
                <div className="v-stat-num-big">89</div>
                <div className="v-stat-label-sub">Active Now</div>
              </div>
              <div className="v-stat-card-navy">
                <div className="v-stat-num-big">48h</div>
                <div className="v-stat-label-sub">Avg Response</div>
              </div>
              <div className="v-stat-card-navy">
                <div className="v-stat-num-big">4.3k</div>
                <div className="v-stat-label-sub">People Helped</div>
              </div>
            </div>
          </div>

          {/* How You Can Help Section */}
          <div className="vol-help-card">
            <h2 className="vol-help-title">How You Can Help</h2>

            <div className="help-types-grid">
              <div className="help-item-box">
                <div className="help-icon-wrapper text-teal">
                  <Anchor size={20} />
                </div>
                <div className="help-item-text">
                  <h4 className="help-item-title">Field Rescue</h4>
                  <p className="help-item-sub">Boat rescue, evacuation</p>
                </div>
              </div>

              <div className="help-item-box">
                <div className="help-icon-wrapper text-amber">
                  <Utensils size={20} />
                </div>
                <div className="help-item-text">
                  <h4 className="help-item-title">Distribution</h4>
                  <p className="help-item-sub">Food, water, supplies</p>
                </div>
              </div>

              <div className="help-item-box">
                <div className="help-icon-wrapper text-red">
                  <Activity size={20} />
                </div>
                <div className="help-item-text">
                  <h4 className="help-item-title">Medical Support</h4>
                  <p className="help-item-sub">First aid, health camps</p>
                </div>
              </div>

              <div className="help-item-box">
                <div className="help-icon-wrapper text-blue">
                  <FileText size={20} />
                </div>
                <div className="help-item-text">
                  <h4 className="help-item-title">Coordination</h4>
                  <p className="help-item-sub">Logistics, admin, data</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="vol-actions-row">
            <button className="btn-register-green" onClick={() => navigate('/volunteer/register')}>
              Register as Volunteer
            </button>
            <button className="btn-dashboard-outline" onClick={() => navigate('/volunteer/dashboard')}>
              View Dashboard
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

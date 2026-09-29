import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Anchor, Utensils, Activity, FileText } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useLanguage } from '../context/LanguageContext';
import './VolunteerLanding.css';

export const VolunteerLanding: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <PageLayout showAlertBanner={false}>
      <div className="volunteer-landing-bg">
        <div className="volunteer-landing-container">
          {/* Top Hero Navy Card matching Figma */}
          <div className="vol-hero-card">
            <div className="vol-hero-icon-box">
              <Users size={28} />
            </div>
            <h1 className="vol-hero-title">{t('volHeroTitle')}</h1>
            <p className="vol-hero-sub">{t('volHeroSub')}</p>

            <div className="vol-stats-grid">
              <div className="v-stat-card-navy">
                <div className="v-stat-num-big">89</div>
                <div className="v-stat-label-sub">{t('activeNowLabel')}</div>
              </div>
              <div className="v-stat-card-navy">
                <div className="v-stat-num-big">48h</div>
                <div className="v-stat-label-sub">{t('avgResponseLabel')}</div>
              </div>
              <div className="v-stat-card-navy">
                <div className="v-stat-num-big">4.3k</div>
                <div className="v-stat-label-sub">{t('peopleHelped')}</div>
              </div>
            </div>
          </div>

          {/* How You Can Help Section */}
          <div className="vol-help-card">
            <h2 className="vol-help-title">{t('homeHowHelpTitle')}</h2>

            <div className="help-types-grid">
              <div className="help-item-box">
                <div className="help-icon-wrapper text-teal">
                  <Anchor size={20} />
                </div>
                <div className="help-item-text">
                  <h4 className="help-item-title">{t('fieldRescue')}</h4>
                  <p className="help-item-sub">{t('fieldRescueSub')}</p>
                </div>
              </div>

              <div className="help-item-box">
                <div className="help-icon-wrapper text-amber">
                  <Utensils size={20} />
                </div>
                <div className="help-item-text">
                  <h4 className="help-item-title">{t('distributionTitle')}</h4>
                  <p className="help-item-sub">{t('distributionSub')}</p>
                </div>
              </div>

              <div className="help-item-box">
                <div className="help-icon-wrapper text-red">
                  <Activity size={20} />
                </div>
                <div className="help-item-text">
                  <h4 className="help-item-title">{t('medicalSupportTitle')}</h4>
                  <p className="help-item-sub">{t('medicalSupportSub')}</p>
                </div>
              </div>

              <div className="help-item-box">
                <div className="help-icon-wrapper text-blue">
                  <FileText size={20} />
                </div>
                <div className="help-item-text">
                  <h4 className="help-item-title">{t('coordinationTitle')}</h4>
                  <p className="help-item-sub">{t('coordinationSub')}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="vol-actions-row">
            <button className="btn-register-green" onClick={() => navigate('/volunteer/register')}>
              {t('registerAsVolunteerBtn')}
            </button>
            <button className="btn-dashboard-outline" onClick={() => navigate('/volunteer/dashboard')}>
              {t('viewDashboardBtn')}
            </button>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

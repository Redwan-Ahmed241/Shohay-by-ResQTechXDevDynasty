import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Anchor, Utensils, HeartPulse, FileText } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import './VolunteerLanding.css';

export const VolunteerLanding: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container volunteer-landing-page">
        {/* Top Hero Banner */}
        <Card className="vol-hero-card text-center flex flex-col items-center gap-4 py-10">
          <div className="vol-hero-icon">
            <Users size={32} />
          </div>
          <h1>Volunteer with SHOHOY</h1>
          <p className="max-w-md">Join thousands of volunteers coordinating flood relief across Bangladesh.</p>

          <div className="vol-stats-row grid-3 gap-6 my-4 w-full max-w-xl">
            <div className="v-stat-box">
              <div className="v-num">89</div>
              <div className="v-lbl">Active Now</div>
            </div>
            <div className="v-stat-box">
              <div className="v-num">48h</div>
              <div className="v-lbl">Avg Response</div>
            </div>
            <div className="v-stat-box">
              <div className="v-num">4.3k</div>
              <div className="v-lbl">People Helped</div>
            </div>
          </div>
        </Card>

        {/* How You Can Help Section */}
        <Card className="mt-8 p-6">
          <h2 className="mb-4">How You Can Help</h2>

          <div className="grid-2 gap-4">
            <div className="help-type-item flex gap-3 items-center">
              <div className="help-icon-box icon-teal">
                <Anchor size={20} />
              </div>
              <div>
                <h4 className="help-title">Field Rescue</h4>
                <p className="text-xs text-secondary">Boat rescue, evacuation assistance in flooded upazilas.</p>
              </div>
            </div>

            <div className="help-type-item flex gap-3 items-center">
              <div className="help-icon-box icon-orange">
                <Utensils size={20} />
              </div>
              <div>
                <h4 className="help-title">Distribution</h4>
                <p className="text-xs text-secondary">Food, water, and emergency supply packing &amp; delivery.</p>
              </div>
            </div>

            <div className="help-type-item flex gap-3 items-center">
              <div className="help-icon-box icon-purple">
                <HeartPulse size={20} />
              </div>
              <div>
                <h4 className="help-title">Medical Support</h4>
                <p className="text-xs text-secondary">First aid, mobile health camps, and doctor assistance.</p>
              </div>
            </div>

            <div className="help-type-item flex gap-3 items-center">
              <div className="help-icon-box icon-blue">
                <FileText size={20} />
              </div>
              <div>
                <h4 className="help-title">Coordination</h4>
                <p className="text-xs text-secondary">Shelter registration, admin, data entry &amp; phone lines.</p>
              </div>
            </div>
          </div>

          <div className="flex gap-4 justify-center mt-8">
            <Button variant="primary" size="lg" onClick={() => navigate('/volunteer/register')}>
              Register as Volunteer
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/volunteer/dashboard')}>
              View Dashboard
            </Button>
          </div>
        </Card>
      </div>
    </PageLayout>
  );
};

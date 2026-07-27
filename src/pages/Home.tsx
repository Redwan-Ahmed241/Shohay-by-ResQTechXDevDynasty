import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Shield,
  Search,
  PhoneCall,
  AlertTriangle,
  Heart,
  Users,
  FileText,
  Activity,
  ArrowRight,
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { requestService } from '../services/requestService';
import { MOCK_ALERTS } from '../data/alerts';
import './Home.css';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<any>(null);
  const [trackingError, setTrackingError] = useState('');

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError('');
    setTrackingResult(null);

    if (!trackingId.trim()) {
      setTrackingError('Please enter a valid tracking ID');
      return;
    }

    const res = await requestService.trackRequest(trackingId);
    if (res) {
      setTrackingResult(res);
    } else {
      setTrackingError('Request ID not found. Try SHY-2024-89211');
    }
  };

  return (
    <PageLayout showAlertBanner={true}>
      <div className="home-page">
        {/* ═══════════════════════════════════════════
           Hero Section
           ═══════════════════════════════════════════ */}
        <section className="hero-section">
          <div className="hero-overlay" />
          <div className="container hero-container">
            <div className="hero-badge">EMERGENCY RESPONSE — BANGLADESH</div>
            <h1 className="hero-title">Standing With Bangladesh in Times of Crisis.</h1>
            <p className="hero-description">
              Coordinating immediate rescue, shelter access, and transparent relief tracking for flood-affected communities across Bangladesh.
            </p>
            <div className="hero-actions">
              <Button size="lg" variant="primary" onClick={() => navigate('/get-help')}>
                REQUEST ASSISTANCE
              </Button>
              <Button size="lg" variant="outline" onClick={() => navigate('/campaigns')}>
                DONATE
              </Button>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
           Mission & Core Stats
           ═══════════════════════════════════════════ */}
        <section className="mission-section">
          <div className="container grid-2 items-center">
            <div className="mission-content">
              <span className="section-tag">OUR MISSION</span>
              <h2>We coordinate with communities impacted by floods to save lives, restore dignity, and rebuild resilience across Bangladesh.</h2>
              <Link to="/about" className="link-arrow">
                <span>LEARN MORE</span>
                <ArrowRight size={14} />
              </Link>

              <div className="mission-stats-grid">
                <div className="m-stat">
                  <div className="m-stat-val">1.2M</div>
                  <div className="m-stat-lbl">People Reached in 2024</div>
                </div>
                <div className="m-stat">
                  <div className="m-stat-val">38</div>
                  <div className="m-stat-lbl">Upazilas Active Coverage</div>
                </div>
                <div className="m-stat">
                  <div className="m-stat-val">98%</div>
                  <div className="m-stat-lbl">Verified Relief Delivery</div>
                </div>
              </div>
            </div>

            <div className="mission-image-card">
              <img
                src="https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=1000&q=80"
                alt="Flood response team in Bangladesh"
                className="mission-img"
              />
              <div className="image-overlay-badge">
                <span className="badge-num">6,200+</span>
                <span className="badge-lbl">Volunteers Deployed in 2024</span>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
           4 Quick Access Services Cards
           ═══════════════════════════════════════════ */}
        <section className="quick-services-section">
          <div className="container grid-4">
            <Card hoverable className="service-card" onClick={() => navigate('/shelters')}>
              <div className="service-icon icon-blue">
                <Shield size={24} />
              </div>
              <h3>Find Shelter</h3>
              <p>Real-time capacity on safe havens near you.</p>
              <span className="service-link">View Map &rarr;</span>
            </Card>

            <Card hoverable className="service-card" onClick={() => navigate('/alerts')}>
              <div className="service-icon icon-orange">
                <AlertTriangle size={24} />
              </div>
              <h3>Report Hazard</h3>
              <p>Anonymously report road floods or dangers.</p>
              <span className="service-link">Submit Report &rarr;</span>
            </Card>

            <Card hoverable className="service-card" onClick={() => navigate('/get-help')}>
              <div className="service-icon icon-teal">
                <Heart size={24} />
              </div>
              <h3>Request Help</h3>
              <p>Submit rescue or relief for families/individuals.</p>
              <span className="service-link">Request Now &rarr;</span>
            </Card>

            <Card hoverable className="service-card" onClick={() => navigate('/contacts')}>
              <div className="service-icon icon-purple">
                <PhoneCall size={24} />
              </div>
              <h3>Emergency Lines</h3>
              <p>Direct lines to rescue &amp; medical services.</p>
              <span className="service-link">View Contacts &rarr;</span>
            </Card>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
           Live Flood Stats Ticker Banner
           ═══════════════════════════════════════════ */}
        <section className="live-stats-bar">
          <div className="container flex justify-between items-center flex-wrap gap-4">
            <div className="live-stat-item">
              <span className="live-num">4.8M</span>
              <span className="live-lbl">People Affected</span>
            </div>
            <div className="live-stat-item">
              <span className="live-num">847K</span>
              <span className="live-lbl">Homes Damaged</span>
            </div>
            <div className="live-stat-item">
              <span className="live-num">2,300+</span>
              <span className="live-lbl">Shelters Operational</span>
            </div>
            <div className="live-stat-item">
              <span className="live-num">340</span>
              <span className="live-lbl">Rescue Teams Active</span>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
           News and Stories Section
           ═══════════════════════════════════════════ */}
        <section className="news-section">
          <div className="container">
            <div className="section-header flex justify-between items-center">
              <div>
                <span className="section-tag">OUR WORK ACROSS BANGLADESH</span>
                <h2>News and Stories</h2>
              </div>
              <Link to="/news" className="link-arrow">READ MORE &rarr;</Link>
            </div>

            <div className="grid-2 news-grid">
              <Card className="news-featured-card">
                <div className="news-badge-tag">FIELD REPORT</div>
                <img
                  src="https://images.unsplash.com/photo-1578357078586-491adf1aa5ab?auto=format&fit=crop&w=800&q=80"
                  alt="Evacuation during flood"
                  className="news-img"
                />
                <div className="news-body">
                  <span className="news-cat">RESCUE</span>
                  <h3>Over 12,800 families evacuated as floodwaters breach Sunamganj embankments</h3>
                  <p>Coordinated boat rescue teams deployed across 14 upazilas to move stranded families to government shelters.</p>
                </div>
              </Card>

              <div className="news-sidebar-list">
                <Card className="news-item-mini flex gap-4 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?auto=format&fit=crop&w=300&q=80"
                    alt="Medical team"
                    className="news-thumb"
                  />
                  <div>
                    <span className="news-cat">HEALTH</span>
                    <h4>Mobile medical units dispatched to flooded haor communities in Sirajganj</h4>
                    <Link to="/news/2" className="read-link">READ &rarr;</Link>
                  </div>
                </Card>

                <Card className="news-item-mini flex gap-4 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&w=300&q=80"
                    alt="Relief distribution"
                    className="news-thumb"
                  />
                  <div>
                    <span className="news-cat">DONATION</span>
                    <h4>Women-led distribution networks ensure equitable relief in Netrokona</h4>
                    <Link to="/news/3" className="read-link">READ &rarr;</Link>
                  </div>
                </Card>

                <Card className="news-item-mini flex gap-4 items-center">
                  <img
                    src="https://images.unsplash.com/photo-1509099836639-18ba1795216d?auto=format&fit=crop&w=300&q=80"
                    alt="Clean water station"
                    className="news-thumb"
                  />
                  <div>
                    <span className="news-cat">WATER &amp; SANITATION</span>
                    <h4>Local water purifiers installed post-flood recovery in Kurigram haor areas</h4>
                    <Link to="/news/4" className="read-link">READ &rarr;</Link>
                  </div>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
           Latest Situation Updates + Track Request Widget + Emergency Hotlines Sidebar
           ═══════════════════════════════════════════ */}
        <section className="updates-and-sidebar-section">
          <div className="container grid-layout-sidebar">
            {/* Main Content: Latest Situation Updates */}
            <div className="updates-column">
              <div className="flex justify-between items-center margin-b-4">
                <h2>Latest Situation Updates</h2>
                <Link to="/alerts" className="link-arrow">ALL ALERTS &rarr;</Link>
              </div>

              <div className="alerts-stack flex flex-col gap-4">
                {MOCK_ALERTS.slice(0, 3).map((alert) => (
                  <Card key={alert.id} className="home-alert-card">
                    <div className="alert-card-header flex justify-between items-center">
                      <Badge variant={alert.severity}>{alert.severity}</Badge>
                      <span className="alert-type">{alert.type}</span>
                    </div>
                    <h3 className="alert-card-title">{alert.title}</h3>
                    <p className="alert-card-desc">{alert.description}</p>
                    <div className="flex justify-between items-center alert-card-footer">
                      <div className="tags-row flex gap-2">
                        {alert.affectedAreas.slice(0, 3).map((area) => (
                          <span key={area} className="tag-chip">{area}</span>
                        ))}
                      </div>
                      <span className="alert-time">{alert.issuedAt}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar Column: Track Your Request + Emergency Hotlines */}
            <div className="sidebar-column flex flex-col gap-6">
              {/* Widget 1: Track Your Request */}
              <Card className="widget-card widget-track">
                <div className="widget-header flex items-center gap-2">
                  <Search size={20} className="widget-icon" />
                  <h3>Track Your Request</h3>
                </div>
                <p className="widget-desc">Enter your tracking ID to view rescue or relief status in real-time.</p>

                <form onSubmit={handleTrackSubmit} className="track-form flex gap-2">
                  <input
                    type="text"
                    placeholder="SHY-2024-XXXXX"
                    value={trackingId}
                    onChange={(e) => setTrackingId(e.target.value)}
                    className="track-input"
                  />
                  <Button type="submit" variant="primary">Go</Button>
                </form>

                {trackingError && <div className="track-error">{trackingError}</div>}
                {trackingResult && (
                  <div className="track-result-box animate-fade-in">
                    <div className="flex justify-between items-center">
                      <span className="track-id-code">{trackingResult.trackingId}</span>
                      <Badge variant="LOW">{trackingResult.status}</Badge>
                    </div>
                    <p className="text-xs text-secondary mt-1">Submitted for: {trackingResult.location.district}</p>
                  </div>
                )}
              </Card>

              {/* Widget 2: Emergency Hotlines */}
              <Card className="widget-card widget-hotlines">
                <div className="widget-header flex items-center gap-2">
                  <PhoneCall size={20} className="widget-icon" />
                  <h3>Emergency Hotlines</h3>
                </div>
                <div className="hotlines-list flex flex-col gap-3 mt-3">
                  <div className="hotline-item">
                    <div className="hotline-name">National Emergency</div>
                    <div className="hotline-num">999 (DEMO)</div>
                  </div>
                  <div className="hotline-item">
                    <div className="hotline-name">Fire Service &amp; Civil Defence</div>
                    <div className="hotline-num">102 (DEMO)</div>
                  </div>
                  <div className="hotline-item">
                    <div className="hotline-name">Ambulance Service</div>
                    <div className="hotline-num">199 (DEMO)</div>
                  </div>
                </div>
                <Link to="/contacts" className="all-contacts-link mt-3 block text-center">
                  All Contacts &rarr;
                </Link>
              </Card>
            </div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
           Bottom Action Cards (Volunteer / Transparency / Impact)
           ═══════════════════════════════════════════ */}
        <section className="bottom-cards-section">
          <div className="container grid-3">
            <Card className="bottom-action-card text-center">
              <div className="bottom-card-icon">
                <Users size={28} />
              </div>
              <h3>Volunteer</h3>
              <p>Join field teams and help distribute relief to families in need across all affected districts.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/volunteer/register')}>
                Join Now
              </Button>
            </Card>

            <Card className="bottom-action-card text-center">
              <div className="bottom-card-icon">
                <FileText size={28} />
              </div>
              <h3>Transparency</h3>
              <p>Track how donated funds and materials are utilized with real-time audit logs and field reports.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/campaigns')}>
                View Reports
              </Button>
            </Card>

            <Card className="bottom-action-card text-center">
              <div className="bottom-card-icon">
                <Activity size={28} />
              </div>
              <h3>Our Impact</h3>
              <p>5,000+ rescues coordinated and 50,000+ meals distributed in the past 14 days.</p>
              <Button variant="outline" size="sm" onClick={() => navigate('/about')}>
                Impact Report
              </Button>
            </Card>
          </div>
        </section>
      </div>
    </PageLayout>
  );
};

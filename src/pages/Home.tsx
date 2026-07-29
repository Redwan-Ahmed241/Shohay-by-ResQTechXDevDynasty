import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Shield,
  MapPin,
  Navigation,
  ChevronDown,
  Lock,
  Users,
  Package,
  Zap,
  Anchor,
  Droplets,
  ArrowRight,
  ArrowUpRight,
  ChevronRight,
  Heart,
  PhoneCall,
  Search,
  Clock,
  FileText,
  Activity,
  Home as HomeIcon,
  HelpCircle,
  Hand,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { requestService } from '../services/requestService';
import { MOCK_ALERTS } from '../data/alerts';
import './Home.css';

// Local image assets from public/
const HERO_BG = '/photo-1741081038901-f258dd2f5a1c.jpg';
const MISSION_IMG = '/photo-1528726164383-33c4a223b78c.jpg';
const NEWS_FEATURED_IMG = '/photo-1728320771441-17a19df0fe4c.jpg';
const NEWS_THUMB_1 = '/photo-1727475807090-f1c30f6c294f.jpg';
const NEWS_THUMB_2 = '/photo-1617494532674-67d22df2addb.jpg';
const NEWS_THUMB_3 = '/photo-1617494532490-297fc0eb515e.jpg';
const HELP_IMAGE_1 = '/photo-1679027325489-deb056503de4.jpg';
const HELP_IMAGE_2 = '/photo-1649134799042-ccca78a3f9bf.jpg';

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
    <PageLayout showAlertBanner={false}>
      <div className="home-page">
        {/* ═══════════════════════════════════════
           1. ALERT BANNER (Red)
           ═══════════════════════════════════════ */}

      <div className="alert-banner-home">
        <div className="alert-banner-icon">
          <AlertTriangle />
        </div>
        <div className="alert-banner-content">
          <div className="alert-banner-label">
            Critical Alert — Immediate Action Required
          </div>
          <div className="alert-banner-title">
            Extreme Flash Flood Warning — Sunamganj Sadar
          </div>
          <div className="alert-banner-areas">
            Sunamganj Sadar, Bishwambarpur, Tahirpur, Derai
          </div>
        </div>
        <div className="alert-banner-actions">
          <button className="alert-btn-outline" onClick={() => navigate('/alerts')}>
            View Alert
          </button>
          <button className="alert-btn-solid" onClick={() => navigate('/get-help')}>
            Get Help Now
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════
         2. LOCATION ROW
         ═══════════════════════════════════════ */}
      <div className="location-row">
        <div className="location-row-inner">
          <div className="location-label">
            <MapPin />
            <span>Set Location:</span>
          </div>
          <button className="location-gps-btn">
            <Navigation />
            <span>GPS</span>
          </button>
          <select className="location-dropdown">
            <option>Select Upazila...</option>
            <option>Sunamganj Sadar</option>
            <option>Bishwambarpur</option>
            <option>Tahirpur</option>
          </select>
          <span className="location-separator">|</span>
          <button className="location-skip">Skip</button>
          <div className="location-device-only">
            <Lock />
            <span>Device only</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
         3. QUICK STATS BAR
         ═══════════════════════════════════════ */}
      <div className="quick-stats-bar">
        <div className="quick-stats-inner">
          <div className="stat-chips">
            <div className="stat-chip">
              <Users size={14} />
              <span className="stat-chip-value">1.2M+</span>
              <span className="stat-chip-label">Reached</span>
            </div>
            <div className="stat-chip">
              <HomeIcon size={14} />
              <span className="stat-chip-value">847</span>
              <span className="stat-chip-label">Shelters</span>
            </div>
            <div className="stat-chip">
              <Package size={14} />
              <span className="stat-chip-value">50K+</span>
              <span className="stat-chip-label">Packages</span>
            </div>
            <div className="stat-chip">
              <Anchor size={14} />
              <span className="stat-chip-value">340</span>
              <span className="stat-chip-label">Rescues</span>
            </div>
          </div>

          <div className="stats-divider" />

          <div className="water-risk-section">
            <div className="water-risk-label">
              <Droplets />
              <span>Water Risk</span>
            </div>
            <div className="water-risk-item">
              <span className="water-risk-name">Sunamganj</span>
              <div className="water-risk-bar">
                <div className="water-risk-fill risk-fill-extreme" style={{ width: '92%' }} />
              </div>
              <span className="water-risk-pct">92%</span>
            </div>
            <div className="water-risk-item">
              <span className="water-risk-name">Sylhet</span>
              <div className="water-risk-bar">
                <div className="water-risk-fill risk-fill-high" style={{ width: '78%' }} />
              </div>
              <span className="water-risk-pct">78%</span>
            </div>
            <div className="water-risk-item">
              <span className="water-risk-name">Netrokona</span>
              <div className="water-risk-bar">
                <div className="water-risk-fill risk-fill-medium" style={{ width: '61%' }} />
              </div>
              <span className="water-risk-pct">61%</span>
            </div>
            <div className="water-risk-item">
              <span className="water-risk-name">Sirajganj</span>
              <div className="water-risk-bar">
                <div className="water-risk-fill risk-fill-low" style={{ width: '44%' }} />
              </div>
              <span className="water-risk-pct">44%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════
         4. LIVE TICKER
         ═══════════════════════════════════════ */}
      <div className="live-ticker">
        <span className="live-ticker-text">
          🔴 LIVE — Sunamganj: Water level 3.2m above danger level · Brahmaputra rising at 5cm/hr · 14 upazilas on red alert · Evacuations ongoing in Bishwambarpur · BNCC deploying additional rescue boats &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
          🔴 LIVE — Sunamganj: Water level 3.2m above danger level · Brahmaputra rising at 5cm/hr · 14 upazilas on red alert · Evacuations ongoing in Bishwambarpur · BNCC deploying additional rescue boats
        </span>
      </div>

      {/* ═══════════════════════════════════════
         5. HERO SECTION
         ═══════════════════════════════════════ */}
      <section className="hero-section">
        <img src={HERO_BG} alt="Flood-affected communities in Bangladesh" className="hero-bg-image" />
        <div className="hero-gradient-bottom" />
        <div className="hero-gradient-left" />

        <div className="hero-content">
          <div className="hero-badge-tag">Emergency Response · Bangladesh</div>
          <h1 className="hero-title">Standing With Bangladesh in Times of Crisis.</h1>
          <p className="hero-description">
            Coordinating immediate rescue, shelter access, and transparent relief tracking for flood-affected communities across Bangladesh.
          </p>
          <div className="hero-buttons">
            <Link to="/get-help" className="hero-btn-primary">
              <Hand size={16} />
              Request Assistance
            </Link>
            <Link to="/campaigns" className="hero-btn-secondary">
              <Heart size={16} />
              Donate
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span>Scroll</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ═══════════════════════════════════════
         6. MISSION SECTION (50/50 split)
         ═══════════════════════════════════════ */}
      <section className="mission-section">
        <div className="mission-left">
          <div className="mission-tag">Our Mission</div>
          <h2 className="mission-heading">
            We coordinate with communities impacted by floods to save lives, restore dignity, and rebuild resilience across Bangladesh.
          </h2>
          <Link to="/about" className="mission-learn-more">
            Learn More
            <ArrowRight size={16} />
          </Link>
          <div className="mission-stats">
            <div>
              <div className="mission-stat-value">1.2M</div>
              <div className="mission-stat-label">people served in 2024</div>
            </div>
            <div>
              <div className="mission-stat-value">38</div>
              <div className="mission-stat-label">partner orgs nationwide</div>
            </div>
            <div>
              <div className="mission-stat-value">98%</div>
              <div className="mission-stat-label">led by local staff</div>
            </div>
          </div>
        </div>

        <div className="mission-right">
          <img src={MISSION_IMG} alt="Mother and child receiving humanitarian assistance" className="mission-image" />
          <div className="mission-image-gradient" />
          <div className="mission-image-badge">
            <div className="badge-label">Rescue Ops</div>
            <div className="badge-value">5,200+</div>
            <div className="badge-sub">coordinated rescues · 2024</div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         7. QUICK SERVICES (4 colored blocks)
         ═══════════════════════════════════════ */}
      <section className="quick-services-section">
        <div className="quick-services-grid">
          <Link to="/shelters" className="service-block service-block-blue">
            <div className="service-block-icon">
              <Shield />
            </div>
            <div>
              <h3>Find Shelter</h3>
              <p>Real-time capacity at safe havens near you</p>
            </div>
            <ArrowUpRight className="service-block-arrow" />
          </Link>

          <Link to="/alerts" className="service-block service-block-orange">
            <div className="service-block-icon">
              <AlertTriangle />
            </div>
            <div>
              <h3>Report Hazard</h3>
              <p>Anonymously flag flooded roads or dangers</p>
            </div>
            <ArrowUpRight className="service-block-arrow" />
          </Link>

          <Link to="/get-help" className="service-block service-block-green">
            <div className="service-block-icon">
              <HelpCircle />
            </div>
            <div>
              <h3>Request Help</h3>
              <p>Submit rescue or relief assistance requests</p>
            </div>
            <ArrowUpRight className="service-block-arrow" />
          </Link>

          <Link to="/contacts" className="service-block service-block-red">
            <div className="service-block-icon">
              <PhoneCall />
            </div>
            <div>
              <h3>Emergency Lines</h3>
              <p>Direct lines to rescue and medical services</p>
            </div>
            <ArrowUpRight className="service-block-arrow" />
          </Link>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         8. LIVE SITUATION STATS
         ═══════════════════════════════════════ */}
      <section className="live-situation-section">
        <div className="live-situation-inner">
          <div className="live-situation-header">
            <div className="live-situation-line" />
            <span className="live-situation-title">Live Situation · Bangladesh Floods 2024</span>
            <div className="live-situation-line" />
          </div>

          <div className="live-stats-grid">
            <div className="live-stat-card">
              <Users size={16} />
              <div className="live-stat-value">4.8M</div>
              <div className="live-stat-label">People Affected</div>
              <div className="live-stat-sublabel">across 18 districts</div>
            </div>
            <div className="live-stat-card">
              <HomeIcon size={16} />
              <div className="live-stat-value">847K</div>
              <div className="live-stat-label">Homes Damaged</div>
              <div className="live-stat-sublabel">full or partial damage</div>
            </div>
            <div className="live-stat-card">
              <Droplets size={16} />
              <div className="live-stat-value">2,300+</div>
              <div className="live-stat-label">km² Submerged</div>
              <div className="live-stat-sublabel">croplands inundated</div>
            </div>
            <div className="live-stat-card">
              <Anchor size={16} />
              <div className="live-stat-value">340</div>
              <div className="live-stat-label">Rescue Boats Active</div>
              <div className="live-stat-sublabel">BNCC + Army deployed</div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         9. NEWS & STORIES
         ═══════════════════════════════════════ */}
      <section className="news-section">
        <div className="news-inner">
          <div className="news-header">
            <div className="news-header-left">
              <span className="news-section-tag">Our Work Across Bangladesh</span>
              <h2 className="news-section-title">News and Stories</h2>
            </div>
            <Link to="/news" className="news-read-more">
              Read More
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="news-grid">
            {/* Featured article */}
            <div className="news-featured">
              <div className="news-featured-image-wrapper">
                <img src={NEWS_FEATURED_IMG} alt="Evacuation during flood" className="news-featured-img" />
                <div className="news-featured-overlay" />
                <div className="news-featured-tag">FIELD REPORT</div>
                <div className="news-featured-bottom-text">
                  <div className="news-featured-category">RESCUE</div>
                  <div className="news-featured-title">
                    Over 12,000 families evacuated as floodwaters breach Sunamganj embankments
                  </div>
                </div>
              </div>
              <div className="news-featured-body">
                <p className="news-featured-excerpt">
                  Coordinated rescue boats deployed across 14 upazilas to move stranded families to safety.
                </p>
                <Link to="/news/1" className="news-featured-link">
                  Read More
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="news-sidebar">
              <div className="news-sidebar-item">
                <img src={NEWS_THUMB_1} alt="Medical team" className="news-sidebar-thumb" />
                <div className="news-sidebar-content">
                  <span className="news-sidebar-cat">HEALTH</span>
                  <div className="news-sidebar-title">
                    Mobile medical units reach flood-isolated char communities in Sirajganj
                  </div>
                  <Link to="/news/2" className="news-sidebar-link">
                    Read
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <div className="news-sidebar-item">
                <img src={NEWS_THUMB_2} alt="Relief distribution" className="news-sidebar-thumb" />
                <div className="news-sidebar-content">
                  <span className="news-sidebar-cat">COMMUNITY</span>
                  <div className="news-sidebar-title">
                    Women-led distribution networks ensure equitable relief in Netrokona
                  </div>
                  <Link to="/news/3" className="news-sidebar-link">
                    Read
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <div className="news-sidebar-item">
                <img src={NEWS_THUMB_3} alt="Recovery effort" className="news-sidebar-thumb" />
                <div className="news-sidebar-content">
                  <span className="news-sidebar-cat">RESILIENCE</span>
                  <div className="news-sidebar-title">
                    Local leaders coordinate post-flood recovery in Kurigram char areas
                  </div>
                  <Link to="/news/4" className="news-sidebar-link">
                    Read
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         10. HOW YOU CAN HELP
         ═══════════════════════════════════════ */}
      <section className="how-help-section">
        <div className="how-help-inner">
          <div className="how-help-copy">
            <div className="how-help-tag">There are many ways to help flood-affected families</div>
            <h2 className="how-help-title">How You Can Help</h2>
            <p className="how-help-description">
              Support rescue logistics, deliver relief supplies, and help families reach safe shelter through the most urgent response channels.
            </p>
            <div className="how-help-actions">
              <Link to="/get-help" className="how-help-primary">Request Help</Link>
              <Link to="/volunteer" className="how-help-secondary">Volunteer</Link>
            </div>
          </div>

          <div className="help-gallery">
            <div className="help-photo-card help-photo-card-large">
              <img src={HELP_IMAGE_1} alt="Relief transport by boat" className="help-photo-img" />
              <div className="help-photo-overlay" />
              <div className="help-photo-caption">
                <span className="help-photo-kicker">Relief Transport</span>
                <span className="help-photo-title">Supplies moving into flooded communities</span>
              </div>
            </div>

            <div className="help-photo-card help-photo-card-small">
              <img src={HELP_IMAGE_2} alt="Flood response by local residents" className="help-photo-img" />
              <div className="help-photo-overlay" />
              <div className="help-photo-caption">
                <span className="help-photo-kicker">Community Support</span>
                <span className="help-photo-title">Local responders guiding families to safety</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         11. UPDATES + SIDEBAR
         ═══════════════════════════════════════ */}
      <section className="updates-section">
        <div className="updates-inner">
          {/* Left: Latest Situation Updates */}
          <div className="updates-main">
            <div className="updates-header">
              <h2 className="updates-title">Latest Situation Updates</h2>
              <Link to="/alerts" className="updates-all-link">
                All Alerts
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="alert-list">
              {MOCK_ALERTS.slice(0, 3).map((alert) => {
                const severityClass = `alert-severity-${alert.severity.toLowerCase().replace(' ', '')}`;
                return (
                  <Link
                    key={alert.id}
                    to={`/alerts`}
                    className="alert-card"
                  >
                    <div className={`alert-card-severity ${severityClass}`}>
                      <span className="alert-severity-text">{alert.severity}</span>
                      <AlertTriangle size={16} color="#fff" />
                    </div>
                    <div className="alert-card-body">
                      <div className="alert-card-header-row">
                        <h3 className="alert-card-title">{alert.title}</h3>
                        <span className="alert-verified-badge">Government Verified</span>
                      </div>
                      <p className="alert-card-desc">{alert.description}</p>
                      <div className="alert-card-tags">
                        {alert.affectedAreas.slice(0, 3).map((area) => (
                          <span key={area} className="alert-tag">{area}</span>
                        ))}
                      </div>
                      <div className="alert-card-time">
                        <Clock size={12} />
                        <span>{alert.issuedAt}</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right: Sidebar Widgets */}
          <div className="sidebar-column">
            {/* Track Your Request */}
            <div className="widget-card">
              <div className="widget-header">
                <Search size={20} />
                <h3>Track Your Request</h3>
              </div>
              <p className="widget-desc">
                Enter your tracking ID to view rescue or relief status in real-time.
              </p>
              <form onSubmit={handleTrackSubmit} className="track-form">
                <input
                  type="text"
                  placeholder="SHY-2024-XXXXX"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="track-input"
                />
                <button type="submit" className="track-btn">Go</button>
              </form>
              {trackingError && <div className="track-error">{trackingError}</div>}
              {trackingResult && (
                <div className="track-result-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="track-id-code">{trackingResult.trackingId}</span>
                    <span className="track-status-badge">{trackingResult.status}</span>
                  </div>
                  <p className="track-result-location">
                    Submitted for: {trackingResult.location.district}
                  </p>
                </div>
              )}
            </div>

            {/* Emergency Hotlines */}
            <div className="widget-card">
              <div className="widget-header">
                <PhoneCall size={20} />
                <h3>Emergency Hotlines</h3>
              </div>
              <div className="hotline-list">
                <div className="hotline-item">
                  <span className="hotline-name">National Emergency</span>
                  <span className="hotline-number">999</span>
                </div>
                <div className="hotline-item">
                  <span className="hotline-name">Fire Service & Civil Defence</span>
                  <span className="hotline-number">102</span>
                </div>
                <div className="hotline-item">
                  <span className="hotline-name">Ambulance Service</span>
                  <span className="hotline-number">199</span>
                </div>
              </div>
              <Link to="/contacts" className="all-contacts-link">
                All Contacts →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════
         12. BOTTOM 3 CARDS
         ═══════════════════════════════════════ */}
      <section className="bottom-cards-section">
        <div className="bottom-cards-grid">
          <div className="bottom-card">
            <div className="bottom-card-icon">
              <Users />
            </div>
            <h3>Volunteer</h3>
            <p>Join field teams and help distribute relief to families in need across affected districts.</p>
            <Link to="/volunteer/register" className="bottom-card-btn">Join Now</Link>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-icon">
              <FileText />
            </div>
            <h3>Transparency</h3>
            <p>Track how donated funds and materials are utilized with real-time audit logs and field reports.</p>
            <Link to="/campaigns" className="bottom-card-btn">View Reports</Link>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-icon">
              <Activity />
            </div>
            <h3>Our Impact</h3>
            <p>5,000+ rescues coordinated and 50,000+ meals distributed in the past 14 days.</p>
            <Link to="/about" className="bottom-card-btn">Impact Report</Link>
          </div>
        </div>
      </section>
    </div>
    </PageLayout>
  );
};


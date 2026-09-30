import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Shield,
  MapPin,
  Navigation,
  ChevronDown,
  Users,
  Package,
  Anchor,
  Droplets,
  ArrowRight,
  ArrowUpRight,
  Heart,
  PhoneCall,
  Search,
  Clock,
  FileText,
  Activity,
  Home as HomeIcon,
  HelpCircle,
  Hand,
  Play,
  Pause,
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useAuth } from '../context/AuthContext';
import { requestService } from '../services/requestService';
import { MOCK_ALERTS } from '../data/alerts';
import { BD_UPAZILAS } from '../data/upazilas';
import { TRACK_STATUS_TEXT } from '../utils/requestStatus';
import { RequestTracking } from '../types';
import { useLanguage } from '../context/LanguageContext';
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
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const currentLang = language;
  const [tickerPaused, setTickerPaused] = useState(false);
  const [trackingId, setTrackingId] = useState('');
  const [trackingResult, setTrackingResult] = useState<RequestTracking | null>(null);
  const [trackingError, setTrackingError] = useState('');

  const [locationDismissed, setLocationDismissed] = useState(false);
  const [selectedUpazila, setSelectedUpazila] = useState('');
  const [gpsStatus, setGpsStatus] = useState<string | null>(null);
  const [gpsBusy, setGpsBusy] = useState(false);

  const shareGps = () => {
    if (!navigator.geolocation) {
      setGpsStatus('This device cannot share its location.');
      return;
    }
    setGpsBusy(true);
    setGpsStatus(null);
    navigator.geolocation.getCurrentPosition(
      () => {
        setSelectedUpazila('');
        setGpsStatus('Current location detected');
        setGpsBusy(false);
      },
      () => {
        setGpsStatus('Could not get your location. Try selecting an upazila instead.');
        setGpsBusy(false);
      },
      { enableHighAccuracy: true, timeout: 15000 }
    );
  };

  const locationDisplay = gpsStatus || (selectedUpazila ? `Location: ${selectedUpazila}` : 'Set Location:');

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTrackingError('');
    setTrackingResult(null);

    if (!trackingId.trim()) {
      setTrackingError(t('homeTrackErrorEmpty'));
      return;
    }

    try {
      const res = await requestService.trackRequest(trackingId);
      if (res) {
        setTrackingResult(res);
      } else {
        setTrackingError(t('homeTrackErrorNotFound'));
      }
    } catch {
      setTrackingError('Could not reach the Shohay server. Please try again in a moment.');
    }
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="home-page">
        {/* ═══════════════════════════════════════
        {/* ═══════════════════════════════════════
           1. ALERT BANNER (Red)
           ═══════════════════════════════════════ */}
        <div className="alert-banner-home" role="alert" aria-live="assertive">
          <div className="alert-banner-icon" aria-hidden="true">
            <AlertTriangle size={20} />
          </div>
          <div className="alert-banner-content">
            <span className="alert-banner-label">
              {t('homeAlertLabel')}
            </span>
            <h2 className="alert-banner-title">
              {t('homeAlertTitle')}
            </h2>
            <p className="alert-banner-areas">
              {t('homeAlertAreas')}
            </p>
          </div>
          <div className="alert-banner-actions">
            <button className="alert-btn-outline" onClick={() => navigate('/alerts')}>
              {t('homeViewAlert')}
            </button>
            <button className="alert-btn-solid" onClick={() => navigate('/get-help')}>
              {t('homeGetHelpNow')}
            </button>
          </div>
        </div>

        {/* ═══════════════════════════════════════
           2. LOCATION ROW
           ═══════════════════════════════════════ */}
        {!locationDismissed && (
          <div className="location-row" role="region" aria-label="Location selector">
            <div className="location-row-inner">
              <div className="location-label">
                <MapPin size={14} aria-hidden="true" />
                <span aria-live="polite" aria-atomic="true">{locationDisplay}</span>
              </div>
              <button
                className="location-gps-btn"
                onClick={shareGps}
                disabled={gpsBusy}
                type="button"
              >
                <Navigation size={13} aria-hidden="true" />
                <span>{gpsBusy ? 'Locating…' : t('homeGps')}</span>
              </button>
              <select
                className="location-dropdown"
                value={selectedUpazila}
                onChange={(e) => {
                  setSelectedUpazila(e.target.value);
                  setGpsStatus(null);
                }}
                aria-label={t('homeSelectUpazila')}
              >
                <option value="">{t('homeSelectUpazila')}</option>
                {BD_UPAZILAS.map((d) => (
                  <optgroup key={d.district} label={d.district}>
                    {d.upazilas.map((u) => (
                      <option key={`${d.district}-${u}`} value={u}>{u}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <span className="location-separator" aria-hidden="true">|</span>
              <button
                className="location-skip"
                onClick={() => setLocationDismissed(true)}
                type="button"
              >
                {t('homeSkip')}
              </button>
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════
           3. QUICK STATS BAR
           ═══════════════════════════════════════ */}
        <div className="quick-stats-bar" role="region" aria-label="Key statistics and water risk">
          <div className="quick-stats-inner">
            <div className="stat-chips">
              <div className="stat-chip">
                <Users size={15} aria-hidden="true" />
                <span className="stat-chip-value">1.2M+</span>
                <span className="stat-chip-label">{t('homeStatReached')}</span>
              </div>
              <div className="stat-chip">
                <HomeIcon size={15} aria-hidden="true" />
                <span className="stat-chip-value">847</span>
                <span className="stat-chip-label">{t('homeStatShelters')}</span>
              </div>
              <div className="stat-chip">
                <Package size={15} aria-hidden="true" />
                <span className="stat-chip-value">50K+</span>
                <span className="stat-chip-label">{t('homeStatPackages')}</span>
              </div>
              <div className="stat-chip">
                <Anchor size={15} aria-hidden="true" />
                <span className="stat-chip-value">340</span>
                <span className="stat-chip-label">{t('homeStatRescues')}</span>
              </div>
            </div>

            <div className="stats-divider" aria-hidden="true" />

            <div className="water-risk-section">
              <div className="water-risk-label">
                <Droplets size={13} aria-hidden="true" />
                <span>{t('homeWaterRisk')}</span>
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
        <div className="live-ticker" role="region" aria-label="Live updates">
          <button
            type="button"
            className="ticker-toggle-btn"
            onClick={() => setTickerPaused((prev) => !prev)}
            aria-label={tickerPaused ? (currentLang === 'bn' ? 'টিকার চালু করুন' : 'Resume ticker') : (currentLang === 'bn' ? 'টিকার থামান' : 'Pause ticker')}
            aria-pressed={tickerPaused}
          >
            {tickerPaused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <div className="live-ticker-track">
            <span className={`live-ticker-text ${tickerPaused ? 'ticker-paused' : ''}`}>
              {t('homeLiveTicker')} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
              {t('homeLiveTicker')}
            </span>
          </div>
        </div>

      {/* ═══════════════════════════════════════
         5. HERO SECTION
         ═══════════════════════════════════════ */}
      <section className="hero-section">
        <img src={HERO_BG} alt="Flood-affected communities in Bangladesh" className="hero-bg-image" />
        <div className="hero-gradient-bottom" />
        <div className="hero-gradient-left" />

        <div className="hero-content">
          <div className="hero-badge-tag">{t('homeHeroBadge')}</div>
          <h1 className="hero-title">{t('homeHeroTitle')}</h1>
          <p className="hero-description">
            {t('homeHeroDesc')}
          </p>
          <div className="hero-buttons">
            <Link to="/get-help" className="hero-btn-primary">
              <Hand size={16} />
              {t('homeHeroRequestAssistance')}
            </Link>
            <Link to="/campaigns" className="hero-btn-secondary">
              <Heart size={16} />
              {t('homeHeroDonate')}
            </Link>
          </div>
        </div>

        <div className="hero-scroll-indicator">
          <span>{t('homeHeroScroll')}</span>
          <ChevronDown size={16} />
        </div>
      </section>

      {/* ═══════════════════════════════════════
         6. MISSION SECTION (50/50 split)
         ═══════════════════════════════════════ */}
      <section className="mission-section">
        <div className="mission-left">
          <div className="mission-tag">{t('homeMissionTag')}</div>
          <h2 className="mission-heading">
            {t('homeMissionHeading')}
          </h2>
          <Link to="/about" className="mission-learn-more">
            {t('homeLearnMore')}
            <ArrowRight size={16} />
          </Link>
          <div className="mission-stats">
            <div>
              <div className="mission-stat-value">1.2M</div>
              <div className="mission-stat-label">{t('homeMissionStat1Label')}</div>
            </div>
            <div>
              <div className="mission-stat-value">38</div>
              <div className="mission-stat-label">{t('homeMissionStat2Label')}</div>
            </div>
            <div>
              <div className="mission-stat-value">98%</div>
              <div className="mission-stat-label">{t('homeMissionStat3Label')}</div>
            </div>
          </div>
        </div>

        <div className="mission-right">
          <img src={MISSION_IMG} alt="Mother and child receiving humanitarian assistance" className="mission-image" />
          <div className="mission-image-gradient" />
          <div className="mission-image-badge">
            <div className="badge-label">{t('homeRescueOpsBadge')}</div>
            <div className="badge-value">5,200+</div>
            <div className="badge-sub">{t('homeRescueOpsSub')}</div>
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
              <h3>{t('homeFindShelterTitle')}</h3>
              <p>{t('homeFindShelterDesc')}</p>
            </div>
            <ArrowUpRight className="service-block-arrow" />
          </Link>

          <Link to="/alerts" className="service-block service-block-orange">
            <div className="service-block-icon">
              <AlertTriangle />
            </div>
            <div>
              <h3>{t('homeReportHazardTitle')}</h3>
              <p>{t('homeReportHazardDesc')}</p>
            </div>
            <ArrowUpRight className="service-block-arrow" />
          </Link>

          <Link to="/get-help" className="service-block service-block-green">
            <div className="service-block-icon">
              <HelpCircle />
            </div>
            <div>
              <h3>{t('homeRequestHelpTitle')}</h3>
              <p>{t('homeRequestHelpDesc')}</p>
            </div>
            <ArrowUpRight className="service-block-arrow" />
          </Link>

          <Link to="/contacts" className="service-block service-block-red">
            <div className="service-block-icon">
              <PhoneCall />
            </div>
            <div>
              <h3>{t('homeEmergencyLinesTitle')}</h3>
              <p>{t('homeEmergencyLinesDesc')}</p>
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
            <span className="live-situation-title">{t('homeLiveSituationTitle')}</span>
            <div className="live-situation-line" />
          </div>

          <div className="live-stats-grid">
            <div className="live-stat-card">
              <Users size={16} />
              <div className="live-stat-value">4.8M</div>
              <div className="live-stat-label">{t('homePeopleAffected')}</div>
              <div className="live-stat-sublabel">{t('homeAcrossDistricts')}</div>
            </div>
            <div className="live-stat-card">
              <HomeIcon size={16} />
              <div className="live-stat-value">847K</div>
              <div className="live-stat-label">{t('homeHomesDamaged')}</div>
              <div className="live-stat-sublabel">{t('homeFullPartialDamage')}</div>
            </div>
            <div className="live-stat-card">
              <Droplets size={16} />
              <div className="live-stat-value">2,300+</div>
              <div className="live-stat-label">{t('homeKmSubmerged')}</div>
              <div className="live-stat-sublabel">{t('homeCroplandsInundated')}</div>
            </div>
            <div className="live-stat-card">
              <Anchor size={16} />
              <div className="live-stat-value">340</div>
              <div className="live-stat-label">{t('homeRescueBoatsActive')}</div>
              <div className="live-stat-sublabel">{t('homeBnccArmyDeployed')}</div>
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
              <span className="news-section-tag">{t('homeNewsTag')}</span>
              <h2 className="news-section-title">{t('homeNewsTitle')}</h2>
            </div>
            <Link to="/news" className="news-read-more">
              {t('homeReadMore')}
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="news-grid">
            {/* Featured article */}
            <div className="news-featured">
              <div className="news-featured-image-wrapper">
                <img src={NEWS_FEATURED_IMG} alt="Evacuation during flood" className="news-featured-img" />
                <div className="news-featured-overlay" />
                <div className="news-featured-tag">{t('homeFieldReport')}</div>
                <div className="news-featured-bottom-text">
                  <div className="news-featured-category">{t('homeRescueCat')}</div>
                  <div className="news-featured-title">
                    {t('homeFeaturedNewsTitle')}
                  </div>
                </div>
              </div>
              <div className="news-featured-body">
                <p className="news-featured-excerpt">
                  {t('homeFeaturedNewsExcerpt')}
                </p>
                <Link to="/news/1" className="news-featured-link">
                  {t('homeReadMore')}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>

            {/* Sidebar */}
            <div className="news-sidebar">
              <div className="news-sidebar-item">
                <img src={NEWS_THUMB_1} alt="Medical team" className="news-sidebar-thumb" />
                <div className="news-sidebar-content">
                  <span className="news-sidebar-cat">{t('homeHealthCat')}</span>
                  <div className="news-sidebar-title">
                    {t('homeNews2Title')}
                  </div>
                  <Link to="/news/2" className="news-sidebar-link">
                    {t('homeRead')}
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <div className="news-sidebar-item">
                <img src={NEWS_THUMB_2} alt="Relief distribution" className="news-sidebar-thumb" />
                <div className="news-sidebar-content">
                  <span className="news-sidebar-cat">{t('homeCommunityCat')}</span>
                  <div className="news-sidebar-title">
                    {t('homeNews3Title')}
                  </div>
                  <Link to="/news/3" className="news-sidebar-link">
                    {t('homeRead')}
                    <ArrowRight size={12} />
                  </Link>
                </div>
              </div>

              <div className="news-sidebar-item">
                <img src={NEWS_THUMB_3} alt="Recovery effort" className="news-sidebar-thumb" />
                <div className="news-sidebar-content">
                  <span className="news-sidebar-cat">{t('homeResilienceCat')}</span>
                  <div className="news-sidebar-title">
                    {t('homeNews4Title')}
                  </div>
                  <Link to="/news/4" className="news-sidebar-link">
                    {t('homeRead')}
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
            <div className="how-help-tag">{t('homeHowHelpTag')}</div>
            <h2 className="how-help-title">{t('homeHowHelpTitle')}</h2>
            <p className="how-help-description">
              {t('homeHowHelpDesc')}
            </p>
            <div className="how-help-actions">
              <Link to="/get-help" className="how-help-primary">{t('homeRequestHelpTitle')}</Link>
              <Link to="/volunteer" className="how-help-secondary">{t('volunteer')}</Link>
            </div>
          </div>

          <div className="help-gallery">
            <div className="help-photo-card help-photo-card-large">
              <img src={HELP_IMAGE_1} alt="Relief transport by boat" className="help-photo-img" />
              <div className="help-photo-overlay" />
              <div className="help-photo-caption">
                <span className="help-photo-kicker">{t('homeReliefTransport')}</span>
                <span className="help-photo-title">{t('homeReliefTransportTitle')}</span>
              </div>
            </div>

            <div className="help-photo-card help-photo-card-small">
              <img src={HELP_IMAGE_2} alt="Flood response by local residents" className="help-photo-img" />
              <div className="help-photo-overlay" />
              <div className="help-photo-caption">
                <span className="help-photo-kicker">{t('homeCommunitySupport')}</span>
                <span className="help-photo-title">{t('homeCommunitySupportTitle')}</span>
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
              <h2 className="updates-title">{t('homeLatestUpdates')}</h2>
              <Link to="/alerts" className="updates-all-link">
                {t('homeAllAlerts')}
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
                        <span className="alert-verified-badge">{t('homeGovtVerified')}</span>
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
                <h3>{t('homeTrackYourRequest')}</h3>
              </div>
              <p className="widget-desc">
                {t('homeTrackDesc')}
                {isAuthenticated && (
                  <> Signed in? <Link to="/my-requests">See all your requests</Link> without typing an ID.</>
                )}
              </p>
              <form onSubmit={handleTrackSubmit} className="track-form">
                <input
                  type="text"
                  placeholder="SHY-2026-XXXXXX"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  className="track-input"
                />
                <button type="submit" className="track-btn">{t('homeTrackSubmit')}</button>
              </form>
              {trackingError && <div className="track-error">{trackingError}</div>}
              {trackingResult && (
                <div className="track-result-box">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="track-id-code">{trackingResult.trackingId}</span>
                    <span className="track-status-badge">{trackingResult.status}</span>
                  </div>
                  <p className="track-result-location">
                    {trackingResult.types.map((ty) => ty.replace(/_/g, ' ')).join(', ')} · {[trackingResult.upazila, trackingResult.district].filter(Boolean).join(', ')}
                  </p>
                  <p className="track-result-location">{TRACK_STATUS_TEXT[trackingResult.status] || trackingResult.status}</p>
                </div>
              )}
            </div>

            {/* Emergency Hotlines */}
            <div className="widget-card">
              <div className="widget-header">
                <PhoneCall size={20} />
                <h3>{t('homeEmergencyHotlines')}</h3>
              </div>
              <div className="hotline-list">
                <div className="hotline-item">
                  <span className="hotline-name">{t('homeNationalEmergency')}</span>
                  <span className="hotline-number">999</span>
                </div>
                <div className="hotline-item">
                  <span className="hotline-name">{t('homeFireService')}</span>
                  <span className="hotline-number">102</span>
                </div>
                <div className="hotline-item">
                  <span className="hotline-name">{t('homeAmbulanceService')}</span>
                  <span className="hotline-number">199</span>
                </div>
              </div>
              <Link to="/contacts" className="all-contacts-link">
                {t('homeAllContacts')}
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
            <h3>{t('homeBottomVolunteerTitle')}</h3>
            <p>{t('homeBottomVolunteerDesc')}</p>
            <Link to="/volunteer/register" className="bottom-card-btn">{t('homeJoinNow')}</Link>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-icon">
              <FileText />
            </div>
            <h3>{t('homeBottomTransparencyTitle')}</h3>
            <p>{t('homeBottomTransparencyDesc')}</p>
            <Link to="/campaigns" className="bottom-card-btn">{t('homeViewReports')}</Link>
          </div>

          <div className="bottom-card">
            <div className="bottom-card-icon">
              <Activity />
            </div>
            <h3>{t('homeBottomImpactTitle')}</h3>
            <p>{t('homeBottomImpactDesc')}</p>
            <Link to="/campaigns" className="bottom-card-btn">{t('homeImpactReport')}</Link>
          </div>
        </div>
      </section>
    </div>
    </PageLayout>
  );
};



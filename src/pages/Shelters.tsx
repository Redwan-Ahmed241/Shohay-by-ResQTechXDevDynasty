import React, { useState, useEffect } from 'react';
import {
  Droplets,
  RotateCw,
  Users,
  Zap,
  Radio,
  Coffee,
  Heart,
  MapPin
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Checkbox } from '../components/ui/Checkbox';
import { shelterService } from '../services/shelterService';
import { Shelter, ShelterStatus } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './Shelters.css';

export const Shelters: React.FC = () => {
  const { t } = useLanguage();
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [summaryStats, setSummaryStats] = useState<any>(null);

  // Filters
  const [selectedStatus, setSelectedStatus] = useState<ShelterStatus | 'All'>('All');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('All');
  const [amenitiesFilter, setAmenitiesFilter] = useState({
    drinkingWater: false,
    toilets: false,
    womenToilets: false,
    electricity: false,
    generator: false,
    food: false,
    medicalSupport: false
  });

  useEffect(() => {
    fetchData();
  }, [selectedStatus, selectedDistrict, amenitiesFilter]);

  const fetchData = async () => {
    const stats = await shelterService.getShelterSummaryStats();
    setSummaryStats(stats);

    const list = await shelterService.getShelters({
      status: selectedStatus,
      district: selectedDistrict,
      amenities: amenitiesFilter
    });
    setShelters(list);
  };

  const districts = ['All', 'Sunamganj', 'Sirajganj', 'Kurigram', 'Feni', 'Gaibandha'];

  const statusList: Array<{ id: ShelterStatus | 'All'; labelKey: string }> = [
    { id: 'All', labelKey: 'filterAll' },
    { id: 'Open', labelKey: 'statusOpen' },
    { id: 'Nearly Full', labelKey: 'statusNearlyFull' },
    { id: 'Full', labelKey: 'statusFull' }
  ];

  const toggleAmenity = (key: keyof typeof amenitiesFilter) => {
    setAmenitiesFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getStatusBadge = (status: ShelterStatus) => {
    switch (status) {
      case 'Open':
        return <span className="badge-status badge-open">{t('statusOpen')}</span>;
      case 'Nearly Full':
        return <span className="badge-status badge-nearly-full">{t('statusNearlyFull')}</span>;
      case 'Full':
        return <span className="badge-status badge-full">{t('statusFull')}</span>;
      case 'Unverified':
        return <span className="badge-status badge-unverified">{t('statusUnverified')}</span>;
      default:
        return <span className="badge-status">{status}</span>;
    }
  };

  const getRouteBadge = (routeStatus: string) => {
    switch (routeStatus) {
      case 'Caution':
        return <span className="badge-route route-caution">{t('routeCaution')}</span>;
      case 'Blocked':
        return <span className="badge-route route-blocked">{t('routeBlocked')}</span>;
      case 'Route OK':
        return <span className="badge-route route-ok">{t('routeOk')}</span>;
      default:
        return <span className="badge-route">{routeStatus}</span>;
    }
  };

  const getProgressBarColor = (occupancyPct: number, status: ShelterStatus) => {
    if (status === 'Unverified') return '#e2e8f0';
    if (occupancyPct >= 95) return '#ef4444'; // Red
    if (occupancyPct >= 75) return '#f97316'; // Orange
    return '#10b981'; // Green
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="shelters-page-bg">
        <div className="shelters-container">
          {/* Top Summary Stats Bar */}
          {summaryStats && (
            <div className="shelter-stats-grid">
              <div className="summary-stat-box box-green">
                <div className="summary-num">{summaryStats.openShelters}</div>
                <div className="summary-lbl">{t('openSheltersLabel')}</div>
              </div>
              <div className="summary-stat-box box-amber">
                <div className="summary-num">{summaryStats.nearlyFull}</div>
                <div className="summary-lbl">{t('nearlyFullLabel')}</div>
              </div>
              <div className="summary-stat-box box-blue">
                <div className="summary-num">{summaryStats.freeSpaces}</div>
                <div className="summary-lbl">{t('freeSpacesLabel')}</div>
              </div>
            </div>
          )}

          <div className="shelters-content-layout">
            {/* Left Sidebar Filters */}
            <aside className="shelters-sidebar">
              <div className="filter-card">
                <h3 className="filter-title">{t('filterSheltersHeading')}</h3>

                {/* Filter 1: Status */}
                <div className="filter-group">
                  <div className="filter-label">{t('statusLabel')}</div>
                  <div className="filter-chips">
                    {statusList.map((st) => (
                      <button
                        key={st.id}
                        className={`f-chip ${selectedStatus === st.id ? 'active' : ''}`}
                        onClick={() => setSelectedStatus(st.id as any)}
                      >
                        {t(st.labelKey)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter 2: District */}
                <div className="filter-group">
                  <div className="filter-label">{t('districtFilterLabel')}</div>
                  <div className="filter-chips">
                    {districts.map((d) => (
                      <button
                        key={d}
                        className={`f-chip ${selectedDistrict === d ? 'active' : ''}`}
                        onClick={() => setSelectedDistrict(d)}
                      >
                        {d === 'All' ? t('filterAll') : d}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filter 3: Must Have Amenities */}
                <div className="filter-group">
                  <div className="filter-label">{t('mustHaveLabel')}</div>
                  <div className="amenities-checkboxes">
                    <Checkbox
                      label={t('amenityDrinkingWater')}
                      icon={<Droplets size={14} />}
                      checked={amenitiesFilter.drinkingWater}
                      onChange={() => toggleAmenity('drinkingWater')}
                    />
                    <Checkbox
                      label={t('amenityToilets')}
                      icon={<RotateCw size={14} />}
                      checked={amenitiesFilter.toilets}
                      onChange={() => toggleAmenity('toilets')}
                    />
                    <Checkbox
                      label={t('amenityWomenToilets')}
                      icon={<Users size={14} />}
                      checked={amenitiesFilter.womenToilets}
                      onChange={() => toggleAmenity('womenToilets')}
                    />
                    <Checkbox
                      label={t('amenityElectricity')}
                      icon={<Zap size={14} />}
                      checked={amenitiesFilter.electricity}
                      onChange={() => toggleAmenity('electricity')}
                    />
                    <Checkbox
                      label={t('amenityGenerator')}
                      icon={<Radio size={14} />}
                      checked={amenitiesFilter.generator}
                      onChange={() => toggleAmenity('generator')}
                    />
                    <Checkbox
                      label={t('amenityFood')}
                      icon={<Coffee size={14} />}
                      checked={amenitiesFilter.food}
                      onChange={() => toggleAmenity('food')}
                    />
                    <Checkbox
                      label={t('amenityMedicalSupport')}
                      icon={<Heart size={14} />}
                      checked={amenitiesFilter.medicalSupport}
                      onChange={() => toggleAmenity('medicalSupport')}
                    />
                  </div>
                </div>
              </div>
            </aside>

            {/* Right Main List */}
            <main className="shelters-main-list">
              <div className="results-count-text">
                {shelters.length} {t('sheltersShown')}
              </div>

              <div className="shelter-cards-stack">
                {shelters.map((shelter) => {
                  const occupancyPct = shelter.capacity > 0
                    ? Math.round((shelter.occupancy / shelter.capacity) * 100)
                    : 0;

                  return (
                    <div key={shelter.id} className="shelter-item-card">
                      <div className="card-top-row">
                        <div className="shelter-info">
                          <h3 className="shelter-title">{shelter.name}</h3>
                          <div className="shelter-location">
                            <MapPin size={12} className="map-icon" />
                            <span>{shelter.address}</span>
                          </div>
                        </div>

                        <div className="shelter-badges">
                          {getStatusBadge(shelter.status)}
                          {getRouteBadge(shelter.routeStatus)}
                        </div>
                      </div>

                      {/* Category label on top right below badge if present */}
                      <div className="card-category-row">
                        <span className="category-text">{shelter.category}</span>
                      </div>

                      {/* Capacity & Progress bar */}
                      <div className="occupancy-container">
                        <div className="occupancy-text-row">
                          <span className="capacity-num">
                            {shelter.occupancy} / {shelter.capacity} {t('peopleLabel')}
                          </span>
                          <span className="capacity-pct">{occupancyPct}%</span>
                        </div>
                        <div className="progress-track">
                          <div
                            className="progress-bar-fill"
                            style={{
                              width: `${occupancyPct}%`,
                              backgroundColor: getProgressBarColor(occupancyPct, shelter.status)
                            }}
                          />
                        </div>
                      </div>

                      {/* Amenity Icons Row */}
                      <div className="amenities-bottom-row">
                        <div className="amenity-icons">
                          {shelter.amenities.drinkingWater && (
                            <span className="icon-box" title={t('amenityDrinkingWater')}><Droplets size={14} /></span>
                          )}
                          {shelter.amenities.toilets && (
                            <span className="icon-box" title={t('amenityToilets')}><RotateCw size={14} /></span>
                          )}
                          {shelter.amenities.womenToilets && (
                            <span className="icon-box" title={t('amenityWomenToilets')}><Users size={14} /></span>
                          )}
                          {shelter.amenities.electricity && (
                            <span className="icon-box" title={t('amenityElectricity')}><Zap size={14} /></span>
                          )}
                          {shelter.amenities.generator && (
                            <span className="icon-box" title={t('amenityGenerator')}><Radio size={14} /></span>
                          )}
                          {shelter.amenities.food && (
                            <span className="icon-box" title={t('amenityFood')}><Coffee size={14} /></span>
                          )}
                          {shelter.amenities.medicalSupport && (
                            <span className="icon-box" title={t('amenityMedicalSupport')}><Heart size={14} /></span>
                          )}
                          {shelter.id === 'shelter-1' && <span className="more-count">+6</span>}
                          {shelter.id === 'shelter-3' && <span className="more-count">+8</span>}
                          {shelter.id === 'shelter-5' && <span className="more-count">+5</span>}
                          {shelter.id === 'shelter-6' && <span className="more-count">+5</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

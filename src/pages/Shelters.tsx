import React, { useState } from 'react';
import {
  Droplets,
  RotateCw,
  Users,
  Zap,
  Radio,
  Coffee,
  Heart,
  MapPin,
  Plus,
  X
} from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { PageLayout } from '../components/layout/PageLayout';
import { Checkbox } from '../components/ui/Checkbox';
import { useAuth } from '../context/AuthContext';
import { useFlash } from '../hooks/useFlash';
import { useShelters, useShelterSummary } from '../hooks/queries';
import { shelterService } from '../services/shelterService';
import { ApiError } from '../services/api';
import { ShelterStatus, ShelterCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './CommandCenter.css';
import './Shelters.css';

const EMPTY_SHELTER = { name: '', address: '', upazila: '', district: 'Sunamganj', capacity: 100, category: 'Government Building' as ShelterCategory };

export const Shelters: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const { notice, flash } = useFlash();
  const { t } = useLanguage();

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
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState(EMPTY_SHELTER);
  const [busy, setBusy] = useState(false);

  const { data: summaryStats } = useShelterSummary();
  const { data: shelters = [] } = useShelters({
    status: selectedStatus,
    district: selectedDistrict,
    amenities: amenitiesFilter
  });

  const districts = ['All', 'Sunamganj', 'Sirajganj', 'Kurigram', 'Feni', 'Gaibandha'];
  const shelterCategories: ShelterCategory[] = ['Government Building', 'Education Institution', 'Cyclone Shelter', 'Sports Facility', 'School'];

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await shelterService.createShelter(form);
      await queryClient.invalidateQueries({ queryKey: ['shelters'] });
      setShowCreate(false);
      setForm(EMPTY_SHELTER);
      flash('ok', 'Shelter added.');
    } catch (err) {
      flash('error', err instanceof ApiError ? err.message : 'Could not add the shelter.');
    } finally {
      setBusy(false);
    }
  };

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
              <div className="results-count-text" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{shelters.length} {t('sheltersShown')}</span>
                {isAdmin && (
                  <button className="btn-table-action btn-action-assign" onClick={() => setShowCreate(true)} style={{ padding: '6px 14px', fontSize: 12, borderRadius: 6 }}>
                    <Plus size={14} /> New Shelter
                  </button>
                )}
              </div>

              {notice && (
                <div role={notice.kind === 'error' ? 'alert' : 'status'} style={{ padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 600, marginBottom: 16, background: notice.kind === 'ok' ? '#ecfdf5' : '#fef2f2', border: `1px solid ${notice.kind === 'ok' ? '#a7f3d0' : '#fecaca'}`, color: notice.kind === 'ok' ? '#065f46' : '#991b1b' }}>
                  {notice.text}
                </div>
              )}

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

      {showCreate && (
        <div className="modal-backdrop" onClick={() => setShowCreate(false)}>
          <div className="modal-box animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="shelter-create-title" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 id="shelter-create-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Add a Shelter</h3>
              <button onClick={() => setShowCreate(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="s-name">NAME</label>
                <input id="s-name" className="form-input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tahirpur College Shelter" required minLength={3} autoFocus />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="s-address">ADDRESS</label>
                <input id="s-address" className="form-input-field" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Street / landmark" required />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="s-upazila">UPAZILA</label>
                  <input id="s-upazila" className="form-input-field" value={form.upazila} onChange={(e) => setForm({ ...form, upazila: e.target.value })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="s-district">DISTRICT</label>
                  <input id="s-district" className="form-input-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} required />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="s-capacity">CAPACITY</label>
                  <input id="s-capacity" type="number" min={1} max={100000} className="form-input-field" value={form.capacity} onChange={(e) => setForm({ ...form, capacity: parseInt(e.target.value) || 0 })} required />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#334155', marginBottom: 4 }} htmlFor="s-category">CATEGORY</label>
                  <select id="s-category" className="form-input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as ShelterCategory })}>
                    {shelterCategories.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                <button type="button" className="btn-outline-subtle" onClick={() => setShowCreate(false)}>Cancel</button>
                <button type="submit" className="btn-navy-primary" disabled={busy}>{busy ? 'Adding…' : 'Add Shelter'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
};

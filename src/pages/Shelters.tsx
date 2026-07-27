import React, { useState, useEffect } from 'react';
import {
  Droplets,
  Zap,
  Coffee,
  HeartPulse,
  Lock,
  Compass,
  MapPin,
  Check
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { ProgressBar } from '../components/ui/ProgressBar';
import { Checkbox } from '../components/ui/Checkbox';
import { shelterService } from '../services/shelterService';
import { Shelter, ShelterStatus } from '../types';
import './Shelters.css';

export const Shelters: React.FC = () => {
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

  const toggleAmenity = (key: keyof typeof amenitiesFilter) => {
    setAmenitiesFilter((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container shelters-page">
        {/* Top Summary Stats Bar */}
        {summaryStats && (
          <div className="shelter-stats-bar grid-3 gap-4 mb-6">
            <div className="summary-stat-box box-green">
              <div className="summary-num">{summaryStats.openShelters}</div>
              <div className="summary-lbl">Open Shelters</div>
            </div>
            <div className="summary-stat-box box-yellow">
              <div className="summary-num">{summaryStats.nearlyFull}</div>
              <div className="summary-lbl">Nearly Full</div>
            </div>
            <div className="summary-stat-box box-blue">
              <div className="summary-num">{summaryStats.freeSpaces}</div>
              <div className="summary-lbl">Free Spaces</div>
            </div>
          </div>
        )}

        <div className="shelters-layout">
          {/* Left Sidebar: Filter Shelters */}
          <aside className="shelters-sidebar">
            <Card className="filter-card flex flex-col gap-6">
              <h3>Filter Shelters</h3>

              {/* Filter 1: Status */}
              <div className="filter-group">
                <label className="filter-label">Status</label>
                <div className="filter-buttons flex gap-1 flex-wrap mt-2">
                  {['All', 'Open', 'Nearly Full', 'Full'].map((st) => (
                    <button
                      key={st}
                      className={`f-chip ${selectedStatus === st ? 'active' : ''}`}
                      onClick={() => setSelectedStatus(st as any)}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 2: District */}
              <div className="filter-group">
                <label className="filter-label">District</label>
                <div className="filter-buttons flex gap-1 flex-wrap mt-2">
                  {districts.map((d) => (
                    <button
                      key={d}
                      className={`f-chip ${selectedDistrict === d ? 'active' : ''}`}
                      onClick={() => setSelectedDistrict(d)}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              {/* Filter 3: Must Have Amenities */}
              <div className="filter-group">
                <label className="filter-label">Must have</label>
                <div className="flex flex-col gap-2 mt-2">
                  <Checkbox
                    label="Drinking Water"
                    icon={<Droplets size={14} />}
                    checked={amenitiesFilter.drinkingWater}
                    onChange={() => toggleAmenity('drinkingWater')}
                  />
                  <Checkbox
                    label="Toilets"
                    checked={amenitiesFilter.toilets}
                    onChange={() => toggleAmenity('toilets')}
                  />
                  <Checkbox
                    label="Women's Toilets"
                    checked={amenitiesFilter.womenToilets}
                    onChange={() => toggleAmenity('womenToilets')}
                  />
                  <Checkbox
                    label="Electricity"
                    icon={<Zap size={14} />}
                    checked={amenitiesFilter.electricity}
                    onChange={() => toggleAmenity('electricity')}
                  />
                  <Checkbox
                    label="Generator"
                    checked={amenitiesFilter.generator}
                    onChange={() => toggleAmenity('generator')}
                  />
                  <Checkbox
                    label="Food"
                    icon={<Coffee size={14} />}
                    checked={amenitiesFilter.food}
                    onChange={() => toggleAmenity('food')}
                  />
                  <Checkbox
                    label="Medical Support"
                    icon={<HeartPulse size={14} />}
                    checked={amenitiesFilter.medicalSupport}
                    onChange={() => toggleAmenity('medicalSupport')}
                  />
                </div>
              </div>
            </Card>
          </aside>

          {/* Right Main Content: Shelter List */}
          <main className="shelters-main flex flex-col gap-4">
            <div className="results-count-text">
              {shelters.length} shelters shown
            </div>

            {shelters.map((shelter) => {
              const occupancyPct = Math.round((shelter.occupancy / shelter.capacity) * 100) || 0;

              return (
                <Card key={shelter.id} className="shelter-card">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="shelter-name">{shelter.name}</h3>
                      <div className="shelter-address flex items-center gap-1 mt-1">
                        <MapPin size={12} />
                        <span>{shelter.address}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Badge variant={shelter.status}>{shelter.status}</Badge>
                      <Badge variant={shelter.routeStatus}>{shelter.routeStatus}</Badge>
                    </div>
                  </div>

                  {/* Occupancy Progress */}
                  <div className="occupancy-section mt-4">
                    <ProgressBar
                      value={occupancyPct}
                      label={`${shelter.occupancy} / ${shelter.capacity} people`}
                      showPercentage={true}
                    />
                  </div>

                  {/* Amenities Row */}
                  <div className="amenities-row flex items-center justify-between mt-4">
                    <div className="amenity-icons flex gap-2">
                      {shelter.amenities.drinkingWater && (
                        <span className="icon-pill" title="Drinking Water"><Droplets size={14} /></span>
                      )}
                      {shelter.amenities.electricity && (
                        <span className="icon-pill" title="Electricity"><Zap size={14} /></span>
                      )}
                      {shelter.amenities.food && (
                        <span className="icon-pill" title="Food"><Coffee size={14} /></span>
                      )}
                      {shelter.amenities.medicalSupport && (
                        <span className="icon-pill" title="Medical Support"><HeartPulse size={14} /></span>
                      )}
                      <span className="icon-more">+6</span>
                    </div>

                    <span className="category-tag-text">{shelter.category}</span>
                  </div>
                </Card>
              );
            })}
          </main>
        </div>
      </div>
    </PageLayout>
  );
};

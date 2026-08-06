import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';
import { AlertTriangle, Users, Home, Box } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import './CommandCenter.css';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'shelters' | 'warehouse' | 'verify'>('overview');

  // Chart Data from Figma
  const requestTrendData = [
    { date: 'Jul 10', submitted: 20, resolved: 10 },
    { date: 'Jul 11', submitted: 45, resolved: 25 },
    { date: 'Jul 12', submitted: 80, resolved: 50 },
    { date: 'Jul 13', submitted: 125, resolved: 85 },
    { date: 'Jul 14', submitted: 148, resolved: 110 },
    { date: 'Jul 15', submitted: 155, resolved: 140 }
  ];

  const occupancyByDistrictData = [
    { district: 'Sunamganj', occupancy: 950 },
    { district: 'Sirajganj', occupancy: 1340 },
    { district: 'Kurigram', occupancy: 312 },
    { district: 'Feni', occupancy: 620 },
    { district: 'Gaibandha', occupancy: 377 }
  ];

  return (
    <PageLayout showAlertBanner={false}>
      <div className="cc-page-bg">
        <div className="cc-container">
          {/* Top Header Row */}
          <div className="cc-header-row">
            <div>
              <h1 className="cc-title">Command Center</h1>
              <p className="cc-subtitle">Administrator Dashboard — Shelter, Warehouse &amp; Operations</p>
            </div>
            <span className="cc-ops-active-pill">■ Operations Active</span>
          </div>

          {/* 4 Primary Stat Cards Grid */}
          <div className="cc-top-stats-grid">
            <div className="cc-stat-card card-red">
              <div className="cc-stat-info">
                <span className="cc-stat-label label-red">OPEN REQUESTS</span>
                <div className="cc-stat-value text-red">142</div>
                <div className="cc-stat-sub text-red">18 critical</div>
              </div>
              <AlertTriangle size={24} className="icon-red" />
            </div>

            <div className="cc-stat-card card-blue">
              <div className="cc-stat-info">
                <span className="cc-stat-label label-blue">ACTIVE VOLUNTEERS</span>
                <div className="cc-stat-value text-blue">89</div>
                <div className="cc-stat-sub text-blue">12 rescue teams</div>
              </div>
              <Users size={24} className="icon-blue" />
            </div>

            <div className="cc-stat-card card-green">
              <div className="cc-stat-info">
                <span className="cc-stat-label label-green">SHELTER OCCUPANCY</span>
                <div className="cc-stat-value text-green">3,599/5,800</div>
                <div className="cc-stat-sub text-green">1 nearly full</div>
              </div>
              <Home size={24} className="icon-green" />
            </div>

            <div className="cc-stat-card card-purple">
              <div className="cc-stat-info">
                <span className="cc-stat-label label-purple">HOUSEHOLDS REACHED</span>
                <div className="cc-stat-value text-purple">4,310</div>
                <div className="cc-stat-sub text-purple">8 today</div>
              </div>
              <Box size={24} className="icon-purple" />
            </div>
          </div>

          {/* 4 Secondary Stat Cards Row */}
          <div className="cc-secondary-stats-grid">
            <div className="cc-sec-stat-card">
              <div className="sec-stat-val text-amber">34</div>
              <div className="sec-stat-lbl">Awaiting Verification</div>
            </div>

            <div className="cc-sec-stat-card">
              <div className="sec-stat-val text-blue">47m</div>
              <div className="sec-stat-lbl">Avg Verify Time</div>
            </div>

            <div className="cc-sec-stat-card">
              <div className="sec-stat-val text-red">3</div>
              <div className="sec-stat-lbl">Low Stock Items</div>
            </div>

            <div className="cc-sec-stat-card">
              <div className="sec-stat-val text-orange">7</div>
              <div className="sec-stat-lbl">Open Complaints</div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="cc-nav-tabs">
            <button
              className={`cc-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button
              className={`cc-tab-item ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Requests
            </button>
            <button
              className={`cc-tab-item ${activeTab === 'shelters' ? 'active' : ''}`}
              onClick={() => setActiveTab('shelters')}
            >
              Shelters
            </button>
            <button
              className={`cc-tab-item ${activeTab === 'warehouse' ? 'active' : ''}`}
              onClick={() => navigate('/admin/warehouse')}
            >
              Warehouse
            </button>
            <button
              className={`cc-tab-item ${activeTab === 'verify' ? 'active' : ''}`}
              onClick={() => setActiveTab('verify')}
            >
              Verify Queue
            </button>
          </div>

          {/* 2 Charts Grid */}
          <div className="cc-charts-grid">
            <div className="cc-chart-card">
              <h3 className="chart-title">REQUEST TREND (7 DAYS)</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={requestTrendData}>
                    <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '4px' }} />
                    <Line type="monotone" dataKey="submitted" stroke="#006a4e" strokeWidth={2.5} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="chart-legend">
                <span className="legend-item"><span className="legend-dot green" /> Submitted</span>
                <span className="legend-item"><span className="legend-dot dark" /> Resolved</span>
              </div>
            </div>

            <div className="cc-chart-card">
              <h3 className="chart-title">SHELTER OCCUPANCY BY DISTRICT</h3>
              <div className="chart-container">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={occupancyByDistrictData}>
                    <XAxis dataKey="district" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '4px' }} />
                    <Bar dataKey="occupancy" fill="#93c5fd" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Bottom 3 Summary Lists */}
          <div className="cc-bottom-lists-grid">
            <div className="cc-list-card">
              <h4 className="list-card-title">Districts Active</h4>
              <ul className="cc-bullet-list">
                <li>Sunamganj</li>
                <li>Sirajganj</li>
                <li>Kurigram</li>
                <li>Feni</li>
                <li>Netrokona</li>
              </ul>
            </div>

            <div className="cc-list-card">
              <h4 className="list-card-title">Partner Organizations</h4>
              <ul className="cc-bullet-list">
                <li>BRAC</li>
                <li>ActionAid</li>
                <li>CARE</li>
                <li>UNICEF</li>
                <li>WFP</li>
                <li>WHO</li>
                <li className="text-muted">+ 8 more</li>
              </ul>
            </div>

            <div className="cc-list-card">
              <h4 className="list-card-title">Active Alerts</h4>
              <ul className="cc-bullet-list">
                <li><strong className="text-red">Critical:</strong> Sunamganj</li>
                <li><strong className="text-orange">High:</strong> Sirajganj</li>
                <li><strong className="text-amber">Med:</strong> Netrokona</li>
                <li><strong className="text-blue">Low:</strong> Kurigram</li>
                <li><strong className="text-green">All Clear:</strong> Habiganj</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

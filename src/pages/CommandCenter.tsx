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
import { AlertTriangle, Users, Home, Box, Clock, CheckCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
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
      <div className="container command-center-page">
        {/* Header Title + Status */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1>Command Center</h1>
            <p className="text-xs text-muted">Administrator Dashboard — Shelter, Warehouse &amp; Operations</p>
          </div>
          <Badge variant="LOW" pulse>
            ● Operations Active
          </Badge>
        </div>

        {/* 4 Primary Stat Cards */}
        <div className="grid-4 gap-4 mb-4">
          <Card className="cc-stat-box stat-red">
            <div className="flex justify-between items-start">
              <div>
                <span className="cc-lbl">OPEN REQUESTS</span>
                <div className="cc-val">142</div>
                <div className="cc-sub">18 critical</div>
              </div>
              <AlertTriangle size={20} className="text-danger" />
            </div>
          </Card>

          <Card className="cc-stat-box stat-blue">
            <div className="flex justify-between items-start">
              <div>
                <span className="cc-lbl">ACTIVE VOLUNTEERS</span>
                <div className="cc-val">89</div>
                <div className="cc-sub">12 rescue teams</div>
              </div>
              <Users size={20} className="text-info" />
            </div>
          </Card>

          <Card className="cc-stat-box stat-green">
            <div className="flex justify-between items-start">
              <div>
                <span className="cc-lbl">SHELTER OCCUPANCY</span>
                <div className="cc-val">3,599/5,800</div>
                <div className="cc-sub">1 nearly full</div>
              </div>
              <Home size={20} className="text-success" />
            </div>
          </Card>

          <Card className="cc-stat-box stat-purple">
            <div className="flex justify-between items-start">
              <div>
                <span className="cc-lbl">HOUSEHOLDS REACHED</span>
                <div className="cc-val">4,310</div>
                <div className="cc-sub">8 today</div>
              </div>
              <Box size={20} className="text-purple-400" />
            </div>
          </Card>
        </div>

        {/* 4 Secondary Stat Cards */}
        <div className="grid-4 gap-4 mb-6">
          <Card className="cc-substat-box">
            <div className="sub-val">34</div>
            <div className="sub-lbl">Awaiting Verification</div>
          </Card>
          <Card className="cc-substat-box">
            <div className="sub-val">47m</div>
            <div className="sub-lbl">Avg Verify Time</div>
          </Card>
          <Card className="cc-substat-box">
            <div className="sub-val text-warning">3</div>
            <div className="sub-lbl">Low Stock Items</div>
          </Card>
          <Card className="cc-substat-box">
            <div className="sub-val">7</div>
            <div className="sub-lbl">Open Complaints</div>
          </Card>
        </div>

        {/* Navigation Tabs */}
        <div className="cc-tabs flex gap-2 border-b mb-6">
          <button
            className={`cc-tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`cc-tab-btn ${activeTab === 'requests' ? 'active' : ''}`}
            onClick={() => setActiveTab('requests')}
          >
            Requests
          </button>
          <button
            className={`cc-tab-btn ${activeTab === 'shelters' ? 'active' : ''}`}
            onClick={() => setActiveTab('shelters')}
          >
            Shelters
          </button>
          <button
            className={`cc-tab-btn ${activeTab === 'warehouse' ? 'active' : ''}`}
            onClick={() => navigate('/admin/warehouse')}
          >
            Warehouse
          </button>
          <button
            className={`cc-tab-btn ${activeTab === 'verify' ? 'active' : ''}`}
            onClick={() => setActiveTab('verify')}
          >
            Verify Queue
          </button>
        </div>

        {/* Charts Grid */}
        <div className="grid-2 gap-6 mb-6">
          {/* Chart 1: Request Trend */}
          <Card className="chart-card">
            <h3>REQUEST TREND (7 DAYS)</h3>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={requestTrendData}>
                  <XAxis dataKey="date" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155' }} />
                  <Line type="monotone" dataKey="submitted" stroke="#0D9488" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="resolved" stroke="#16A34A" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="flex gap-4 justify-center text-xs text-muted mt-2">
              <span className="flex items-center gap-1"><span className="legend-dot bg-teal-500" /> Submitted</span>
              <span className="flex items-center gap-1"><span className="legend-dot bg-green-500" /> Resolved</span>
            </div>
          </Card>

          {/* Chart 2: Shelter Occupancy by District */}
          <Card className="chart-card">
            <h3>SHELTER OCCUPANCY BY DISTRICT</h3>
            <div className="h-64 mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyByDistrictData}>
                  <XAxis dataKey="district" stroke="#64748B" fontSize={12} />
                  <YAxis stroke="#64748B" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1E293B', borderColor: '#334155' }} />
                  <Bar dataKey="occupancy" fill="#60A5FA" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* Bottom 3 Info Cards */}
        <div className="grid-3 gap-6">
          <Card className="info-list-card">
            <h4>Districts Active</h4>
            <ul className="info-list mt-3">
              <li>Sunamganj</li>
              <li>Sirajganj</li>
              <li>Kurigram</li>
              <li>Feni</li>
              <li>Netrokona</li>
            </ul>
          </Card>

          <Card className="info-list-card">
            <h4>Partner Organizations</h4>
            <ul className="info-list mt-3">
              <li>BRAC</li>
              <li>ActionAid</li>
              <li>CARE</li>
              <li>UNICEF</li>
              <li>WFP</li>
              <li>WHO</li>
            </ul>
          </Card>

          <Card className="info-list-card">
            <h4>Active Alerts</h4>
            <ul className="info-list mt-3">
              <li><span className="text-danger font-bold">Critical:</span> Sunamganj</li>
              <li><span className="text-warning font-bold">High:</span> Sirajganj</li>
              <li><span className="text-yellow-400 font-bold">Med:</span> Netrokona</li>
              <li><span className="text-info font-bold">Low:</span> Kurigram</li>
              <li><span className="text-success font-bold">All Clear:</span> Habiganj</li>
            </ul>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
};

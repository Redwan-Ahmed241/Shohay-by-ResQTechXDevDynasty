import React, { useState, useEffect } from 'react';
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
import {
  AlertTriangle,
  Users,
  Home,
  Box,
  CheckCircle2,
  Clock,
  Check,
  Plus,
  Phone,
  MapPin,
  ShieldCheck,
  X,
  UserCheck,
  Loader2
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { requestService } from '../services/requestService';
import { volunteerService } from '../services/volunteerService';
import { AssistanceRequestRecord } from '../types';
import './CommandCenter.css';

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'overview' | 'requests' | 'volunteers' | 'shelters' | 'warehouse'>('overview');

  // Real Data States
  const [requests, setRequests] = useState<AssistanceRequestRecord[]>([]);
  const [requestFilter, setRequestFilter] = useState<string>('All');
  const [volunteers, setVolunteers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Dispatch Assignment Modal State
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [newAssignment, setNewAssignment] = useState({
    title: '',
    location: '',
    district: 'Sunamganj',
    durationHours: 4,
    teamSize: 4,
    priority: 'high'
  });

  useEffect(() => {
    loadRealData();
  }, []);

  const loadRealData = async () => {
    setIsLoading(true);
    try {
      const [reqList, volData] = await Promise.all([
        requestService.getAllRequests(),
        volunteerService.getAllVolunteers()
      ]);
      setRequests(reqList || []);
      setVolunteers(volData?.volunteers || []);
    } catch (err) {
      console.warn('Failed to load operational data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const updated = await requestService.updateRequestStatus(requestId, newStatus);
      setRequests((prev) => prev.map((r) => (r.id === requestId || r.trackingId === requestId ? updated : r)));
      setActionMessage(`Request ${updated.trackingId} status updated to "${newStatus}".`);
      setTimeout(() => setActionMessage(null), 4000);
    } catch (err: any) {
      alert('Failed to update status: ' + err.message);
    }
  };

  const handleCreateAssignmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await volunteerService.createAssignment(newAssignment);
      setShowDispatchModal(false);
      setActionMessage(`New task "${newAssignment.title}" successfully dispatched to volunteer dashboards!`);
      setNewAssignment({
        title: '',
        location: '',
        district: 'Sunamganj',
        durationHours: 4,
        teamSize: 4,
        priority: 'high'
      });
      setTimeout(() => setActionMessage(null), 5000);
    } catch (err: any) {
      alert('Failed to dispatch assignment: ' + err.message);
    }
  };

  // Filtered requests
  const filteredRequests = requests.filter((r) => {
    if (requestFilter === 'All') return true;
    return r.status.toLowerCase() === requestFilter.toLowerCase();
  });

  const openRequestsCount = requests.filter((r) => r.status !== 'Resolved').length;
  const criticalRequestsCount = requests.filter((r) => r.types.includes('rescue')).length;

  // Chart Data
  const requestTrendData = [
    { date: 'Jul 10', submitted: 20, resolved: 10 },
    { date: 'Jul 11', submitted: 45, resolved: 25 },
    { date: 'Jul 12', submitted: 80, resolved: 50 },
    { date: 'Jul 13', submitted: 125, resolved: 85 },
    { date: 'Jul 14', submitted: 148, resolved: 110 },
    { date: 'Jul 15', submitted: requests.length || 155, resolved: requests.filter((r) => r.status === 'Resolved').length || 140 }
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
              <p className="cc-subtitle">Disaster Response Operations, Citizen Requests &amp; Volunteer Deployment</p>
            </div>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
              <button
                className="btn-table-action btn-action-assign"
                onClick={() => setShowDispatchModal(true)}
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}
              >
                <Plus size={15} />
                <span>Dispatch New Assignment</span>
              </button>
              <span className="cc-ops-active-pill">■ Operations Active</span>
            </div>
          </div>

          {actionMessage && (
            <div style={{ padding: '12px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CheckCircle2 size={16} style={{ color: '#059669' }} />
              <span>{actionMessage}</span>
            </div>
          )}

          {/* 4 Primary Stat Cards Grid */}
          <div className="cc-top-stats-grid">
            <div className="cc-stat-card card-red" onClick={() => setActiveTab('requests')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-red">OPEN ASSISTANCE REQUESTS</span>
                <div className="cc-stat-value text-red">{openRequestsCount || 142}</div>
                <div className="cc-stat-sub text-red">{criticalRequestsCount || 18} rescue priorities</div>
              </div>
              <AlertTriangle size={24} className="icon-red" />
            </div>

            <div className="cc-stat-card card-blue" onClick={() => setActiveTab('volunteers')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-blue">REGISTERED VOLUNTEERS</span>
                <div className="cc-stat-value text-blue">{volunteers.length || 89}</div>
                <div className="cc-stat-sub text-blue">Available in disaster zones</div>
              </div>
              <Users size={24} className="icon-blue" />
            </div>

            <div className="cc-stat-card card-green" onClick={() => navigate('/shelters')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-green">SHELTER OCCUPANCY</span>
                <div className="cc-stat-value text-green">3,599/5,800</div>
                <div className="cc-stat-sub text-green">1 nearly full</div>
              </div>
              <Home size={24} className="icon-green" />
            </div>

            <div className="cc-stat-card card-purple" onClick={() => navigate('/campaigns')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-purple">HOUSEHOLDS REACHED</span>
                <div className="cc-stat-value text-purple">4,310</div>
                <div className="cc-stat-sub text-purple">Relief distributed</div>
              </div>
              <Box size={24} className="icon-purple" />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="cc-nav-tabs">
            <button
              className={`cc-tab-item ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview &amp; Trends
            </button>
            <button
              className={`cc-tab-item ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Requests &amp; Approvals ({requests.length})
            </button>
            <button
              className={`cc-tab-item ${activeTab === 'volunteers' ? 'active' : ''}`}
              onClick={() => setActiveTab('volunteers')}
            >
              Volunteer Directory ({volunteers.length})
            </button>
            <button
              className="cc-tab-item"
              onClick={() => navigate('/shelters')}
            >
              Shelters
            </button>
            <button
              className="cc-tab-item"
              onClick={() => navigate('/admin/warehouse')}
            >
              Warehouse Inventory
            </button>
          </div>

          {/* ═══════════ TAB 1: OVERVIEW ═══════════ */}
          {activeTab === 'overview' && (
            <>
              {/* Secondary Metrics */}
              <div className="cc-secondary-stats-grid">
                <div className="cc-sec-stat-card">
                  <div className="sec-stat-val text-amber">{requests.filter((r) => r.status === 'Pending').length}</div>
                  <div className="sec-stat-lbl">Awaiting Verification</div>
                </div>

                <div className="cc-sec-stat-card">
                  <div className="sec-stat-val text-blue">{requests.filter((r) => r.status === 'Verified' || r.status === 'In Progress').length}</div>
                  <div className="sec-stat-lbl">In Active Response</div>
                </div>

                <div className="cc-sec-stat-card">
                  <div className="sec-stat-val text-red">3</div>
                  <div className="sec-stat-lbl">Low Stock Items</div>
                </div>

                <div className="cc-sec-stat-card">
                  <div className="sec-stat-val text-orange">{requests.filter((r) => r.status === 'Resolved').length}</div>
                  <div className="sec-stat-lbl">Resolved Requests</div>
                </div>
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
                  <h4 className="list-card-title">Active Flood Alerts</h4>
                  <ul className="cc-bullet-list">
                    <li><strong className="text-red">Critical:</strong> Sunamganj</li>
                    <li><strong className="text-orange">High:</strong> Sirajganj</li>
                    <li><strong className="text-amber">Med:</strong> Netrokona</li>
                    <li><strong className="text-blue">Low:</strong> Kurigram</li>
                    <li><strong className="text-green">All Clear:</strong> Habiganj</li>
                  </ul>
                </div>
              </div>
            </>
          )}

          {/* ═══════════ TAB 2: REQUESTS & APPROVALS ═══════════ */}
          {activeTab === 'requests' && (
            <div className="cc-requests-view">
              <div className="cc-toolbar-row">
                <div className="filter-chips-group">
                  {['All', 'Pending', 'Verified', 'In Progress', 'Resolved'].map((st) => (
                    <button
                      key={st}
                      className={`filter-chip-btn ${requestFilter === st ? 'active' : ''}`}
                      onClick={() => setRequestFilter(st)}
                    >
                      {st} {st === 'All' ? `(${requests.length})` : `(${requests.filter((r) => r.status.toLowerCase() === st.toLowerCase()).length})`}
                    </button>
                  ))}
                </div>

                <button
                  className="filter-chip-btn"
                  onClick={loadRealData}
                  disabled={isLoading}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {isLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Refresh Requests</span>
                </button>
              </div>

              <div className="cc-data-card">
                <div className="cc-table-wrapper">
                  <table className="cc-interactive-table">
                    <thead>
                      <tr>
                        <th>Tracking ID</th>
                        <th>Type &amp; Needs</th>
                        <th>Contact / Family</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>
                            No assistance requests found in this view.
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => (
                          <tr key={req.id || req.trackingId}>
                            <td>
                              <strong style={{ fontFamily: 'monospace', color: '#0f3460', fontSize: '13px' }}>
                                {req.trackingId}
                              </strong>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>
                                {req.createdAt?.slice(0, 16) || 'Recent'}
                              </div>
                            </td>

                            <td>
                              <div>
                                {req.types.map((t) => (
                                  <span key={t} className="req-badge-type">
                                    {t.toUpperCase()}
                                  </span>
                                ))}
                              </div>
                              <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                                Household: <strong>{req.householdSize}</strong> persons
                                {req.vulnerableCount && (req.vulnerableCount.elderly > 0 || req.vulnerableCount.children > 0) && (
                                  <span style={{ color: '#dc2626', marginLeft: '6px' }}>
                                    (⚠️ {req.vulnerableCount.elderly} elderly, {req.vulnerableCount.children} children)
                                  </span>
                                )}
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 600, color: '#0f172a' }}>
                                {req.contact.isAnonymous ? 'Anonymous Citizen' : req.contact.name}
                              </div>
                              <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                <Phone size={12} />
                                <span>{req.contact.phone || 'No phone'}</span>
                              </div>
                            </td>

                            <td>
                              <div style={{ fontWeight: 500 }}>{req.location.district}, {req.location.upazila}</div>
                              <div style={{ fontSize: '11px', color: '#64748b' }}>{req.location.address || req.location.union}</div>
                              {req.notes && (
                                <div style={{ fontSize: '11px', color: '#0284c7', fontStyle: 'italic', marginTop: '2px' }}>
                                  "{req.notes}"
                                </div>
                              )}
                            </td>

                            <td>
                              <span className={`req-status-pill req-status-${req.status.toLowerCase().replace(' ', '-')}`}>
                                {req.status}
                              </span>
                            </td>

                            <td>
                              <div className="action-btns-group">
                                {req.status === 'Pending' && (
                                  <button
                                    className="btn-table-action btn-action-verify"
                                    onClick={() => handleUpdateStatus(req.id || req.trackingId, 'Verified')}
                                    title="Verify & Approve request"
                                  >
                                    <Check size={12} /> Approve
                                  </button>
                                )}

                                {req.status !== 'Assigned' && req.status !== 'In Progress' && req.status !== 'Resolved' && (
                                  <button
                                    className="btn-table-action btn-action-assign"
                                    onClick={() => handleUpdateStatus(req.id || req.trackingId, 'In Progress')}
                                    title="Dispatch to Field Volunteers"
                                  >
                                    <UserCheck size={12} /> Dispatch
                                  </button>
                                )}

                                {req.status !== 'Resolved' && (
                                  <button
                                    className="btn-table-action btn-action-resolve"
                                    onClick={() => handleUpdateStatus(req.id || req.trackingId, 'Resolved')}
                                    title="Mark request as fulfilled"
                                  >
                                    <CheckCircle2 size={12} /> Resolve
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 3: VOLUNTEER DIRECTORY ═══════════ */}
          {activeTab === 'volunteers' && (
            <div className="cc-volunteers-view">
              <div className="cc-toolbar-row">
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Registered Disaster Response Field Force
                  </h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {volunteers.length} verified rescue and relief specialists connected to database.
                  </p>
                </div>

                <button
                  className="btn-table-action btn-action-assign"
                  onClick={() => setShowDispatchModal(true)}
                  style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}
                >
                  <Plus size={15} />
                  <span>Dispatch New Assignment</span>
                </button>
              </div>

              <div className="volunteers-cards-grid">
                {volunteers.map((vol) => {
                  const volName = vol.name || `${vol.first_name || vol.firstName || ''} ${vol.last_name || vol.lastName || ''}`.trim() || 'Volunteer';
                  const volInitials = volName.split(' ').filter(Boolean).map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || 'VOL';
                  const volPhone = vol.phone_number || vol.phoneNumber || '01XXXXXXXXX';
                  const volEmail = vol.email || 'volunteer@shohay.gov.bd';
                  const volDistrict = vol.address || 'Sunamganj';
                  const volSkills = vol.skills && Array.isArray(vol.skills) ? vol.skills : ['Field Rescue', 'First Aid'];
                  const volEquipment = vol.equipment && Array.isArray(vol.equipment) ? vol.equipment : [];

                  return (
                    <div key={vol.id} className="vol-dir-card">
                      <div className="vol-dir-top">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#0f3460', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                            {volInitials}
                          </div>
                          <div>
                            <h4 className="vol-dir-name">{volName}</h4>
                            <span style={{ fontSize: '11px', color: '#006a4e', fontWeight: 600, background: '#ecfdf5', padding: '2px 8px', borderRadius: '12px' }}>
                              {vol.verification_status || 'Verified Worker'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="vol-dir-contact">
                        <Phone size={12} />
                        <span>{volPhone}</span>
                      </div>

                      <div className="vol-dir-contact">
                        <MapPin size={12} />
                        <span>{volDistrict}</span>
                      </div>

                      <div className="vol-skills-wrap">
                        {volSkills.map((s: string) => (
                          <span key={s} className="vol-skill-tag">
                            {s}
                          </span>
                        ))}
                      </div>

                      {volEquipment.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>
                          🧰 {volEquipment.join(', ')}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════ DISPATCH ASSIGNMENT MODAL ═══════════ */}
          {showDispatchModal && (
            <div className="modal-backdrop" onClick={() => setShowDispatchModal(false)}>
              <div className="modal-box animate-scale-up" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    Dispatch New Volunteer Assignment
                  </h3>
                  <button onClick={() => setShowDispatchModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleCreateAssignmentSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      ASSIGNMENT TITLE
                    </label>
                    <input
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Emergency Food &amp; Water Pack Distribution"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        LOCATION / STATION
                      </label>
                      <input
                        type="text"
                        className="form-input-field"
                        placeholder="e.g. Tahirpur College Shelter"
                        value={newAssignment.location}
                        onChange={(e) => setNewAssignment({ ...newAssignment, location: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        DISTRICT
                      </label>
                      <input
                        type="text"
                        className="form-input-field"
                        value={newAssignment.district}
                        onChange={(e) => setNewAssignment({ ...newAssignment, district: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        ESTIMATED HOURS
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="24"
                        className="form-input-field"
                        value={newAssignment.durationHours}
                        onChange={(e) => setNewAssignment({ ...newAssignment, durationHours: parseInt(e.target.value) || 4 })}
                        required
                      />
                    </div>

                    <div>
                      <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                        TEAM SIZE (VOLUNTEERS)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        className="form-input-field"
                        value={newAssignment.teamSize}
                        onChange={(e) => setNewAssignment({ ...newAssignment, teamSize: parseInt(e.target.value) || 4 })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' }}>
                      PRIORITY LEVEL
                    </label>
                    <select
                      className="form-input-field"
                      value={newAssignment.priority}
                      onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value })}
                    >
                      <option value="critical">CRITICAL (Life Threatening)</option>
                      <option value="high">HIGH (Urgent Relief)</option>
                      <option value="medium">MEDIUM (Standard Logistics)</option>
                      <option value="low">LOW (Routine Support)</option>
                    </select>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button
                      type="button"
                      className="btn-outline-subtle"
                      onClick={() => setShowDispatchModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="btn-navy-primary"
                    >
                      Dispatch Assignment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
};

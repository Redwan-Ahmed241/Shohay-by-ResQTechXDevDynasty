import React, { useState, useEffect, useCallback, useMemo } from 'react';
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
  Check,
  Plus,
  Phone,
  MapPin,
  X,
  UserCheck,
  Loader2,
  Radar,
  Ban
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useFlash } from '../hooks/useFlash';
import { requestService, DispatchTaskInput } from '../services/requestService';
import { volunteerService } from '../services/volunteerService';
import { shelterService } from '../services/shelterService';
import { campaignService } from '../services/campaignService';
import { alertService } from '../services/alertService';
import { warehouseService } from '../services/warehouseService';
import { uavService } from '../services/uavService';
import { ApiError } from '../services/api';
import {
  AssistanceRequestRecord,
  AssistanceType,
  FloodAlert,
  ReliefCampaign,
  RequestStatus,
  Shelter,
  VolunteerAssignment,
  VolunteerDirectoryEntry
} from '../types';
import './CommandCenter.css';

type Tab = 'overview' | 'requests' | 'tasks' | 'volunteers';

const REQUEST_FILTERS: Array<'All' | RequestStatus> = ['All', 'Pending', 'Verified', 'Assigned', 'In Progress', 'Resolved'];
const URGENT_TYPES: AssistanceType[] = ['rescue', 'medical_emergency', 'maternal', 'missing_person', 'evacuation'];

const EMPTY_TASK: DispatchTaskInput = {
  title: '',
  location: '',
  district: 'Sunamganj',
  durationHours: 4,
  teamSize: 4,
  priority: 'high'
};

/** Pre-fills the dispatch form from a citizen request. */
function suggestTask(req: AssistanceRequestRecord): DispatchTaskInput {
  const urgent = req.types.some((t) => URGENT_TYPES.includes(t));
  const vulnerable = Object.values(req.vulnerableCount || {}).reduce((sum, n) => sum + (n || 0), 0);
  const needs = req.types.map((t) => t.replace(/_/g, ' ')).join(' + ');
  const place = req.location.upazila || req.location.district;
  return {
    title: `${needs.charAt(0).toUpperCase()}${needs.slice(1)} — ${place}`.slice(0, 500),
    location: [req.location.address, req.location.upazila].filter(Boolean).join(', ') || req.location.district || 'See request',
    district: req.location.district || 'Unknown',
    durationHours: 4,
    teamSize: Math.min(10, Math.max(2, Math.ceil(req.householdSize / 3))),
    priority: urgent ? 'critical' : vulnerable > 0 ? 'high' : 'medium'
  };
}

function errorText(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Could not reach the Shohay server.';
}

/** Requests per day for the last 7 days (createdAt is "YYYY-MM-DD HH:MM"). */
function lastSevenDays(requests: AssistanceRequestRecord[]) {
  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    const onDay = requests.filter((r) => (r.createdAt || '').startsWith(key));
    days.push({
      date: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }),
      submitted: onDay.length,
      resolved: onDay.filter((r) => r.status === 'Resolved').length
    });
  }
  return days;
}

export const CommandCenter: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('overview');

  // Live data
  const [requests, setRequests] = useState<AssistanceRequestRecord[]>([]);
  const [tasks, setTasks] = useState<VolunteerAssignment[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerDirectoryEntry[]>([]);
  const [shelters, setShelters] = useState<Shelter[]>([]);
  const [campaigns, setCampaigns] = useState<ReliefCampaign[]>([]);
  const [alerts, setAlerts] = useState<FloodAlert[]>([]);
  const [householdsReached, setHouseholdsReached] = useState<string>('—');
  const [lowStockCount, setLowStockCount] = useState<number>(0);
  const [newDetections, setNewDetections] = useState<number>(0);

  const [requestFilter, setRequestFilter] = useState<'All' | RequestStatus>('All');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { notice: actionMessage, flash } = useFlash();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Dispatch modal: `dispatchFor` is the citizen request being dispatched (null = standalone task)
  const [showDispatchModal, setShowDispatchModal] = useState<boolean>(false);
  const [dispatchFor, setDispatchFor] = useState<AssistanceRequestRecord | null>(null);
  const [newAssignment, setNewAssignment] = useState<DispatchTaskInput>(EMPTY_TASK);

  const loadRealData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqList, volData, taskList] = await Promise.all([
        requestService.getAllRequests(),
        volunteerService.getAllVolunteers(),
        volunteerService.getAllAssignments()
      ]);
      setRequests(reqList);
      setVolunteers(volData.volunteers);
      setTasks(taskList);
      setLoadError(null);
    } catch (err) {
      setLoadError(errorText(err));
    } finally {
      setIsLoading(false);
    }

    // Secondary panels: a failure here should not hide the request queue
    shelterService.getShelters().then(setShelters).catch(() => undefined);
    campaignService.getCampaigns().then(setCampaigns).catch(() => undefined);
    campaignService.getCampaignSummaryStats().then((s) => setHouseholdsReached(s.householdsReached)).catch(() => undefined);
    alertService.getAlerts().then(setAlerts).catch(() => undefined);
    warehouseService.getLowStockAlerts().then((items) => setLowStockCount(items.length)).catch(() => undefined);
    uavService.getDetections({ status: 'New', limit: 200 }).then((d) => setNewDetections(d.length)).catch(() => undefined);
  }, []);

  useEffect(() => {
    loadRealData();
  }, [loadRealData]);

  const replaceRequest = (updated: AssistanceRequestRecord) =>
    setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

  const handleUpdateStatus = async (req: AssistanceRequestRecord, newStatus: RequestStatus) => {
    setBusyId(req.id);
    try {
      replaceRequest(await requestService.updateRequestStatus(req.id, newStatus));
      flash('ok', `Request ${req.trackingId} is now "${newStatus}".`);
    } catch (err) {
      flash('error', `Could not update ${req.trackingId}: ${errorText(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  const openDispatch = (req: AssistanceRequestRecord | null) => {
    setDispatchFor(req);
    setNewAssignment(req ? suggestTask(req) : EMPTY_TASK);
    setShowDispatchModal(true);
  };

  const handleDispatchSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusyId('dispatch');
    try {
      if (dispatchFor) {
        replaceRequest(await requestService.dispatchRequest(dispatchFor.id, newAssignment));
        flash('ok', `${dispatchFor.trackingId} dispatched. It is now on every volunteer dashboard.`);
      } else {
        await volunteerService.createAssignment(newAssignment);
        flash('ok', `Task "${newAssignment.title}" posted to volunteer dashboards.`);
      }
      setShowDispatchModal(false);
      setTasks(await volunteerService.getAllAssignments());
    } catch (err) {
      flash('error', `Dispatch failed: ${errorText(err)}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleVerify = async (vol: VolunteerDirectoryEntry, newStatus: 'Verified' | 'Rejected') => {
    setBusyId(vol.id);
    try {
      await volunteerService.setVerification(vol.id, newStatus);
      setVolunteers((prev) => prev.map((v) => (v.id === vol.id ? { ...v, verification_status: newStatus } : v)));
      flash('ok', `${vol.first_name} ${vol.last_name} is now ${newStatus.toLowerCase()}.`);
    } catch (err) {
      flash('error', errorText(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleCancelTask = async (task: VolunteerAssignment) => {
    if (!window.confirm(`Cancel "${task.title}"? Its volunteer (if any) is released and the request goes back to Verified.`)) return;
    setBusyId(task.id);
    try {
      await volunteerService.cancelAssignment(task.id);
      flash('ok', `Task "${task.title}" cancelled.`);
      await loadRealData();
    } catch (err) {
      flash('error', errorText(err));
    } finally {
      setBusyId(null);
    }
  };

  // Derived numbers (all from live data)
  const filteredRequests = requests.filter((r) => requestFilter === 'All' || r.status === requestFilter);
  const openRequests = requests.filter((r) => r.status !== 'Resolved');
  const urgentOpen = openRequests.filter((r) => r.types.some((t) => URGENT_TYPES.includes(t))).length;
  const onDutyCount = volunteers.filter((v) => v.dutyStatus === 'On Duty').length;
  const totalOccupancy = shelters.reduce((sum, s) => sum + s.occupancy, 0);
  const totalCapacity = shelters.reduce((sum, s) => sum + s.capacity, 0);
  const nearlyFull = shelters.filter((s) => s.status === 'Nearly Full' || s.status === 'Full').length;

  const requestTrendData = useMemo(() => lastSevenDays(requests), [requests]);
  const occupancyByDistrictData = useMemo(() => {
    const byDistrict: Record<string, number> = {};
    shelters.forEach((s) => { byDistrict[s.district] = (byDistrict[s.district] || 0) + s.occupancy; });
    return Object.entries(byDistrict).map(([district, occupancy]) => ({ district, occupancy }));
  }, [shelters]);
  const activeDistricts = useMemo(
    () => [...new Set([...openRequests.map((r) => r.location.district), ...shelters.map((s) => s.district)].filter(Boolean))],
    [openRequests, shelters]
  );
  const partnerOrgs = [...new Set(campaigns.map((c) => c.organization))];

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: '12px', fontWeight: 600, color: '#334155', marginBottom: '4px' };

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
                onClick={() => openDispatch(null)}
                style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}
              >
                <Plus size={15} />
                <span>New Volunteer Task</span>
              </button>
              <span className="cc-ops-active-pill">■ Operations Active</span>
            </div>
          </div>

          {actionMessage && (
            <div
              role={actionMessage.kind === 'error' ? 'alert' : 'status'}
              style={{
                padding: '12px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '20px',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: actionMessage.kind === 'ok' ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${actionMessage.kind === 'ok' ? '#a7f3d0' : '#fecaca'}`,
                color: actionMessage.kind === 'ok' ? '#065f46' : '#991b1b'
              }}
            >
              {actionMessage.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
              <span>{actionMessage.text}</span>
            </div>
          )}

          {loadError && (
            <div role="alert" style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
              <span>Could not load operations data: {loadError}</span>
              <button className="filter-chip-btn" onClick={loadRealData}>Retry</button>
            </div>
          )}

          {newDetections > 0 && (
            <button
              type="button"
              onClick={() => navigate('/admin/uav')}
              style={{ width: '100%', textAlign: 'left', padding: '12px 16px', background: '#fff7ed', border: '1px solid #fdba74', borderRadius: '8px', color: '#9a3412', fontSize: '13px', fontWeight: 600, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
            >
              <Radar size={16} />
              <span>{newDetections} new drone detection{newDetections === 1 ? '' : 's'} waiting for review — open the UAV Monitor</span>
            </button>
          )}

          {/* 4 Primary Stat Cards Grid */}
          <div className="cc-top-stats-grid">
            <div className="cc-stat-card card-red" onClick={() => setActiveTab('requests')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-red">OPEN ASSISTANCE REQUESTS</span>
                <div className="cc-stat-value text-red">{openRequests.length}</div>
                <div className="cc-stat-sub text-red">{urgentOpen} life-threatening</div>
              </div>
              <AlertTriangle size={24} className="icon-red" />
            </div>

            <div className="cc-stat-card card-blue" onClick={() => setActiveTab('volunteers')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-blue">REGISTERED VOLUNTEERS</span>
                <div className="cc-stat-value text-blue">{volunteers.length}</div>
                <div className="cc-stat-sub text-blue">{onDutyCount} on duty now</div>
              </div>
              <Users size={24} className="icon-blue" />
            </div>

            <div className="cc-stat-card card-green" onClick={() => navigate('/shelters')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-green">SHELTER OCCUPANCY</span>
                <div className="cc-stat-value text-green">{totalOccupancy.toLocaleString()}/{totalCapacity.toLocaleString()}</div>
                <div className="cc-stat-sub text-green">{nearlyFull} nearly full</div>
              </div>
              <Home size={24} className="icon-green" />
            </div>

            <div className="cc-stat-card card-purple" onClick={() => navigate('/campaigns')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-purple">HOUSEHOLDS REACHED</span>
                <div className="cc-stat-value text-purple">{householdsReached}</div>
                <div className="cc-stat-sub text-purple">Through relief campaigns</div>
              </div>
              <Box size={24} className="icon-purple" />
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="cc-nav-tabs">
            <button className={`cc-tab-item ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              Overview &amp; Trends
            </button>
            <button className={`cc-tab-item ${activeTab === 'requests' ? 'active' : ''}`} onClick={() => setActiveTab('requests')}>
              Requests &amp; Approvals ({requests.length})
            </button>
            <button className={`cc-tab-item ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
              Volunteer Tasks ({tasks.filter((t) => t.status === 'Available' || t.status === 'In Progress').length})
            </button>
            <button className={`cc-tab-item ${activeTab === 'volunteers' ? 'active' : ''}`} onClick={() => setActiveTab('volunteers')}>
              Volunteer Directory ({volunteers.length})
            </button>
            <button className="cc-tab-item" onClick={() => navigate('/admin/uav')}>
              UAV Monitor
            </button>
            <button className="cc-tab-item" onClick={() => navigate('/admin/warehouse')}>
              Warehouse Inventory
            </button>
          </div>

          {/* ═══════════ TAB 1: OVERVIEW ═══════════ */}
          {activeTab === 'overview' && (
            <>
              <div className="cc-secondary-stats-grid">
                <div className="cc-sec-stat-card">
                  <div className="sec-stat-val text-amber">{requests.filter((r) => r.status === 'Pending').length}</div>
                  <div className="sec-stat-lbl">Awaiting Verification</div>
                </div>
                <div className="cc-sec-stat-card">
                  <div className="sec-stat-val text-blue">{requests.filter((r) => ['Verified', 'Assigned', 'In Progress'].includes(r.status)).length}</div>
                  <div className="sec-stat-lbl">In Active Response</div>
                </div>
                <div className="cc-sec-stat-card">
                  <div className="sec-stat-val text-red">{lowStockCount}</div>
                  <div className="sec-stat-lbl">Low Stock Items</div>
                </div>
                <div className="cc-sec-stat-card">
                  <div className="sec-stat-val text-orange">{requests.filter((r) => r.status === 'Resolved').length}</div>
                  <div className="sec-stat-lbl">Resolved Requests</div>
                </div>
              </div>

              <div className="cc-charts-grid">
                <div className="cc-chart-card">
                  <h3 className="chart-title">REQUESTS SUBMITTED (LAST 7 DAYS)</h3>
                  <div className="chart-container">
                    <ResponsiveContainer width="100%" height={220}>
                      <LineChart data={requestTrendData}>
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} allowDecimals={false} />
                        <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', color: '#0f172a', borderRadius: '4px' }} />
                        <Line type="monotone" dataKey="submitted" name="Submitted" stroke="#006a4e" strokeWidth={2.5} dot={false} />
                        <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#0f172a" strokeWidth={2} dot={false} />
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
                        <Bar dataKey="occupancy" name="People sheltered" fill="#93c5fd" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              <div className="cc-bottom-lists-grid">
                <div className="cc-list-card">
                  <h4 className="list-card-title">Districts Active</h4>
                  <ul className="cc-bullet-list">
                    {activeDistricts.length === 0 && <li className="text-muted">None yet</li>}
                    {activeDistricts.slice(0, 8).map((d) => <li key={d}>{d}</li>)}
                  </ul>
                </div>

                <div className="cc-list-card">
                  <h4 className="list-card-title">Partner Organizations</h4>
                  <ul className="cc-bullet-list">
                    {partnerOrgs.length === 0 && <li className="text-muted">None yet</li>}
                    {partnerOrgs.slice(0, 6).map((o) => <li key={o}>{o}</li>)}
                    {partnerOrgs.length > 6 && <li className="text-muted">+ {partnerOrgs.length - 6} more</li>}
                  </ul>
                </div>

                <div className="cc-list-card">
                  <h4 className="list-card-title">Active Flood Alerts</h4>
                  <ul className="cc-bullet-list">
                    {alerts.length === 0 && <li className="text-muted">No alerts</li>}
                    {alerts.slice(0, 5).map((a) => (
                      <li key={a.id}>
                        <strong className={a.severity === 'CRITICAL' ? 'text-red' : a.severity === 'HIGH' ? 'text-orange' : a.severity === 'MEDIUM' ? 'text-amber' : 'text-blue'}>
                          {a.severity}:
                        </strong>{' '}
                        {a.affectedAreas.slice(0, 2).join(', ') || a.title}
                      </li>
                    ))}
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
                  {REQUEST_FILTERS.map((st) => (
                    <button
                      key={st}
                      className={`filter-chip-btn ${requestFilter === st ? 'active' : ''}`}
                      onClick={() => setRequestFilter(st)}
                    >
                      {st} ({st === 'All' ? requests.length : requests.filter((r) => r.status === st).length})
                    </button>
                  ))}
                </div>

                <button className="filter-chip-btn" onClick={loadRealData} disabled={isLoading} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {isLoading ? <Loader2 size={13} className="animate-spin" /> : null}
                  <span>Refresh</span>
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
                            {isLoading ? 'Loading…' : 'No assistance requests in this view.'}
                          </td>
                        </tr>
                      ) : (
                        filteredRequests.map((req) => {
                          const taskOpen = req.task && (req.task.status === 'Available' || req.task.status === 'In Progress');
                          const busy = busyId === req.id;
                          return (
                            <tr key={req.id}>
                              <td>
                                <strong style={{ fontFamily: 'monospace', color: '#0f3460', fontSize: '13px' }}>{req.trackingId}</strong>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '2px' }}>{req.createdAt?.slice(0, 16) || 'Recent'}</div>
                              </td>

                              <td>
                                <div>
                                  {req.types.map((t) => (
                                    <span key={t} className="req-badge-type">{t.replace(/_/g, ' ').toUpperCase()}</span>
                                  ))}
                                </div>
                                <div style={{ fontSize: '11px', color: '#64748b', marginTop: '4px' }}>
                                  Household: <strong>{req.householdSize}</strong>
                                  {req.vulnerableCount && (req.vulnerableCount.elderly > 0 || req.vulnerableCount.children > 0 || req.vulnerableCount.pregnant > 0 || req.vulnerableCount.disabled > 0) && (
                                    <span style={{ color: '#dc2626', marginLeft: '6px' }}>
                                      (⚠️ {[
                                        req.vulnerableCount.children && `${req.vulnerableCount.children} children`,
                                        req.vulnerableCount.elderly && `${req.vulnerableCount.elderly} elderly`,
                                        req.vulnerableCount.pregnant && `${req.vulnerableCount.pregnant} pregnant`,
                                        req.vulnerableCount.disabled && `${req.vulnerableCount.disabled} disabled`
                                      ].filter(Boolean).join(', ')})
                                    </span>
                                  )}
                                </div>
                              </td>

                              <td>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{req.contact.isAnonymous ? 'Anonymous Citizen' : req.contact.name}</div>
                                <div style={{ fontSize: '12px', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                                  <Phone size={12} />
                                  {req.contact.phone && req.contact.phone !== 'N/A' ? <a href={`tel:${req.contact.phone}`}>{req.contact.phone}</a> : <span>No phone</span>}
                                </div>
                              </td>

                              <td>
                                <div style={{ fontWeight: 500 }}>{[req.location.district, req.location.upazila].filter(Boolean).join(', ')}</div>
                                <div style={{ fontSize: '11px', color: '#64748b' }}>{req.location.address || req.location.union}</div>
                                {req.location.gpsCoords && (
                                  <a href={`https://www.google.com/maps?q=${req.location.gpsCoords}`} target="_blank" rel="noreferrer" style={{ fontSize: '11px' }}>
                                    <MapPin size={11} /> Open map
                                  </a>
                                )}
                                {req.notes && <div style={{ fontSize: '11px', color: '#0284c7', fontStyle: 'italic', marginTop: '2px' }}>"{req.notes}"</div>}
                              </td>

                              <td>
                                <span className={`req-status-pill req-status-${req.status.toLowerCase().replace(' ', '-')}`}>{req.status}</span>
                                {req.task && (
                                  <div style={{ fontSize: '11px', color: '#475569', marginTop: '4px' }}>
                                    Task: {req.task.status}
                                    {req.task.assignedVolunteerName && <> · {req.task.assignedVolunteerName}</>}
                                  </div>
                                )}
                              </td>

                              <td>
                                <div className="action-btns-group">
                                  {req.status === 'Pending' && (
                                    <button className="btn-table-action btn-action-verify" disabled={busy} onClick={() => handleUpdateStatus(req, 'Verified')} title="Verify & approve request">
                                      <Check size={12} /> Approve
                                    </button>
                                  )}
                                  {(req.status === 'Pending' || req.status === 'Verified') && !taskOpen && (
                                    <button className="btn-table-action btn-action-assign" disabled={busy} onClick={() => openDispatch(req)} title="Send to field volunteers">
                                      <UserCheck size={12} /> Dispatch
                                    </button>
                                  )}
                                  {req.status !== 'Resolved' && (
                                    <button className="btn-table-action btn-action-resolve" disabled={busy} onClick={() => handleUpdateStatus(req, 'Resolved')} title="Mark request as fulfilled">
                                      <CheckCircle2 size={12} /> Resolve
                                    </button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 3: VOLUNTEER TASKS ═══════════ */}
          {activeTab === 'tasks' && (
            <div className="cc-requests-view">
              <div className="cc-data-card">
                <div className="cc-table-wrapper">
                  <table className="cc-interactive-table">
                    <thead>
                      <tr>
                        <th>Task</th>
                        <th>Location</th>
                        <th>Priority</th>
                        <th>Status</th>
                        <th>Volunteer</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tasks.length === 0 ? (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '32px', color: '#64748b' }}>No volunteer tasks yet.</td>
                        </tr>
                      ) : (
                        tasks.map((t) => {
                          const request = t.requestId ? requests.find((r) => r.id === t.requestId) : undefined;
                          return (
                            <tr key={t.id}>
                              <td>
                                <div style={{ fontWeight: 600, color: '#0f172a' }}>{t.title}</div>
                                {request && <div style={{ fontSize: '11px', color: '#64748b', fontFamily: 'monospace' }}>{request.trackingId}</div>}
                              </td>
                              <td>{t.location}, {t.district}</td>
                              <td><span className="req-badge-type">{t.priority.toUpperCase()}</span></td>
                              <td><span className={`req-status-pill req-status-${t.status === 'Available' ? 'pending' : t.status === 'In Progress' ? 'in-progress' : 'resolved'}`}>{t.status}</span></td>
                              <td>{t.assignedVolunteerName || <span style={{ color: '#94a3b8' }}>Waiting for a volunteer</span>}</td>
                              <td>
                                {(t.status === 'Available' || t.status === 'In Progress') && (
                                  <button className="btn-table-action btn-action-resolve" disabled={busyId === t.id} onClick={() => handleCancelTask(t)}>
                                    <Ban size={12} /> Cancel
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ TAB 4: VOLUNTEER DIRECTORY ═══════════ */}
          {activeTab === 'volunteers' && (
            <div className="cc-volunteers-view">
              <div className="cc-toolbar-row">
                <div>
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Registered Field Volunteers</h3>
                  <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                    {volunteers.length} registered · {onDutyCount} on duty now
                  </p>
                </div>
              </div>

              {volunteers.length === 0 && (
                <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 13 }}>No field volunteers have registered yet.</div>
              )}

              <div className="volunteers-cards-grid">
                {volunteers.map((vol) => {
                  const volName = `${vol.first_name || ''} ${vol.last_name || ''}`.trim() || 'Volunteer';
                  const volInitials = volName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'VOL';
                  const dutyColor = vol.dutyStatus === 'On Duty' ? '#059669' : vol.dutyStatus === 'Paused' ? '#d97706' : '#64748b';
                  const vStatus = vol.verification_status || 'Pending';
                  const vColors = vStatus === 'Verified'
                    ? { bg: '#ecfdf5', fg: '#006a4e' }
                    : vStatus === 'Rejected'
                      ? { bg: '#fef2f2', fg: '#991b1b' }
                      : { bg: '#fffbeb', fg: '#92400e' };

                  return (
                    <div key={vol.id} className="vol-dir-card">
                      <div className="vol-dir-top">
                        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                          <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: '#0f3460', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
                            {volInitials}
                          </div>
                          <div>
                            <h4 className="vol-dir-name">{volName}</h4>
                            <span style={{ fontSize: '11px', color: vColors.fg, fontWeight: 600, background: vColors.bg, padding: '2px 8px', borderRadius: '12px' }}>
                              {vStatus}
                            </span>
                            <span style={{ fontSize: '11px', color: dutyColor, fontWeight: 600, marginLeft: 6 }}>● {vol.dutyStatus}</span>
                          </div>
                        </div>
                      </div>

                      {vStatus !== 'Verified' && (
                        <div className="action-btns-group" style={{ marginTop: 8, marginBottom: 4 }}>
                          <button className="btn-table-action btn-action-verify" disabled={busyId === vol.id} onClick={() => handleVerify(vol, 'Verified')}>
                            <Check size={12} /> Verify
                          </button>
                          {vStatus !== 'Rejected' && (
                            <button className="btn-table-action btn-action-resolve" disabled={busyId === vol.id} onClick={() => handleVerify(vol, 'Rejected')}>
                              <X size={12} /> Reject
                            </button>
                          )}
                        </div>
                      )}

                      <div className="vol-dir-contact">
                        <Phone size={12} />
                        {vol.phone_number ? <a href={`tel:${vol.phone_number}`}>{vol.phone_number}</a> : <span>No phone on file</span>}
                      </div>
                      <div className="vol-dir-contact">
                        <MapPin size={12} />
                        <span>{vol.district || 'District not set'}</span>
                      </div>
                      <div style={{ fontSize: '12px', color: '#475569', margin: '6px 0' }}>
                        {vol.currentAssignment ? <>Working on: <strong>{vol.currentAssignment.title}</strong></> : 'No active task'} · {vol.hoursLogged} h · {vol.tasksCompleted} tasks
                      </div>

                      <div className="vol-skills-wrap">
                        {vol.skills.map((s) => <span key={s} className="vol-skill-tag">{s}</span>)}
                      </div>
                      {vol.equipment.length > 0 && (
                        <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b' }}>🧰 {vol.equipment.join(', ')}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ═══════════ DISPATCH MODAL ═══════════ */}
          {showDispatchModal && (
            <div className="modal-backdrop" onClick={() => setShowDispatchModal(false)}>
              <div className="modal-box animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="dispatch-title" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 id="dispatch-title" style={{ margin: 0, fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>
                    {dispatchFor ? `Dispatch ${dispatchFor.trackingId} to volunteers` : 'New Volunteer Task'}
                  </h3>
                  <button onClick={() => setShowDispatchModal(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                    <X size={20} />
                  </button>
                </div>

                <form onSubmit={handleDispatchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div>
                    <label style={labelStyle} htmlFor="task-title">TASK TITLE</label>
                    <input
                      id="task-title"
                      type="text"
                      className="form-input-field"
                      placeholder="e.g. Emergency food & water distribution"
                      value={newAssignment.title}
                      onChange={(e) => setNewAssignment({ ...newAssignment, title: e.target.value })}
                      minLength={3}
                      required
                      autoFocus
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle} htmlFor="task-location">LOCATION / STATION</label>
                      <input id="task-location" type="text" className="form-input-field" placeholder="e.g. Tahirpur College Shelter"
                        value={newAssignment.location} onChange={(e) => setNewAssignment({ ...newAssignment, location: e.target.value })} required />
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="task-district">DISTRICT</label>
                      <input id="task-district" type="text" className="form-input-field"
                        value={newAssignment.district} onChange={(e) => setNewAssignment({ ...newAssignment, district: e.target.value })} required />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={labelStyle} htmlFor="task-hours">ESTIMATED HOURS</label>
                      <input id="task-hours" type="number" min="1" max="72" className="form-input-field"
                        value={newAssignment.durationHours} onChange={(e) => setNewAssignment({ ...newAssignment, durationHours: parseInt(e.target.value) || 4 })} required />
                    </div>
                    <div>
                      <label style={labelStyle} htmlFor="task-team">TEAM SIZE</label>
                      <input id="task-team" type="number" min="1" max="100" className="form-input-field"
                        value={newAssignment.teamSize} onChange={(e) => setNewAssignment({ ...newAssignment, teamSize: parseInt(e.target.value) || 4 })} required />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle} htmlFor="task-priority">PRIORITY LEVEL</label>
                    <select id="task-priority" className="form-input-field" value={newAssignment.priority}
                      onChange={(e) => setNewAssignment({ ...newAssignment, priority: e.target.value as DispatchTaskInput['priority'] })}>
                      <option value="critical">CRITICAL (Life Threatening)</option>
                      <option value="high">HIGH (Urgent Relief)</option>
                      <option value="medium">MEDIUM (Standard Logistics)</option>
                      <option value="low">LOW (Routine Support)</option>
                    </select>
                  </div>

                  {dispatchFor && (
                    <p style={{ fontSize: 12, color: '#64748b', margin: 0 }}>
                      The citizen's tracker will show "Assigned", then "In Progress" when a volunteer accepts, and "Resolved" when they finish.
                    </p>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
                    <button type="button" className="btn-outline-subtle" onClick={() => setShowDispatchModal(false)}>Cancel</button>
                    <button type="submit" className="btn-navy-primary" disabled={busyId === 'dispatch'}>
                      {busyId === 'dispatch' ? 'Dispatching…' : dispatchFor ? 'Dispatch to Volunteers' : 'Post Task'}
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

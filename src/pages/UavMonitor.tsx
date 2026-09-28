import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar, Plus, X, MapPin, CheckCircle2, AlertTriangle, BatteryMedium, KeyRound, Trash2, LifeBuoy, Ban, Copy, Video
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useFlash } from '../hooks/useFlash';
import { uavService } from '../services/uavService';
import { volunteerService } from '../services/volunteerService';
import { ApiError } from '../services/api';
import { UavDetection, UavDrone, UavLogEntry, UavRescuerAssignment, VolunteerDirectoryEntry } from '../types';
import './CommandCenter.css';
import './UavMonitor.css';

const DETECTION_POLL_MS = 5_000;
const DRONE_POLL_MS = 15_000;

function errorText(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Could not reach the Shohay server.';
}

function timeAgo(iso?: string | null): string {
  if (!iso) return 'never';
  const seconds = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  return new Date(iso).toLocaleString();
}

/** Runs `fn` every `ms` while the browser tab is visible. */
function usePolling(fn: () => void, ms: number) {
  const saved = useRef(fn);
  saved.current = fn;
  useEffect(() => {
    const t = setInterval(() => {
      if (document.visibilityState === 'visible') saved.current();
    }, ms);
    return () => clearInterval(t);
  }, [ms]);
}

export const UavMonitor: React.FC = () => {
  const navigate = useNavigate();
  const [drones, setDrones] = useState<UavDrone[]>([]);
  const [detections, setDetections] = useState<UavDetection[]>([]);
  const [assignments, setAssignments] = useState<UavRescuerAssignment[]>([]);
  const [volunteers, setVolunteers] = useState<VolunteerDirectoryEntry[]>([]);
  const [logs, setLogs] = useState<UavLogEntry[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const { notice, flash } = useFlash();
  const [busyId, setBusyId] = useState<string | null>(null);

  // Assign-rescuer form
  const [assignUser, setAssignUser] = useState('');
  const [assignDrone, setAssignDrone] = useState('');

  // Register drone modal; `issuedKey` shows the one-time API key after registering / rotating
  const [showRegister, setShowRegister] = useState(false);
  const [form, setForm] = useState({ name: '', registration_id: '', district: '', stream_url: '' });
  const [issuedKey, setIssuedKey] = useState<{ drone: UavDrone; apiKey: string } | null>(null);

  const loadAll = useCallback(async () => {
    try {
      const [d, det, a, v, l] = await Promise.all([
        uavService.getDrones(),
        uavService.getDetections({ limit: 100 }),
        uavService.getAssignments(),
        volunteerService.getAllVolunteers(),
        uavService.getLogs(50)
      ]);
      setDrones(d);
      setDetections(det);
      setAssignments(a);
      setVolunteers(v.volunteers);
      setLogs(l);
      setLastSync(new Date());
      setLoadError(null);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  // New detections only: ask for anything newer than the newest one we already have
  const pollDetections = async () => {
    try {
      const newest = detections[0]?.createdAt || undefined;
      const fresh = await uavService.getDetections({ since: newest, limit: 100 });
      if (fresh.length > 0) {
        setDetections((prev) => {
          const known = new Set(prev.map((d) => d.id));
          return [...fresh.filter((d) => !known.has(d.id)), ...prev];
        });
        uavService.getLogs(50).then(setLogs).catch(() => undefined);
      }
      setLastSync(new Date());
    } catch {
      // keep showing the last good data; the next poll retries
    }
  };
  usePolling(pollDetections, DETECTION_POLL_MS);
  usePolling(() => uavService.getDrones().then(setDrones).catch(() => undefined), DRONE_POLL_MS);

  const replaceDetection = (updated: UavDetection) =>
    setDetections((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));

  const act = async (id: string, fn: () => Promise<void>) => {
    setBusyId(id);
    try {
      await fn();
    } catch (err) {
      flash('error', errorText(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleRescue = (det: UavDetection) =>
    act(det.id, async () => {
      const { detection, request } = await uavService.createRescueRequest(det.id);
      replaceDetection(detection);
      flash('ok', `Rescue request ${request.trackingId} created. Dispatch it from Requests & Approvals.`);
    });

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    act('register', async () => {
      const created = await uavService.registerDrone({
        name: form.name.trim(),
        registration_id: form.registration_id.trim(),
        district: form.district.trim() || undefined,
        stream_url: form.stream_url.trim() || undefined
      });
      const { apiKey, ...drone } = created;
      setDrones((prev) => [...prev, drone].sort((a, b) => a.name.localeCompare(b.name)));
      setShowRegister(false);
      setForm({ name: '', registration_id: '', district: '', stream_url: '' });
      setIssuedKey({ drone, apiKey });
    });
  };

  const handleRotate = (drone: UavDrone) => {
    if (!window.confirm(`Issue a new key for ${drone.name}? The old key stops working immediately.`)) return;
    act(drone.id, async () => {
      const { apiKey, ...updated } = await uavService.rotateKey(drone.id);
      setIssuedKey({ drone: updated, apiKey });
    });
  };

  const handleAssign = (e: React.FormEvent) => {
    e.preventDefault();
    act('assign', async () => {
      const created = await uavService.assignRescuer(assignUser, assignDrone);
      setAssignments((prev) => [created, ...prev]);
      setAssignUser('');
      flash('ok', `${created.rescuerName} will now receive alerts from ${created.droneName}.`);
    });
  };

  const handleUnassign = (a: UavRescuerAssignment) =>
    act(a.id, async () => {
      await uavService.unassignRescuer(a.id);
      setAssignments((prev) => prev.filter((x) => x.id !== a.id));
    });

  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => flash('ok', 'Copied.'));

  const online = drones.filter((d) => d.isOnline).length;
  const count = (status: string) => detections.filter((d) => d.status === status).length;
  const shown = detections.filter((d) => statusFilter === 'All' || d.status === statusFilter);

  return (
    <PageLayout showAlertBanner={false}>
      <div className="cc-page-bg">
        <div className="cc-container">
          <div className="cc-header-row">
            <div>
              <h1 className="cc-title">UAV Monitor</h1>
              <p className="cc-subtitle">
                Drone patrols and on-board detections of stranded people · <span className="uav-live-dot" /> live, updated {lastSync ? timeAgo(lastSync.toISOString()) : '…'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="filter-chip-btn" onClick={() => navigate('/admin/command-center')}>← Command Center</button>
              <button className="btn-table-action btn-action-assign" onClick={() => setShowRegister(true)} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}>
                <Plus size={15} /> Register Drone
              </button>
            </div>
          </div>

          {notice && (
            <div role={notice.kind === 'error' ? 'alert' : 'status'} className={`uav-notice ${notice.kind === 'ok' ? 'ok' : 'error'}`}>
              {notice.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />} {notice.text}
            </div>
          )}
          {loadError && (
            <div role="alert" className="uav-notice error">
              Could not load UAV data: {loadError} <button className="filter-chip-btn" onClick={loadAll}>Retry</button>
            </div>
          )}

          {issuedKey && (
            <div className="uav-key-box" role="status">
              <div style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: 6 }}>
                <KeyRound size={16} /> API key for {issuedKey.drone.name} — shown only once, store it on the drone now
              </div>
              <div className="uav-key-row">
                <code>{issuedKey.apiKey}</code>
                <button className="filter-chip-btn" onClick={() => copy(issuedKey.apiKey)}><Copy size={12} /> Copy</button>
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                Try it with the simulator:{' '}
                <code>python scripts/simulate_drone.py --drone-id {issuedKey.drone.registrationId} --token {issuedKey.apiKey}</code>
              </div>
              <button className="filter-chip-btn" onClick={() => setIssuedKey(null)} style={{ alignSelf: 'flex-start' }}>I have saved it</button>
            </div>
          )}

          <div className="cc-top-stats-grid">
            <div className="cc-stat-card card-blue">
              <div className="cc-stat-info">
                <span className="cc-stat-label label-blue">DRONES ONLINE</span>
                <div className="cc-stat-value text-blue">{online}/{drones.length}</div>
                <div className="cc-stat-sub text-blue">Offline after 2 min without heartbeat</div>
              </div>
              <Radar size={24} className="icon-blue" />
            </div>
            <div className="cc-stat-card card-red" onClick={() => setStatusFilter('New')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-red">NEW DETECTIONS</span>
                <div className="cc-stat-value text-red">{count('New')}</div>
                <div className="cc-stat-sub text-red">Waiting for review</div>
              </div>
              <AlertTriangle size={24} className="icon-red" />
            </div>
            <div className="cc-stat-card card-green" onClick={() => setStatusFilter('Rescue Requested')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-green">RESCUE REQUESTS</span>
                <div className="cc-stat-value text-green">{count('Rescue Requested')}</div>
                <div className="cc-stat-sub text-green">Sent to the request queue</div>
              </div>
              <LifeBuoy size={24} className="icon-green" />
            </div>
            <div className="cc-stat-card card-purple">
              <div className="cc-stat-info">
                <span className="cc-stat-label label-purple">RESCUERS LINKED</span>
                <div className="cc-stat-value text-purple">{assignments.length}</div>
                <div className="cc-stat-sub text-purple">Volunteers receiving drone alerts</div>
              </div>
              <CheckCircle2 size={24} className="icon-purple" />
            </div>
          </div>

          <div className="uav-layout">
            {/* Detection feed */}
            <section className="cc-data-card uav-panel" aria-label="Detections">
              <div className="uav-panel-head">
                <h3>Detections</h3>
                <div className="filter-chips-group">
                  {['All', 'New', 'Acknowledged', 'Rescue Requested', 'Dismissed'].map((s) => (
                    <button key={s} className={`filter-chip-btn ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              {shown.length === 0 ? (
                <div className="uav-empty">
                  {detections.length === 0
                    ? 'No detections yet. They appear here within seconds of a drone sending one.'
                    : 'No detections with this status.'}
                </div>
              ) : (
                <div className="uav-feed">
                  {shown.map((d) => (
                    <article key={d.id} className={`uav-det-card status-${d.status.toLowerCase().replace(' ', '-')}`}>
                      <div className="uav-det-top">
                        <strong>{d.detectionType === 'human' ? '🧍 Person' : '🐄 Animal'} · {Math.round(d.confidence * 100)}% confidence</strong>
                        <span className="req-status-pill req-status-pending">{d.status}</span>
                      </div>
                      <div className="uav-det-meta">
                        {d.droneName} · {timeAgo(d.createdAt)} ·{' '}
                        <a href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`} target="_blank" rel="noreferrer">
                          <MapPin size={11} /> {d.latitude.toFixed(5)}, {d.longitude.toFixed(5)}
                        </a>
                        {d.imageUrl && <> · <a href={d.imageUrl} target="_blank" rel="noreferrer">snapshot</a></>}
                      </div>
                      {d.status !== 'Rescue Requested' && d.status !== 'Dismissed' && (
                        <div className="action-btns-group" style={{ marginTop: 8 }}>
                          {d.detectionType === 'human' && (
                            <button className="btn-table-action btn-action-assign" disabled={busyId === d.id} onClick={() => handleRescue(d)}>
                              <LifeBuoy size={12} /> Create rescue request
                            </button>
                          )}
                          {d.status === 'New' && (
                            <button className="btn-table-action btn-action-verify" disabled={busyId === d.id}
                              onClick={() => act(d.id, async () => replaceDetection(await uavService.acknowledge(d.id)))}>
                              <CheckCircle2 size={12} /> Acknowledge
                            </button>
                          )}
                          <button className="btn-table-action btn-action-resolve" disabled={busyId === d.id}
                            onClick={() => act(d.id, async () => replaceDetection(await uavService.dismiss(d.id)))}>
                            <Ban size={12} /> False alarm
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </section>

            <div className="uav-side">
              {/* Drones */}
              <section className="cc-data-card uav-panel" aria-label="Drones">
                <div className="uav-panel-head"><h3>Drones</h3></div>
                {drones.length === 0 && <div className="uav-empty">No drones registered yet.</div>}
                {drones.map((dr) => (
                  <div key={dr.id} className="uav-drone-row">
                    <div>
                      <div style={{ fontWeight: 600 }}>
                        <span className={`uav-status-dot ${dr.isOnline ? 'on' : 'off'}`} aria-hidden="true" /> {dr.name}
                        <span className="uav-muted"> · {dr.isOnline ? 'online' : 'offline'}</span>
                      </div>
                      <div className="uav-muted">
                        {dr.registrationId} · {dr.district || 'no district'} · last seen {timeAgo(dr.lastHeartbeat)}
                        {dr.batteryPct != null && <> · <BatteryMedium size={11} /> {Math.round(dr.batteryPct)}%</>}
                      </div>
                      {dr.streamUrl && (
                        <a href={dr.streamUrl} target="_blank" rel="noreferrer" className="uav-muted"><Video size={11} /> live video</a>
                      )}
                    </div>
                    <button className="filter-chip-btn" title="Issue a new API key" disabled={busyId === dr.id} onClick={() => handleRotate(dr)}>
                      <KeyRound size={12} />
                    </button>
                  </div>
                ))}
              </section>

              {/* Rescuer assignments */}
              <section className="cc-data-card uav-panel" aria-label="Rescuer assignments">
                <div className="uav-panel-head"><h3>Who gets each drone's alerts</h3></div>
                <form onSubmit={handleAssign} className="uav-assign-form">
                  <select className="form-input-field" value={assignUser} onChange={(e) => setAssignUser(e.target.value)} required aria-label="Volunteer">
                    <option value="">Volunteer…</option>
                    {volunteers.map((v) => (
                      <option key={v.id} value={v.id}>{v.first_name} {v.last_name}{v.district ? ` (${v.district})` : ''}</option>
                    ))}
                  </select>
                  <select className="form-input-field" value={assignDrone} onChange={(e) => setAssignDrone(e.target.value)} required aria-label="Drone">
                    <option value="">Drone…</option>
                    {drones.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                  <button className="btn-navy-primary" type="submit" disabled={busyId === 'assign'}>Assign</button>
                </form>
                {assignments.length === 0 && <div className="uav-empty">No volunteers linked to drones yet.</div>}
                {assignments.map((a) => (
                  <div key={a.id} className="uav-drone-row">
                    <span>{a.rescuerName} → <strong>{a.droneName}</strong></span>
                    <button className="filter-chip-btn" aria-label={`Remove ${a.rescuerName} from ${a.droneName}`} disabled={busyId === a.id} onClick={() => handleUnassign(a)}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </section>
            </div>
          </div>

          {/* Audit log */}
          <section className="cc-data-card" style={{ marginTop: 20 }} aria-label="Audit log">
            <div className="uav-panel-head" style={{ padding: '14px 16px 0' }}><h3>Audit log</h3></div>
            <div className="cc-table-wrapper">
              <table className="cc-interactive-table">
                <thead>
                  <tr><th>Time</th><th>Event</th><th>Details</th></tr>
                </thead>
                <tbody>
                  {logs.length === 0 && <tr><td colSpan={3} style={{ textAlign: 'center', padding: 20, color: '#64748b' }}>No activity yet.</td></tr>}
                  {logs.map((l) => (
                    <tr key={l.id}>
                      <td style={{ whiteSpace: 'nowrap', color: '#64748b' }}>{l.createdAt ? new Date(l.createdAt).toLocaleString() : ''}</td>
                      <td><code>{l.eventType}</code></td>
                      <td>{l.message}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Register drone modal */}
          {showRegister && (
            <div className="modal-backdrop" onClick={() => setShowRegister(false)}>
              <div className="modal-box animate-scale-up" role="dialog" aria-modal="true" aria-labelledby="register-title" onClick={(e) => e.stopPropagation()}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 id="register-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>Register a Drone</h3>
                  <button onClick={() => setShowRegister(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label className="uav-label">Name
                    <input className="form-input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tahirpur Scout 2" required autoFocus />
                  </label>
                  <label className="uav-label">Registration ID (printed on the drone)
                    <input className="form-input-field" value={form.registration_id} onChange={(e) => setForm({ ...form, registration_id: e.target.value })}
                      placeholder="e.g. SUN-UAV-02" pattern="[A-Za-z0-9_-]{3,100}" title="3+ letters, numbers, - or _" required />
                  </label>
                  <label className="uav-label">District
                    <input className="form-input-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Sunamganj" />
                  </label>
                  <label className="uav-label">Live video URL (optional)
                    <input className="form-input-field" value={form.stream_url} onChange={(e) => setForm({ ...form, stream_url: e.target.value })} placeholder="https://… or rtsp://…" />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                    <button type="button" className="btn-outline-subtle" onClick={() => setShowRegister(false)}>Cancel</button>
                    <button type="submit" className="btn-navy-primary" disabled={busyId === 'register'}>{busyId === 'register' ? 'Registering…' : 'Register'}</button>
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

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Radar, Plus, X, MapPin, CheckCircle2, AlertTriangle, BatteryMedium, KeyRound, Trash2, LifeBuoy, Ban, Copy, Video
} from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useFlash } from '../hooks/useFlash';
import { useVideoOverlay } from '../hooks/useVideoOverlay';
import { uavService } from '../services/uavService';
import { volunteerService } from '../services/volunteerService';
import { ApiError } from '../services/api';
import { UavDetection, UavDrone, UavLogEntry, UavRescuerAssignment, VolunteerDirectoryEntry } from '../types';
import { useLanguage } from '../context/LanguageContext';
import './CommandCenter.css';
import './UavMonitor.css';

const DETECTION_POLL_MS = 5_000;
const DRONE_POLL_MS = 15_000;

function errorText(err: unknown): string {
  return err instanceof ApiError ? err.message : 'Could not reach the Shohay server.';
}

/** Direct video files can be embedded; RTSP/live-page URLs can't play in a plain <video> tag. */
function isDirectVideoUrl(url?: string | null): boolean {
  return !!url && /\.(mp4|webm|ogg|mov)(\?|$)/i.test(url);
}

function formatVideoTime(seconds: number): string {
  const s = Math.floor(seconds);
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
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
  const { t } = useLanguage();
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

  // Live Feed panel: plays the selected drone's live stream if it's a direct video URL,
  // otherwise lets the presenter load a locally recorded demo video (for showing detection
  // footage before the model is hosted and a real stream exists). Always visible — doesn't
  // depend on any drone being registered.
  const [selectedFeedDroneId, setSelectedFeedDroneId] = useState('');
  const [demoVideoSrc, setDemoVideoSrc] = useState<string | null>(null);
  const demoFileRef = useRef<HTMLInputElement>(null);
  const feedSectionRef = useRef<HTMLDivElement>(null);
  const feedDrone = drones.find((d) => d.id === selectedFeedDroneId) || null;
  const feedVideoRef = useRef<HTMLVideoElement>(null);
  const feedSrc = isDirectVideoUrl(feedDrone?.streamUrl) ? feedDrone!.streamUrl! : demoVideoSrc;
  const overlay = useVideoOverlay(feedVideoRef, feedSrc);

  const handleDemoFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (demoVideoSrc) URL.revokeObjectURL(demoVideoSrc);
      setDemoVideoSrc(URL.createObjectURL(file));
    }
  };

  const jumpToFeed = (droneId: string) => {
    setSelectedFeedDroneId(droneId);
    feedSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

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

  const statusFilters = [
    { id: 'All', key: 'uavStatusAll' },
    { id: 'New', key: 'uavStatusNew' },
    { id: 'Acknowledged', key: 'uavStatusAcknowledged' },
    { id: 'Rescue Requested', key: 'uavStatusRescueRequested' },
    { id: 'Dismissed', key: 'uavStatusDismissed' }
  ];

  return (
    <PageLayout showAlertBanner={false}>
      <div className="cc-page-bg">
        <div className="cc-container">
          <div className="cc-header-row">
            <div>
              <h1 className="cc-title">{t('uavTitle')}</h1>
              <p className="cc-subtitle">
                {t('uavSubtitle')} · <span className="uav-live-dot" /> {t('uavLiveBadge')} {lastSync ? timeAgo(lastSync.toISOString()) : '…'}
              </p>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="filter-chip-btn" onClick={() => navigate('/admin/command-center')}>{t('uavBackToCommandCenter')}</button>
              <button className="btn-table-action btn-action-assign" onClick={() => setShowRegister(true)} style={{ padding: '8px 16px', fontSize: '13px', borderRadius: '6px' }}>
                <Plus size={15} /> {t('uavRegisterDroneBtn')}
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
                <span className="cc-stat-label label-blue">{t('uavDronesOnlineStat')}</span>
                <div className="cc-stat-value text-blue">{online}/{drones.length}</div>
                <div className="cc-stat-sub text-blue">{t('uavDronesOfflineSub')}</div>
              </div>
              <Radar size={24} className="icon-blue" />
            </div>
            <div className="cc-stat-card card-red" onClick={() => setStatusFilter('New')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-red">{t('uavNewDetectionsStat')}</span>
                <div className="cc-stat-value text-red">{count('New')}</div>
                <div className="cc-stat-sub text-red">{t('uavWaitingReviewSub')}</div>
              </div>
              <AlertTriangle size={24} className="icon-red" />
            </div>
            <div className="cc-stat-card card-green" onClick={() => setStatusFilter('Rescue Requested')} style={{ cursor: 'pointer' }}>
              <div className="cc-stat-info">
                <span className="cc-stat-label label-green">{t('uavRescueRequestsStat')}</span>
                <div className="cc-stat-value text-green">{count('Rescue Requested')}</div>
                <div className="cc-stat-sub text-green">{t('uavSentToQueueSub')}</div>
              </div>
              <LifeBuoy size={24} className="icon-green" />
            </div>
            <div className="cc-stat-card card-purple">
              <div className="cc-stat-info">
                <span className="cc-stat-label label-purple">{t('uavRescuersLinkedStat')}</span>
                <div className="cc-stat-value text-purple">{assignments.length}</div>
                <div className="cc-stat-sub text-purple">{t('uavVolunteersAlertedSub')}</div>
              </div>
              <CheckCircle2 size={24} className="icon-purple" />
            </div>
          </div>

          {/* Live Feed — always visible, doesn't need a drone registered to demo footage */}
          <section className="cc-data-card uav-panel" aria-label="Live Feed" style={{ marginBottom: 20 }} ref={feedSectionRef}>
            <div className="uav-panel-head">
              <h3>{t('uavLiveFeedTitle')}</h3>
              {drones.length > 0 && (
                <select
                  className="form-input-field"
                  style={{ maxWidth: 240 }}
                  value={selectedFeedDroneId}
                  onChange={(e) => setSelectedFeedDroneId(e.target.value)}
                  aria-label="Choose drone feed"
                >
                  <option value="">{t('uavDemoPlaybackOption')}</option>
                  {drones.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              )}
            </div>

            {isDirectVideoUrl(feedDrone?.streamUrl) ? (
              <video ref={feedVideoRef} key={feedDrone!.streamUrl} src={feedDrone!.streamUrl!} controls autoPlay style={{ width: '100%', maxHeight: 420, borderRadius: 8, background: '#000', display: 'block' }} />
            ) : demoVideoSrc ? (
              <video ref={feedVideoRef} key={demoVideoSrc} src={demoVideoSrc} controls autoPlay style={{ width: '100%', maxHeight: 420, borderRadius: 8, background: '#000', display: 'block' }} />
            ) : (
              <div style={{ border: '2px dashed #cbd5e1', borderRadius: 8, padding: '32px 20px', textAlign: 'center', color: '#64748b' }}>
                <Video size={28} style={{ margin: '0 auto 10px', display: 'block' }} />
                <p style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600, color: '#334155' }}>
                  {feedDrone ? `No usable video URL for ${feedDrone.name} yet.` : 'No drone selected — nothing streaming yet.'}
                </p>
                <p style={{ margin: '0 0 14px', fontSize: 12 }}>
                  Play a recorded detection demo instead — showing risk level and person count from a past flight.
                </p>
                <button type="button" className="btn-navy-primary" onClick={() => demoFileRef.current?.click()}>{t('uavChooseRecordedVideo')}</button>
                <input ref={demoFileRef} type="file" accept="video/*" onChange={handleDemoFile} style={{ display: 'none' }} />
              </div>
            )}

            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 12, marginBottom: 0, lineHeight: 1.45 }}>
              Placeholder for the live feed. Once the detection model is hosted on the drone or a base
              station, this panel will play that drone's registered stream URL automatically instead of a
              recorded file.
            </p>
          </section>

          <div className="uav-layout">
            {/* Detection feed */}
            <section className="cc-data-card uav-panel" aria-label="Detections">
              <div className="uav-panel-head">
                <h3>{t('uavDetectionsTitle')}</h3>
                <div className="filter-chips-group">
                  {statusFilters.map((s) => (
                    <button key={s.id} className={`filter-chip-btn ${statusFilter === s.id ? 'active' : ''}`} onClick={() => setStatusFilter(s.id)}>
                      {t(s.key)}
                    </button>
                  ))}
                </div>
              </div>

              {feedSrc && (
                <div className="uav-video-analysis" aria-live="polite">
                  <div className="uav-video-analysis-head">
                    <strong><Video size={13} /> From the live feed video</strong>
                    <span className="uav-muted">
                      {overlay.status === 'loading' && 'Loading text reader…'}
                      {overlay.status === 'reading' && 'Reading overlay every second'}
                      {overlay.status === 'error' && 'Could not read this video'}
                      {overlay.status === 'idle' && 'Play the video to read its overlay'}
                    </span>
                  </div>
                  {overlay.latest && (
                    <div className="uav-video-stats">
                      <div className={`uav-video-stat risk-${(overlay.latest.risk || 'unknown').toLowerCase()}`}>
                        <span>{t('uavRiskLabel')}</span><b>{overlay.latest.risk ?? '—'}</b>
                      </div>
                      <div className="uav-video-stat"><span>{t('uavRescuersNeededLabel')}</span><b>{overlay.latest.rescuersNeeded ?? '—'}</b></div>
                      <div className="uav-video-stat"><span>{t('uavAlreadyPresentLabel')}</span><b>{overlay.latest.alreadyPresent ?? '—'}</b></div>
                      <div className="uav-video-stat"><span>{t('uavDispatchCountLabel')}</span><b>{overlay.latest.dispatchCount ?? '—'}</b></div>
                    </div>
                  )}
                  {overlay.history.length > 0 && (
                    <div className="uav-feed" style={{ maxHeight: 220, marginTop: 10 }}>
                      {overlay.history.map((r) => (
                        <article key={r.readAt} className={`uav-det-card risk-${(r.risk || 'unknown').toLowerCase()}`}>
                          <div className="uav-det-top">
                            <strong>{r.risk ?? 'Unknown'} risk · {r.rescuersNeeded ?? '—'} rescuers needed</strong>
                            <span className="uav-muted">at {formatVideoTime(r.videoTime)}</span>
                          </div>
                          <div className="uav-det-meta">
                            Already present {r.alreadyPresent ?? '—'} · Dispatch count {r.dispatchCount ?? '—'}
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {shown.length === 0 ? (
                !feedSrc && <div className="uav-empty">
                  {detections.length === 0
                    ? 'No detections yet. They appear here within seconds of a drone sending one.'
                    : 'No detections with this status.'}
                </div>
              ) : (
                <div className="uav-feed">
                  {shown.map((d) => (
                    <article key={d.id} className={`uav-det-card status-${d.status.toLowerCase().replace(' ', '-')}`}>
                      <div className="uav-det-top">
                        <strong>{d.detectionType === 'human' ? `🧍 ${t('uavPersonLabel')}` : `🐄 ${t('uavAnimalLabel')}`} · {Math.round(d.confidence * 100)}% {t('uavConfidenceLabel')}</strong>
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
                              <LifeBuoy size={12} /> {t('uavCreateRescueReqBtn')}
                            </button>
                          )}
                          {d.status === 'New' && (
                            <button className="btn-table-action btn-action-verify" disabled={busyId === d.id}
                              onClick={() => act(d.id, async () => replaceDetection(await uavService.acknowledge(d.id)))}>
                              <CheckCircle2 size={12} /> {t('uavAcknowledgeBtn')}
                            </button>
                          )}
                          <button className="btn-table-action btn-action-resolve" disabled={busyId === d.id}
                            onClick={() => act(d.id, async () => replaceDetection(await uavService.dismiss(d.id)))}>
                            <Ban size={12} /> {t('uavFalseAlarmBtn')}
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
                <div className="uav-panel-head"><h3>{t('uavDronesPanelTitle')}</h3></div>
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
                    </div>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="filter-chip-btn" title="View drone feed" onClick={() => jumpToFeed(dr.id)}>
                        <Video size={12} /> Feed
                      </button>
                      <button className="filter-chip-btn" title="Issue a new API key" disabled={busyId === dr.id} onClick={() => handleRotate(dr)}>
                        <KeyRound size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </section>

              {/* Rescuer assignments */}
              <section className="cc-data-card uav-panel" aria-label="Rescuer assignments">
                <div className="uav-panel-head"><h3>{t('uavRescuerAssignmentsTitle')}</h3></div>
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
                  <button className="btn-navy-primary" type="submit" disabled={busyId === 'assign'}>{t('uavAssignBtn')}</button>
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
            <div className="uav-panel-head" style={{ padding: '14px 16px 0' }}><h3>{t('uavAuditLogTitle')}</h3></div>
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
                  <h3 id="register-title" style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#0f172a' }}>{t('uavRegisterModalTitle')}</h3>
                  <button onClick={() => setShowRegister(false)} aria-label="Close" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}><X size={20} /></button>
                </div>
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <label className="uav-label">{t('uavNameLabel')}
                    <input className="form-input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Tahirpur Scout 2" required autoFocus />
                  </label>
                  <label className="uav-label">{t('uavRegIdLabel')}
                    <input className="form-input-field" value={form.registration_id} onChange={(e) => setForm({ ...form, registration_id: e.target.value })}
                      placeholder="e.g. SUN-UAV-02" pattern="[A-Za-z0-9_-]{3,100}" title="3+ letters, numbers, - or _" required />
                  </label>
                  <label className="uav-label">{t('uavDistrictLabel')}
                    <input className="form-input-field" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} placeholder="e.g. Sunamganj" />
                  </label>
                  <label className="uav-label">{t('uavLiveUrlLabel')}
                    <input className="form-input-field" value={form.stream_url} onChange={(e) => setForm({ ...form, stream_url: e.target.value })} placeholder="https://… or rtsp://…" />
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 6 }}>
                    <button type="button" className="btn-outline-subtle" onClick={() => setShowRegister(false)}>{t('uavCancelBtn')}</button>
                    <button type="submit" className="btn-navy-primary" disabled={busyId === 'register'}>{busyId === 'register' ? '...' : t('uavRegisterSubmitBtn')}</button>
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

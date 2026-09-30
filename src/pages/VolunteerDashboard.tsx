import React, { useState, useEffect, useCallback } from 'react';
import { CheckCircle2, Pause, Play, CheckCheck, AlertCircle, Loader2, Undo2, Radar, MapPin } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { useFlash } from '../hooks/useFlash';
import { volunteerService, DutyAction } from '../services/volunteerService';
import { uavService } from '../services/uavService';
import { ApiError, errorText } from '../services/api';
import { VolunteerProfile, VolunteerAssignment, UavDetection, UavDrone } from '../types';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import './VolunteerDashboard.css';

const DRONE_POLL_MS = 10_000;

function minutesSince(iso?: string | null): number {
  return iso ? Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 60000)) : 0;
}

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [drones, setDrones] = useState<UavDrone[]>([]);
  const [detections, setDetections] = useState<UavDetection[]>([]);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null); // which action is running
  const { notice, flash } = useFlash();
  const [, setTick] = useState(0); // re-render every minute for the on-duty timer

  const loadAll = useCallback(async () => {
    try {
      const [p, open, myDrones] = await Promise.all([
        volunteerService.getProfile(),
        volunteerService.getOpenAssignments(),
        uavService.getDrones().catch(() => [] as UavDrone[])
      ]);
      setProfile(p);
      setAssignments(open);
      setDrones(myDrones);
      setLoadError(null);
    } catch (err) {
      setLoadError(errorText(err));
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  useEffect(() => {
    const t = setInterval(() => setTick((n) => n + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  // Drone alerts for volunteers assigned to a drone (polling works on serverless hosting)
  useEffect(() => {
    if (drones.length === 0) return;
    const poll = () => uavService.getDetections({ limit: 10 }).then(setDetections).catch(() => undefined);
    poll();
    const t = setInterval(poll, DRONE_POLL_MS);
    return () => clearInterval(t);
  }, [drones.length]);

  const run = async (label: string, action: () => Promise<void>) => {
    setBusy(label);
    try {
      await action();
    } catch (err) {
      flash('error', errorText(err));
      // 409 means someone else changed the task list; show the current state
      if (err instanceof ApiError && err.status === 409) await loadAll();
    } finally {
      setBusy(null);
    }
  };

  const handleDuty = (status: DutyAction, message: string) =>
    run(status, async () => {
      const updated = await volunteerService.setDuty(status);
      setProfile(updated);
      flash('ok', message);
      if (status === 'Completed') setAssignments(await volunteerService.getOpenAssignments());
    });

  const handleAccept = (task: VolunteerAssignment) =>
    run(`accept-${task.id}`, async () => {
      await volunteerService.acceptAssignment(task.id);
      await loadAll();
      flash('ok', `Accepted "${task.title}". Check in when you start.`);
    });

  const handleDecline = (task: VolunteerAssignment) =>
    run(`decline-${task.id}`, async () => {
      setProfile(await volunteerService.declineAssignment(task.id));
      setAssignments((prev) => prev.filter((a) => a.id !== task.id));
      flash('ok', 'Task hidden from your list.');
    });

  const handleDrop = (task: VolunteerAssignment) =>
    run('drop', async () => {
      if (!window.confirm(`Hand "${task.title}" back so another volunteer can take it?`)) return;
      setProfile(await volunteerService.declineAssignment(task.id));
      flash('ok', 'Task handed back to other volunteers.');
    });

  const handleAvailability = () => {
    if (!profile) return;
    const previousState = profile.isAvailable;
    const nextState = !previousState;

    // 1. Instant optimistic update (0ms latency UI response)
    setProfile((prev) => (prev ? { ...prev, isAvailable: nextState } : prev));

    // 2. Background sync
    run('availability', async () => {
      try {
        const updated = await volunteerService.setAvailability(nextState);
        setProfile(updated);
      } catch (err) {
        // Revert on failure
        setProfile((prev) => (prev ? { ...prev, isAvailable: previousState } : prev));
        throw err;
      }
    });
  };

  const handleAcknowledge = (det: UavDetection) =>
    run(`ack-${det.id}`, async () => {
      const updated = await uavService.acknowledge(det.id);
      setDetections((prev) => prev.map((d) => (d.id === det.id ? updated : d)));
      flash('ok', 'Coordinators can see that you are responding.');
    });

  if (!profile) {
    return (
      <PageLayout showAlertBanner={false}>
        <div className="vol-dashboard-bg">
          <div className="vol-dashboard-container" style={{ textAlign: 'center', padding: '48px 16px', color: '#475569' }}>
            {loadError ? (
              <>
                <AlertCircle size={28} style={{ margin: '0 auto 8px', color: '#dc2626' }} />
                <p>{loadError}</p>
                <button className="btn-accept-green" onClick={loadAll} style={{ marginTop: 12 }}>Try again</button>
              </>
            ) : (
              <Loader2 size={28} className="animate-spin" style={{ margin: '0 auto' }} />
            )}
          </div>
        </div>
      </PageLayout>
    );
  }

  const task = profile.currentAssignment;
  const onDuty = profile.dutyStatus === 'On Duty';
  const minutesOnDuty = onDuty ? minutesSince(profile.checkedInAt) : 0;
  const displayName = user?.name || profile.name;
  const initials = displayName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'VOL';
  const newAlerts = detections.filter((d) => d.status === 'New').length;

  return (
    <PageLayout showAlertBanner={false}>
      <div className="vol-dashboard-bg">
        <div className="vol-dashboard-container">
          {notice && (
            <div
              role={notice.kind === 'error' ? 'alert' : 'status'}
              style={{
                padding: '10px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: 600, marginBottom: '16px',
                display: 'flex', alignItems: 'center', gap: '8px',
                background: notice.kind === 'ok' ? '#ecfdf5' : '#fef2f2',
                border: `1px solid ${notice.kind === 'ok' ? '#a7f3d0' : '#fecaca'}`,
                color: notice.kind === 'ok' ? '#065f46' : '#991b1b'
              }}
            >
              {notice.kind === 'ok' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
              <span>{notice.text}</span>
            </div>
          )}

          {/* Profile Card */}
          <div className="vol-profile-card">
            <div className="profile-top-row">
              <div className="profile-user-left">
                <div className="avatar-square-navy">{initials}</div>
                <div className="user-details">
                  <h3 className="vol-user-name">{displayName}</h3>
                  <div className="vol-user-id">{profile.code} • {profile.district}</div>
                  <div className="vol-joined-date">{t('volJoinedLabel')} {profile.joinDate}</div>
                </div>
              </div>

              <button
                type="button"
                className="profile-status-right"
                onClick={handleAvailability}
                aria-label="Toggle availability for new tasks"
                style={{ cursor: 'pointer', background: 'none', border: 'none' }}
              >
                <span
                  className={profile.isAvailable ? 'badge-available' : 'badge-in-progress'}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: profile.isAvailable ? '#ecfdf5' : '#fef3c7',
                    color: profile.isAvailable ? '#065f46' : '#92400e',
                    border: profile.isAvailable ? '1px solid #10b981' : '1px solid #f59e0b',
                    transition: 'all 0.15s ease-in-out'
                  }}
                >
                  {busy === 'availability' && <Loader2 size={12} className="animate-spin" />}
                  {profile.isAvailable ? '● Available' : '○ On Break'}
                </span>
                <span className="toggle-hint">{t('volTapToToggle')}</span>
              </button>
            </div>

            <div className="profile-counters-row">
              <div className="counter-col">
                <div className="counter-num">{(profile.hoursLogged + minutesOnDuty / 60).toFixed(1)}</div>
                <div className="counter-lbl">{t('volHoursLabel')}</div>
              </div>
              <div className="counter-col">
                <div className="counter-num">{profile.tasksCompleted}</div>
                <div className="counter-lbl">{t('volTasksLabel')}</div>
              </div>
              <div className="counter-col">
                <div className="counter-num">{profile.rating ? profile.rating.toFixed(1) : '—'}</div>
                <div className="counter-lbl">{t('volRatingLabel')}</div>
              </div>
            </div>
          </div>

          {/* Current Active Assignment Box */}
          {task ? (
            <div className="current-assignment-navy-card">
              <div className="assign-header-row">
                <span className="assign-header-tag">{t('volCurrentAssignmentTitle')}</span>
                <span className="badge-in-progress" style={{ background: onDuty ? '#10b981' : undefined, color: onDuty ? '#ffffff' : undefined }}>
                  {onDuty ? `On duty · ${minutesOnDuty} min` : profile.dutyStatus === 'Paused' ? 'Duty Paused' : 'Accepted (check in to start)'}
                </span>
              </div>

              <h3 className="assign-main-title">{task.title}</h3>
              <div className="assign-meta-row">
                <span>⏱ {task.durationHours} hours estimated</span>
                <span>📍 {task.location || profile.district}</span>
                <span>👥 {t('volTeamOf')} {task.teamSize}</span>
              </div>

              <div className="assign-button-group">
                <button
                  className={`btn-checkin ${onDuty ? 'active' : ''}`}
                  disabled={busy !== null}
                  onClick={() => (onDuty
                    ? handleDuty('Paused', 'Duty paused. Your hours so far are saved.')
                    : handleDuty('Checked In', 'Checked in. The duty clock is running.'))}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {onDuty ? <Pause size={14} /> : <Play size={14} />}
                  <span>{onDuty ? 'Pause Duty' : profile.dutyStatus === 'Paused' ? 'Resume Duty' : t('volCheckInBtn')}</span>
                </button>

                <button
                  className="btn-secondary-dark"
                  disabled={busy !== null}
                  onClick={() => handleDuty('Completed', `"${task.title}" completed. Thank you!`)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#065f46', borderColor: '#10b981', color: '#ecfdf5' }}
                >
                  {busy === 'Completed' ? <Loader2 size={14} className="animate-spin" /> : <CheckCheck size={14} />}
                  <span>Mark Complete</span>
                </button>

                <button
                  className="btn-secondary-dark"
                  disabled={busy !== null}
                  onClick={() => handleDrop(task)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Undo2 size={14} />
                  <span>Can't do it</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>
              <AlertCircle size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>No Active Assignment</div>
              <div style={{ fontSize: '13px' }}>Accept an open task below, or wait for the Command Center to dispatch one.</div>
            </div>
          )}

          {/* Drone alerts (only for volunteers assigned to a UAV) */}
          {drones.length > 0 && (
            <div className="skills-card">
              <h4 className="skills-title" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Radar size={15} /> Drone Alerts {newAlerts > 0 && <span className="priority-tag priority-critical">{newAlerts} new</span>}
              </h4>
              <div style={{ fontSize: 12, color: '#64748b', marginBottom: 10 }}>
                Following: {drones.map((d) => `${d.name} (${d.isOnline ? 'online' : 'offline'})`).join(', ')}
              </div>
              {detections.length === 0 ? (
                <div style={{ fontSize: 13, color: '#64748b' }}>No detections yet. New ones appear here automatically.</div>
              ) : (
                <div className="open-cards-stack">
                  {detections.map((d) => (
                    <div key={d.id} className="open-item-card">
                      <div className="open-item-top">
                        <div className="open-item-left">
                          <h3 className="open-item-title">
                            {d.detectionType === 'human' ? 'Person spotted' : 'Animal spotted'} · {Math.round(d.confidence * 100)}%
                          </h3>
                          <div className="open-item-meta">
                            {d.droneName} · {d.createdAt ? new Date(d.createdAt).toLocaleTimeString() : ''} ·{' '}
                            <a href={`https://www.google.com/maps?q=${d.latitude},${d.longitude}`} target="_blank" rel="noreferrer">
                              <MapPin size={11} /> {d.latitude.toFixed(4)}, {d.longitude.toFixed(4)}
                            </a>
                          </div>
                        </div>
                        <span className={`priority-tag ${d.status === 'New' ? 'priority-critical' : 'priority-medium'}`}>{d.status}</span>
                      </div>
                      {d.status === 'New' && (
                        <div className="open-item-bottom-actions">
                          <button className="btn-accept-green" disabled={busy !== null} onClick={() => handleAcknowledge(d)}>
                            I'm responding
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* My Skills */}
          <div className="skills-card">
            <h4 className="skills-title">{t('volMySkillsTitle')}</h4>
            <div className="skills-chips-row">
              {profile.skills.length === 0 && <span style={{ fontSize: 13, color: '#64748b' }}>No skills added yet.</span>}
              {profile.skills.map((skill) => (
                <span key={skill} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>

          {/* Open Assignments */}
          <div className="open-assignments-section">
            <h2 className="open-section-title">{t('volOpenAssignmentsTitle')} ({assignments.length})</h2>

            {assignments.length === 0 ? (
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                No open tasks right now. New tasks appear here when the Command Center dispatches them.
              </div>
            ) : (
              <div className="open-cards-stack">
                {assignments.map((item) => (
                  <div key={item.id} className="open-item-card">
                    <div className="open-item-top">
                      <div className="open-item-left">
                        <h3 className="open-item-title">{item.title}</h3>
                        <div className="open-item-meta">
                          ⏱ {item.durationHours} {t('volHoursLabel')} &nbsp;•&nbsp; 📍 {item.location}, {item.district} &nbsp;•&nbsp; 👥 {t('volTeamOf')} {item.teamSize}
                          {item.requestId && <> &nbsp;•&nbsp; citizen request</>}
                        </div>
                      </div>

                      <span className={`priority-tag priority-${item.priority}`}>
                        {item.priority}
                      </span>
                    </div>

                    <div className="open-item-bottom-actions">
                      <button
                        className="btn-accept-green"
                        disabled={busy !== null || !!task}
                        title={task ? 'Finish your current task first' : undefined}
                        onClick={() => handleAccept(item)}
                      >
                        {busy === `accept-${item.id}` ? 'Accepting…' : t('volAcceptBtn')}
                      </button>
                      <button className="btn-decline-outline" disabled={busy !== null} onClick={() => handleDecline(item)}>
                        {t('volDeclineBtn')}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

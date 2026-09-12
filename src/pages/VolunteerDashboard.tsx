import React, { useState, useEffect } from 'react';
import { ChevronRight, CheckCircle2, Pause, Play, CheckCheck, AlertCircle } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { volunteerService } from '../services/volunteerService';
import { VolunteerProfile, VolunteerAssignment } from '../types';
import { useAuth } from '../context/AuthContext';
import { MOCK_VOLUNTEER_PROFILE, MOCK_VOLUNTEER_ASSIGNMENTS } from '../data/volunteers';
import './VolunteerDashboard.css';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();

  // Optimistic initial state derived from auth user so the dashboard renders INSTANTLY (0ms latency, zero black screen)
  const [profile, setProfile] = useState<VolunteerProfile>(() => {
    const base = MOCK_VOLUNTEER_PROFILE;
    const name = user?.name || base.name;
    return {
      ...base,
      id: user?.id || base.id,
      name,
      code: user?.id ? user.id.toUpperCase() : base.code
    };
  });

  const [assignments, setAssignments] = useState<VolunteerAssignment[]>(() => MOCK_VOLUNTEER_ASSIGNMENTS);
  const [checkInStatus, setCheckInStatus] = useState<'Not Checked In' | 'Checked In' | 'Paused'>('Not Checked In');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const p = await volunteerService.getProfile();
      if (p) {
        setProfile((prev) => ({
          ...p,
          name: user?.name || p.name,
          id: user?.id || p.id,
          code: user?.id ? user.id.toUpperCase() : p.code
        }));
      }
      const openList = await volunteerService.getOpenAssignments();
      if (openList && openList.length > 0) {
        setAssignments(openList);
      }
    } catch (err) {
      console.warn('Background sync failed:', err);
    }
  };

  const handleCheckInToggle = async () => {
    if (checkInStatus === 'Checked In') {
      setCheckInStatus('Paused');
      setNotification('Duty paused. Take a rest or resume when ready.');
      await volunteerService.checkIn('Paused', 0);
    } else {
      setCheckInStatus('Checked In');
      setProfile((prev) => ({
        ...prev,
        hoursLogged: prev.hoursLogged + 1,
        isAvailable: true
      }));
      setNotification('Checked In successfully! You are now active on duty.');
      await volunteerService.checkIn('Checked In', 1);
    }
    setTimeout(() => setNotification(null), 4000);
  };

  const handleCompleteTask = async () => {
    if (!profile.currentAssignment) return;
    const currentTask = profile.currentAssignment;
    const addedHours = currentTask.durationHours || 2;

    setProfile((prev) => ({
      ...prev,
      tasksCompleted: prev.tasksCompleted + 1,
      hoursLogged: prev.hoursLogged + addedHours,
      currentAssignment: undefined
    }));
    setCheckInStatus('Not Checked In');
    setNotification(`✓ Assignment "${currentTask.title}" marked complete! ${addedHours} hours added.`);
    await volunteerService.checkIn('Completed', addedHours);
    setTimeout(() => setNotification(null), 5000);
  };

  const handleAccept = async (id: string) => {
    const selectedTask = assignments.find((a) => a.id === id);
    await volunteerService.acceptAssignment(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));

    if (selectedTask) {
      setProfile((prev) => ({
        ...prev,
        currentAssignment: { ...selectedTask, status: 'In Progress' }
      }));
      setCheckInStatus('Not Checked In');
      setNotification(`Accepted assignment: "${selectedTask.title}". You can now Check In.`);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  const handleDecline = async (id: string) => {
    await volunteerService.declineAssignment(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    setNotification('Assignment declined.');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleAvailability = () => {
    setProfile((prev) => ({
      ...prev,
      isAvailable: !prev.isAvailable
    }));
  };

  const displayName = user?.name || profile.name;
  const initials = displayName.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase() || 'VOL';

  return (
    <PageLayout showAlertBanner={false}>
      <div className="vol-dashboard-bg">
        <div className="vol-dashboard-container">
          {notification && (
            <div style={{ padding: '10px 16px', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', color: '#065f46', fontSize: '13px', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px', animation: 'fadeIn 0.2s ease-in' }}>
              <CheckCircle2 size={16} style={{ color: '#059669' }} />
              <span>{notification}</span>
            </div>
          )}

          {/* Profile Card */}
          <div className="vol-profile-card">
            <div className="profile-top-row">
              <div className="profile-user-left">
                <div className="avatar-square-navy">{initials}</div>
                <div className="user-details">
                  <h3 className="vol-user-name">{displayName}</h3>
                  <div className="vol-user-id">ID: {user?.id || profile.code} • {profile.district}</div>
                  <div className="vol-joined-date">Joined: {profile.joinDate}</div>
                </div>
              </div>

              <div className="profile-status-right" onClick={handleToggleAvailability} style={{ cursor: 'pointer' }}>
                <span className={profile.isAvailable ? 'badge-available' : 'badge-in-progress'} style={{ background: profile.isAvailable ? '#ecfdf5' : '#fef3c7', color: profile.isAvailable ? '#065f46' : '#92400e', border: profile.isAvailable ? '1px solid #10b981' : '1px solid #f59e0b' }}>
                  {profile.isAvailable ? '● Available' : '○ On Break'}
                </span>
                <span className="toggle-hint">Tap to toggle</span>
              </div>
            </div>

            <div className="profile-counters-row">
              <div className="counter-col">
                <div className="counter-num">{profile.hoursLogged}</div>
                <div className="counter-lbl">Hours</div>
              </div>
              <div className="counter-col">
                <div className="counter-num">{profile.tasksCompleted}</div>
                <div className="counter-lbl">Tasks</div>
              </div>
              <div className="counter-col">
                <div className="counter-num">{profile.rating}</div>
                <div className="counter-lbl">Rating</div>
              </div>
            </div>
          </div>

          {/* Current Active Assignment Box */}
          {profile.currentAssignment ? (
            <div className="current-assignment-navy-card">
              <div className="assign-header-row">
                <span className="assign-header-tag">Current Assignment</span>
                <span className="badge-in-progress" style={{ background: checkInStatus === 'Checked In' ? '#10b981' : undefined, color: checkInStatus === 'Checked In' ? '#ffffff' : undefined }}>
                  {checkInStatus === 'Checked In' ? 'Active On Duty' : checkInStatus === 'Paused' ? 'Duty Paused' : 'Assigned (Pending Check-In)'}
                </span>
              </div>

              <h3 className="assign-main-title">{profile.currentAssignment.title}</h3>
              <div className="assign-meta-row">
                <span>⏱ {profile.currentAssignment.durationHours} hours estimated</span>
                <span>📍 {profile.currentAssignment.location || profile.district}</span>
                <span>👥 Team of {profile.currentAssignment.teamSize}</span>
              </div>

              <div className="assign-button-group">
                <button
                  className={`btn-checkin ${checkInStatus === 'Checked In' ? 'active' : ''}`}
                  onClick={handleCheckInToggle}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  {checkInStatus === 'Checked In' ? (
                    <>
                      <Pause size={14} />
                      <span>Pause Duty</span>
                    </>
                  ) : checkInStatus === 'Paused' ? (
                    <>
                      <Play size={14} />
                      <span>Resume Duty</span>
                    </>
                  ) : (
                    <>
                      <Play size={14} />
                      <span>Check In (Start Duty)</span>
                    </>
                  )}
                </button>

                <button
                  className="btn-secondary-dark"
                  onClick={handleCompleteTask}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#065f46', borderColor: '#10b981', color: '#ecfdf5' }}
                >
                  <CheckCheck size={14} />
                  <span>Mark Complete</span>
                </button>
              </div>
            </div>
          ) : (
            <div style={{ background: '#f8fafc', border: '1px dashed #cbd5e1', borderRadius: '12px', padding: '24px', textAlign: 'center', color: '#64748b', marginBottom: '24px' }}>
              <AlertCircle size={28} style={{ margin: '0 auto 8px', color: '#94a3b8' }} />
              <div style={{ fontWeight: 600, color: '#334155', marginBottom: '4px' }}>No Active Assignment</div>
              <div style={{ fontSize: '13px' }}>Select an open assignment below or wait for coordinator dispatch.</div>
            </div>
          )}

          {/* My Skills */}
          <div className="skills-card">
            <h4 className="skills-title">My Skills</h4>
            <div className="skills-chips-row">
              {profile.skills.map((skill) => (
                <span key={skill} className="skill-chip">{skill}</span>
              ))}
            </div>
          </div>

          {/* Open Assignments Near You */}
          <div className="open-assignments-section">
            <h2 className="open-section-title">Open Assignments Near You ({assignments.length})</h2>

            {assignments.length === 0 ? (
              <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '24px', textAlign: 'center', color: '#64748b', fontSize: '13px' }}>
                All nearby assignments are currently fulfilled. New tasks will appear when dispatched by the Command Center.
              </div>
            ) : (
              <div className="open-cards-stack">
                {assignments.map((item) => (
                  <div key={item.id} className="open-item-card">
                    <div className="open-item-top">
                      <div className="open-item-left">
                        <h3 className="open-item-title">{item.title}</h3>
                        <div className="open-item-meta">
                          ⏱ {item.durationHours} hours &nbsp;•&nbsp; 📍 {item.location} &nbsp;•&nbsp; 👥 Team of {item.teamSize}
                        </div>
                      </div>

                      <span className={`priority-tag priority-${item.priority}`}>
                        {item.priority}
                      </span>
                    </div>

                    <div className="open-item-bottom-actions">
                      <button className="btn-accept-green" onClick={() => handleAccept(item.id)}>
                        Accept Task
                      </button>
                      <button className="btn-decline-outline" onClick={() => handleDecline(item.id)}>
                        Decline
                      </button>
                      <button className="btn-arrow-icon" onClick={() => handleAccept(item.id)}>
                        <ChevronRight size={16} />
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

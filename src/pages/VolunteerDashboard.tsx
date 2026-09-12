import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { volunteerService } from '../services/volunteerService';
import { VolunteerProfile, VolunteerAssignment } from '../types';
import { useAuth } from '../context/AuthContext';
import './VolunteerDashboard.css';

export const VolunteerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<VolunteerProfile | null>(null);
  const [assignments, setAssignments] = useState<VolunteerAssignment[]>([]);
  const [checkInStatus, setCheckInStatus] = useState<string>('Not Checked In');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const p = await volunteerService.getProfile();
    setProfile(p);

    const openList = await volunteerService.getOpenAssignments();
    setAssignments(openList);
  };

  const handleAccept = async (id: string) => {
    await volunteerService.acceptAssignment(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleDecline = async (id: string) => {
    await volunteerService.declineAssignment(id);
    setAssignments((prev) => prev.filter((a) => a.id !== id));
  };

  if (!profile) return null;

  const displayName = user?.name || profile.name;
  const initials = displayName.split(' ').filter(Boolean).map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'VOL';

  return (
    <PageLayout showAlertBanner={false}>
      <div className="vol-dashboard-bg">
        <div className="vol-dashboard-container">
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

              <div className="profile-status-right">
                <span className="badge-available">Available</span>
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

          {/* Current Active Assignment Box (Dark Navy) */}
          {profile.currentAssignment && (
            <div className="current-assignment-navy-card">
              <div className="assign-header-row">
                <span className="assign-header-tag">Current Assignment</span>
                <span className="badge-in-progress">In Progress</span>
              </div>

              <h3 className="assign-main-title">{profile.currentAssignment.title}</h3>
              <div className="assign-meta-row">
                <span>⏱ {profile.currentAssignment.durationHours} hours remaining</span>
                <span>👥 Team of {profile.currentAssignment.teamSize}</span>
              </div>

              <div className="assign-button-group">
                <button
                  className={`btn-checkin ${checkInStatus === 'Checked In' ? 'active' : ''}`}
                  onClick={() => setCheckInStatus(checkInStatus === 'Checked In' ? 'Not Checked In' : 'Checked In')}
                >
                  {checkInStatus === 'Checked In' ? 'Checked In ✓' : 'Check In'}
                </button>
                <button className="btn-secondary-dark">Pause</button>
                <button className="btn-secondary-dark">Report</button>
              </div>
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
            <h2 className="open-section-title">Open Assignments Near You</h2>

            <div className="open-cards-stack">
              {assignments.map((item) => (
                <div key={item.id} className="open-item-card">
                  <div className="open-item-top">
                    <div className="open-item-left">
                      <h3 className="open-item-title">{item.title}</h3>
                      <div className="open-item-meta">
                        ⏱ {item.durationHours} hours &nbsp; {item.location}
                      </div>
                    </div>

                    <span className={`priority-tag priority-${item.priority}`}>
                      {item.priority}
                    </span>
                  </div>

                  <div className="open-item-bottom-actions">
                    <button className="btn-accept-green" onClick={() => handleAccept(item.id)}>
                      Accept
                    </button>
                    <button className="btn-decline-outline" onClick={() => handleDecline(item.id)}>
                      Decline
                    </button>
                    <button className="btn-arrow-icon">
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

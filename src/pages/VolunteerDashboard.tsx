import React, { useState, useEffect } from 'react';
import { UserCheck, Clock, CheckCircle, AlertTriangle, Shield, Check, X } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Tag } from '../components/ui/Tag';
import { volunteerService } from '../services/volunteerService';
import { VolunteerProfile, VolunteerAssignment } from '../types';
import './VolunteerDashboard.css';

export const VolunteerDashboard: React.FC = () => {
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

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container vol-dashboard-page">
        {/* Profile Card */}
        <Card className="vol-profile-card flex flex-col gap-4 mb-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="avatar-circle">DV</div>
              <div>
                <h3 className="vol-name">{profile.name}</h3>
                <div className="vol-code-text">ID: {profile.code} • {profile.district}</div>
                <div className="text-xs text-muted">Joined: {profile.joinDate}</div>
              </div>
            </div>
            <Badge variant="LOW">Available</Badge>
          </div>

          <div className="vol-stats-counters grid-3 gap-4 pt-3 border-t">
            <div className="counter-box">
              <div className="c-num">{profile.hoursLogged}</div>
              <div className="c-lbl">Hours</div>
            </div>
            <div className="counter-box">
              <div className="c-num">{profile.tasksCompleted}</div>
              <div className="c-lbl">Tasks</div>
            </div>
            <div className="counter-box">
              <div className="c-num">{profile.rating}</div>
              <div className="c-lbl">Rating</div>
            </div>
          </div>
        </Card>

        {/* Current Active Assignment */}
        {profile.currentAssignment && (
          <Card className="current-assignment-card mb-6">
            <div className="flex justify-between items-center">
              <span className="section-tag-light">Current Assignment</span>
              <Badge variant="HIGH">In Progress</Badge>
            </div>
            <h3 className="assign-title mt-2">{profile.currentAssignment.title}</h3>
            <div className="assign-meta flex gap-4 text-xs text-secondary mt-1">
              <span>⏱ {profile.currentAssignment.durationHours} hours remaining</span>
              <span>👥 Team of {profile.currentAssignment.teamSize}</span>
            </div>

            <div className="assign-actions flex gap-3 mt-4">
              <Button
                variant={checkInStatus === 'Checked In' ? 'success' : 'primary'}
                onClick={() => setCheckInStatus(checkInStatus === 'Checked In' ? 'Not Checked In' : 'Checked In')}
              >
                {checkInStatus === 'Checked In' ? 'Checked In ✓' : 'Check In'}
              </Button>
              <Button variant="secondary">Pause</Button>
              <Button variant="outline">Report</Button>
            </div>
          </Card>
        )}

        {/* My Skills Tags */}
        <div className="skills-section mb-6">
          <label className="text-xs font-semibold text-muted block mb-2">My Skills</label>
          <div className="flex gap-2 flex-wrap">
            {profile.skills.map((skill) => (
              <Tag key={skill} variant="teal">{skill}</Tag>
            ))}
          </div>
        </div>

        {/* Open Assignments Near You */}
        <div className="open-assignments-section flex flex-col gap-4">
          <h2>Open Assignments Near You</h2>

          {assignments.map((item) => (
            <Card key={item.id} className="open-assign-card">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="open-title">{item.title}</h3>
                  <div className="open-meta text-xs text-muted mt-1">
                    ⏱ {item.durationHours} hours • {item.location}
                  </div>
                </div>
                <Badge variant={item.priority === 'critical' ? 'CRITICAL' : item.priority === 'high' ? 'HIGH' : 'MEDIUM'}>
                  {item.priority}
                </Badge>
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="primary" size="sm" onClick={() => handleAccept(item.id)}>
                  <Check size={12} /> Accept
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDecline(item.id)}>
                  Decline
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageLayout>
  );
};

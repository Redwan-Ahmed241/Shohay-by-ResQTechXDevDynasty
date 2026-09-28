import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Radio, Users, ShieldCheck } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import './About.css';

export const About: React.FC = () => {
  return (
    <PageLayout showAlertBanner={false}>
      <div className="about-page-bg">
        <div className="about-hero">
          <span className="about-tag">Our Mission</span>
          <h1 className="about-title">Standing With Bangladesh in Times of Crisis</h1>
          <p className="about-lead">
            Shohay (সহায়) is a flood-relief coordination platform connecting citizens who need help,
            volunteers who can respond, and district coordinators managing the response — built to make
            rescue and relief faster and more transparent during Bangladesh's flood season.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-card">
            <Radio size={22} className="about-card-icon" />
            <h3>What we do</h3>
            <p>
              Citizens submit assistance requests without needing an account. District coordinators verify
              and dispatch them to field volunteers, who accept tasks, log duty hours, and mark requests
              resolved — all tracked in real time, from first report to resolution.
            </p>
          </div>
          <div className="about-card">
            <Users size={22} className="about-card-icon" />
            <h3>Who it's for</h3>
            <p>
              Flood-affected families needing rescue, shelter, or supplies; volunteers willing to respond
              on the ground; and district coordinators who need one place to manage requests, warehouse
              stock, and their volunteer teams during an emergency.
            </p>
          </div>
          <div className="about-card">
            <ShieldCheck size={22} className="about-card-icon" />
            <h3>Built for trust</h3>
            <p>
              Every relief campaign listed is verified before it appears on the platform, and every
              rescue request is tracked with a public tracking ID — so families can follow their request's
              status without exposing their name or address to the public.
            </p>
          </div>
          <div className="about-card">
            <Heart size={22} className="about-card-icon" />
            <h3>A growing effort</h3>
            <p>
              Shohay started as a university project and is being built toward national-scale deployment.
              We're a small team, and this page will grow with more about who's behind the project soon.
            </p>
          </div>
        </div>

        <div className="about-cta">
          <h2>Want to help?</h2>
          <p>Join as a field volunteer, or support a verified relief campaign.</p>
          <div className="about-cta-buttons">
            <Link to="/volunteer/register" className="about-btn-primary">Become a Volunteer</Link>
            <Link to="/campaigns" className="about-btn-outline">View Campaigns</Link>
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

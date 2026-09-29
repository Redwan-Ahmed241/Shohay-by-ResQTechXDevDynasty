import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import { Home } from './pages/Home';
import { Alerts } from './pages/Alerts';
import { Shelters } from './pages/Shelters';
import { GetHelp } from './pages/GetHelp';
import { MyRequests } from './pages/MyRequests';
import { Campaigns } from './pages/Campaigns';
import { Donate } from './pages/Donate';
import { DonateResult } from './pages/DonateResult';
import { Contacts } from './pages/Contacts';
import { News } from './pages/News';
import { NewsArticle } from './pages/NewsArticle';
import { About } from './pages/About';
import { SignIn } from './pages/SignIn';
import { VolunteerLanding } from './pages/VolunteerLanding';
import { VolunteerRegister } from './pages/VolunteerRegister';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { CommandCenter } from './pages/CommandCenter';
import { Warehouse } from './pages/Warehouse';
import { UavMonitor } from './pages/UavMonitor';
import { NotFound } from './pages/NotFound';
import { RequireRole } from './components/auth/RequireRole';

export const AppRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/alerts" element={<Alerts />} />
              <Route path="/shelters" element={<Shelters />} />
              <Route path="/get-help" element={<GetHelp />} />
              <Route path="/my-requests" element={<RequireRole roles={['public', 'volunteer', 'admin']}><MyRequests /></RequireRole>} />
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/donate/:id" element={<Donate />} />
              <Route path="/donate/success" element={<DonateResult outcome="success" />} />
              <Route path="/donate/fail" element={<DonateResult outcome="fail" />} />
              <Route path="/donate/cancel" element={<DonateResult outcome="cancel" />} />
              <Route path="/contacts" element={<Contacts />} />
              <Route path="/news" element={<News />} />
              <Route path="/news/:id" element={<NewsArticle />} />
              <Route path="/about" element={<About />} />
              <Route path="/sign-in" element={<SignIn />} />

              {/* Volunteer Routes */}
              <Route path="/volunteer" element={<VolunteerLanding />} />
              <Route path="/volunteer/register" element={<VolunteerRegister />} />
              <Route path="/volunteer/dashboard" element={<RequireRole roles={['volunteer', 'admin']}><VolunteerDashboard /></RequireRole>} />

              {/* Admin Routes */}
              <Route path="/admin/command-center" element={<RequireRole roles={['admin']}><CommandCenter /></RequireRole>} />
              <Route path="/admin/warehouse" element={<RequireRole roles={['admin']}><Warehouse /></RequireRole>} />
              <Route path="/admin/uav" element={<RequireRole roles={['admin']}><UavMonitor /></RequireRole>} />

              {/* Fallback 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

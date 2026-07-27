import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';

// Pages
import { Home } from './pages/Home';
import { Alerts } from './pages/Alerts';
import { Shelters } from './pages/Shelters';
import { GetHelp } from './pages/GetHelp';
import { Campaigns } from './pages/Campaigns';
import { Contacts } from './pages/Contacts';
import { SignIn } from './pages/SignIn';
import { VolunteerLanding } from './pages/VolunteerLanding';
import { VolunteerRegister } from './pages/VolunteerRegister';
import { VolunteerDashboard } from './pages/VolunteerDashboard';
import { CommandCenter } from './pages/CommandCenter';
import { Warehouse } from './pages/Warehouse';
import { NotFound } from './pages/NotFound';

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <LanguageProvider>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/shelters" element={<Shelters />} />
            <Route path="/get-help" element={<GetHelp />} />
            <Route path="/campaigns" element={<Campaigns />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/sign-in" element={<SignIn />} />

            {/* Volunteer Routes */}
            <Route path="/volunteer" element={<VolunteerLanding />} />
            <Route path="/volunteer/register" element={<VolunteerRegister />} />
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />

            {/* Admin Routes */}
            <Route path="/admin/command-center" element={<CommandCenter />} />
            <Route path="/admin/warehouse" element={<Warehouse />} />

            {/* Fallback 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </LanguageProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

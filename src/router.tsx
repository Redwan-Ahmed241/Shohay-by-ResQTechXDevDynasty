import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './context/AuthContext';
import { LanguageProvider } from './context/LanguageContext';
import { PageLoader } from './components/layout/PageLoader';
import { ErrorBoundary } from './components/layout/ErrorBoundary';
import { RequireRole } from './components/auth/RequireRole';

// Route-level code-splitting for balanced chunk sizes
const Home = lazy(() => import('./pages/Home').then((m) => ({ default: m.Home })));
const Alerts = lazy(() => import('./pages/Alerts').then((m) => ({ default: m.Alerts })));
const Shelters = lazy(() => import('./pages/Shelters').then((m) => ({ default: m.Shelters })));
const GetHelp = lazy(() => import('./pages/GetHelp').then((m) => ({ default: m.GetHelp })));
const MyRequests = lazy(() => import('./pages/MyRequests').then((m) => ({ default: m.MyRequests })));
const Campaigns = lazy(() => import('./pages/Campaigns').then((m) => ({ default: m.Campaigns })));
const Donate = lazy(() => import('./pages/Donate').then((m) => ({ default: m.Donate })));
const DonateResult = lazy(() => import('./pages/DonateResult').then((m) => ({ default: m.DonateResult })));
const Contacts = lazy(() => import('./pages/Contacts').then((m) => ({ default: m.Contacts })));
const News = lazy(() => import('./pages/News').then((m) => ({ default: m.News })));
const NewsArticle = lazy(() => import('./pages/NewsArticle').then((m) => ({ default: m.NewsArticle })));
const About = lazy(() => import('./pages/About').then((m) => ({ default: m.About })));
const SignIn = lazy(() => import('./pages/SignIn').then((m) => ({ default: m.SignIn })));

// Volunteer Routes
const VolunteerLanding = lazy(() => import('./pages/VolunteerLanding').then((m) => ({ default: m.VolunteerLanding })));
const VolunteerRegister = lazy(() => import('./pages/VolunteerRegister').then((m) => ({ default: m.VolunteerRegister })));
const VolunteerDashboard = lazy(() => import('./pages/VolunteerDashboard').then((m) => ({ default: m.VolunteerDashboard })));

// Admin / Heavy Operational Views
const CommandCenter = lazy(() => import('./pages/CommandCenter').then((m) => ({ default: m.CommandCenter })));
const Warehouse = lazy(() => import('./pages/Warehouse').then((m) => ({ default: m.Warehouse })));
const UavMonitor = lazy(() => import('./pages/UavMonitor').then((m) => ({ default: m.UavMonitor })));

// Fallback 404
const NotFound = lazy(() => import('./pages/NotFound').then((m) => ({ default: m.NotFound })));

export const AppRouter: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <ErrorBoundary>
              <Suspense fallback={<PageLoader />}>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/alerts" element={<Alerts />} />
                <Route path="/shelters" element={<Shelters />} />
                <Route path="/get-help" element={<GetHelp />} />
                <Route
                  path="/my-requests"
                  element={
                    <RequireRole roles={['public', 'volunteer', 'admin']}>
                      <MyRequests />
                    </RequireRole>
                  }
                />
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
                <Route
                  path="/volunteer/dashboard"
                  element={
                    <RequireRole roles={['volunteer', 'admin']}>
                      <VolunteerDashboard />
                    </RequireRole>
                  }
                />

                {/* Admin Routes */}
                <Route
                  path="/admin/command-center"
                  element={
                    <RequireRole roles={['admin']}>
                      <CommandCenter />
                    </RequireRole>
                  }
                />
                <Route
                  path="/admin/warehouse"
                  element={
                    <RequireRole roles={['admin']}>
                      <Warehouse />
                    </RequireRole>
                  }
                />
                <Route
                  path="/admin/uav"
                  element={
                    <RequireRole roles={['admin']}>
                      <UavMonitor />
                    </RequireRole>
                  }
                />

                {/* Fallback 404 */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              </Suspense>
            </ErrorBoundary>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import { PageLayout } from '../layout/PageLayout';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types';

/**
 * Wraps a page that only some roles may open. Not signed in -> sign-in page (then back here);
 * wrong role -> "no access" card. The backend enforces the same rules on every API call,
 * so this is about a clear experience, not security.
 */
export const RequireRole: React.FC<{ roles: UserRole[]; children: React.ReactNode }> = ({ roles, children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user && isLoading) {
    return (
      <PageLayout showAlertBanner={false}>
        <div className="container flex justify-center items-center py-16" role="status">
          <Loader2 size={28} className="animate-spin" />
        </div>
      </PageLayout>
    );
  }

  if (!user) {
    return <Navigate to="/sign-in" replace state={{ from: location.pathname }} />;
  }

  if (!roles.includes(user.role)) {
    return (
      <PageLayout showAlertBanner={false}>
        <div className="container flex justify-center items-center py-16">
          <Card className="text-center max-w-md p-8 flex flex-col items-center gap-4">
            <ShieldAlert size={56} className="text-warning" />
            <h1>No access</h1>
            <p className="text-xs text-secondary">
              This page is for {roles.includes('admin') && !roles.includes('volunteer') ? 'district coordinators' : 'field volunteers'}.
              You are signed in as {user.name}. Ask a coordinator if you need access.
            </p>
            <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
              <ArrowLeft size={14} /> Return to Homepage
            </Button>
          </Card>
        </div>
      </PageLayout>
    );
  }

  return <>{children}</>;
};

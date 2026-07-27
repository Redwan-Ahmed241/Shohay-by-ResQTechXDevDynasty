import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container flex justify-center items-center py-16">
        <Card className="text-center max-w-md p-8 flex flex-col items-center gap-4">
          <ShieldAlert size={56} className="text-warning" />
          <h1>404 — Page Not Found</h1>
          <p className="text-xs text-secondary">
            The page or resource you requested does not exist or has been relocated in the flood relief network.
          </p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> Return to Homepage
          </Button>
        </Card>
      </div>
    </PageLayout>
  );
};

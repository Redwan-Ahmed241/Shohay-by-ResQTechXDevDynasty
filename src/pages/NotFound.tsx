import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { useLanguage } from '../context/LanguageContext';

export const NotFound: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();

  return (
    <PageLayout showAlertBanner={false}>
      <div className="container flex justify-center items-center py-16">
        <Card className="text-center max-w-md p-8 flex flex-col items-center gap-4">
          <ShieldAlert size={56} className="text-warning" />
          <h1>{t('pageNotFoundTitle')}</h1>
          <p className="text-xs text-secondary">
            {t('pageNotFoundDesc')}
          </p>
          <Button variant="primary" className="mt-4" onClick={() => navigate('/')}>
            <ArrowLeft size={14} /> {t('pageNotFoundReturnHome')}
          </Button>
        </Card>
      </div>
    </PageLayout>
  );
};

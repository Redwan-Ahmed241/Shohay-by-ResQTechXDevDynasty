import React from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { AlertBanner } from './AlertBanner';

export interface PageLayoutProps {
  children: React.ReactNode;
  showAlertBanner?: boolean;
  showFooter?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showAlertBanner = true,
  showFooter = true,
}) => {
  return (
    <>
      {showAlertBanner && <AlertBanner />}
      <Header />
      <main className="page-content">{children}</main>
      {showFooter && <Footer />}
    </>
  );
};

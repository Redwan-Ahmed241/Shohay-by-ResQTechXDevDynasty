import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { MOCK_NEWS } from '../data/news';
import { useLanguage } from '../context/LanguageContext';
import './News.css';

export const News: React.FC = () => {
  const { t } = useLanguage();

  return (
    <PageLayout showAlertBanner={false}>
      <div className="news-page-bg">
        <div className="news-page-container">
          <h1 className="news-page-title">{t('newsTitle')}</h1>
          <p className="news-page-subtitle">{t('newsSubtitle')}</p>

          <div className="news-page-grid">
            {MOCK_NEWS.map((article) => (
              <Link key={article.id} to={`/news/${article.id}`} className="news-page-card">
                <div className="news-page-card-img-wrap">
                  <img src={article.image} alt={article.title} className="news-page-card-img" />
                  <span className="news-page-card-tag">{article.category}</span>
                </div>
                <div className="news-page-card-body">
                  <h3 className="news-page-card-title">{article.title}</h3>
                  <p className="news-page-card-excerpt">{article.excerpt}</p>
                  <div className="news-page-card-footer">
                    <span className="news-page-card-date"><Clock size={12} /> {article.publishedAt}</span>
                    <span className="news-page-card-link">{t('newsReadMore')} <ArrowRight size={12} /></span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

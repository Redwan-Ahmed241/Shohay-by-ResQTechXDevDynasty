import React from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Clock } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { MOCK_NEWS } from '../data/news';
import { useLanguage } from '../context/LanguageContext';
import './News.css';

export const NewsArticle: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLanguage();
  const article = MOCK_NEWS.find((a) => a.id === id);

  if (!article) {
    return (
      <PageLayout showAlertBanner={false}>
        <div className="news-page-bg">
          <div className="news-page-container" style={{ textAlign: 'center', padding: '48px 16px' }}>
            <h1 className="news-page-title">{t('newsStoryNotFound')}</h1>
            <Link to="/news" className="news-page-card-link" style={{ justifyContent: 'center' }}>
              <ArrowLeft size={12} /> {t('newsBackToNews')}
            </Link>
          </div>
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout showAlertBanner={false}>
      <div className="news-page-bg">
        <div className="news-article-container">
          <Link to="/news" className="news-article-back">
            <ArrowLeft size={14} /> {t('newsBackToNews')}
          </Link>

          <span className="news-page-card-tag news-article-tag">{article.category}</span>
          <h1 className="news-article-title">{article.title}</h1>
          <div className="news-article-date"><Clock size={12} /> {article.publishedAt}</div>

          <img src={article.image} alt={article.title} className="news-article-img" />

          <div className="news-article-body">
            {article.body.map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </div>
      </div>
    </PageLayout>
  );
};

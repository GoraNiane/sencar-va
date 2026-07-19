import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchArticles } from '../api.js';
import { ClockIcon } from './Icons.jsx';

export default function NewsSection() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchArticles()
      .then(setArticles)
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <section className="section news-section">
      <div className="wrap">
        <div className="section-eyebrow">Conseils et actualités</div>
        <h2 className="display" style={{ fontSize: 30, fontWeight: 600, marginBottom: 32 }}>Actualités</h2>
        {loading && <p className="vehicle-empty">Chargement...</p>}
        {!loading && articles.length === 0 && <p className="vehicle-empty">Aucun article pour le moment.</p>}
        <div className="news-grid">
          {articles.map((a) => (
            <article key={a.id} className="news-card">
              <h3>{a.title}</h3>
              {a.excerpt && <p className="news-excerpt">{a.excerpt}</p>}
              <div className="news-body">{a.content}</div>
              <div className="news-date">
                <ClockIcon width="12" height="12" /> {new Date(a.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

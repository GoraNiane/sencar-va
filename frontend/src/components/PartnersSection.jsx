import { useEffect, useState } from 'react';
import { fetchPartners } from '../api.js';

export default function PartnersSection() {
  const [partners, setPartners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetchPartners()
      .then(setPartners)
      .catch(() => setPartners([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return null;
  if (partners.length === 0) return null;

  return (
    <section className="section partners-section">
      <div className="wrap">
        <div className="section-eyebrow">Partenaires et certifications</div>
        <h2 className="display" style={{ fontSize: 30, fontWeight: 600, marginBottom: 32 }}>Ils nous font confiance</h2>
        <div className="partners-grid">
          {partners.map((p) => (
            <div key={p.id} className="partner-card">
              {p.logo ? <img src={p.logo} alt={p.name} /> : <span className="partner-name">{p.name}</span>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

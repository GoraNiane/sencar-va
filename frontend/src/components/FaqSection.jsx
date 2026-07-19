import { useState } from 'react';
import { fetchArticles } from '../api.js';

const FAQS = [
  { q: 'Quelle garantie proposez-vous ?', a: 'Tous nos véhicules sont vérifiés. Les véhicules dédouanés bénéficient d\'une garantie contractuelle. Les détails sont précisés sur chaque fiche.' },
  { q: 'Quels sont les modes de paiement ?', a: 'Nous acceptons les virements bancaires, les paiements mobiles (Orange Money, Wave), et les versements échelonnés selon des modalités à convenir.' },
  { q: 'Comment se déroule un achat ?', a: 'Vous choisissez un véhicule, nous vérifions sa disponibilité, puis nous organisons la visite au showroom ou la livraison selon votre localisation.' },
  { q: 'Les véhicules sont-ils vraiment disponibles ?', a: 'Oui. Toutes les photos sont prises au showroom. Si un véhicule est vendu, sa fiche est retirée immédiatement.' }
];

export default function FaqSection() {
  const [open, setOpen] = useState(null);
  return (
    <section className="section faq-section">
      <div className="wrap">
        <div className="section-eyebrow">Questions fréquentes</div>
        <h2 className="display" style={{ fontSize: 30, fontWeight: 600, marginBottom: 32 }}>FAQ</h2>
        <div className="faq-list">
          {FAQS.map((item, i) => (
            <div key={i} className={`faq-item ${open === i ? 'faq-item--open' : ''}`}>
              <button type="button" className="faq-question" onClick={() => setOpen(open === i ? null : i)}>
                <span>{item.q}</span>
                <span className="faq-chevron">+</span>
              </button>
              {open === i && <div className="faq-answer"><p>{item.a}</p></div>}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

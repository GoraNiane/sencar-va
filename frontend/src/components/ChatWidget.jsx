import { useState, useEffect, useRef } from 'react';
import { fetchArticles, fetchReviews, submitReview, fetchLegalPage } from '../api.js';
import { MessageIcon, StarIcon, CloseIcon } from './Icons.jsx';

const BOT_FAQ = [
  { keywords: ['heure', 'ouvert', 'fermé', 'horaires'], answer: 'Le showroom est ouvert du lundi au samedi, de 8h30 à 18h30.' },
  { keywords: ['disponible', 'stock', 'voiture'], answer: 'Consultez notre catalogue en ligne ou appelez-nous pour vérifier la disponibilité en temps réel.' },
  { keywords: ['prix', 'payer', 'paiement'], answer: 'Nous acceptons virement bancaire, espèces, et paiements mobiles (Orange Money, Wave).' },
  { keywords: ['garantie', 'garanti'], answer: 'Tous nos véhicules dédouanés bénéficient d\'une garantie contractuelle.' },
  { keywords: ['essai', 'essayer', 'tester'], answer: 'Vous pouvez réserver un essai directement sur la fiche du véhicule.' },
  { keywords: ['contact', 'appeler', 'telephone'], answer: 'Appelez-nous au +225 05 09 09 39 ou écrivez sur WhatsApp.' }
];

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([{ from: 'bot', text: 'Bonjour ! Comment puis-je vous aider ?' }]);
  const [input, setInput] = useState('');
  const [articles, setArticles] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewForm, setReviewForm] = useState({ name: '', rating: 5, comment: '' });
  const [showReview, setShowReview] = useState(false);
  const [legal, setLegal] = useState({ mentions: '', privacy: '', cgv: '' });
  const [legalTab, setLegalTab] = useState(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    fetchArticles().then(setArticles).catch(() => {});
    fetchReviews().then(setReviews).catch(() => {});
    fetchLegalPage('mentions').then(r => setLegal(l => ({ ...l, mentions: r.content }))).catch(() => {});
    fetchLegalPage('privacy').then(r => setLegal(l => ({ ...l, privacy: r.content }))).catch(() => {});
    fetchLegalPage('cgv').then(r => setLegal(l => ({ ...l, cgv: r.content }))).catch(() => {});
  }, [open]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!input.trim()) return;
    const userMsg = input.trim();
    setMessages(prev => [...prev, { from: 'user', text: userMsg }]);
    setInput('');
    const lower = userMsg.toLowerCase();
    const match = BOT_FAQ.find(f => f.keywords.some(k => lower.includes(k)));
    setTimeout(() => {
      setMessages(prev => [...prev, { from: 'bot', text: match ? match.answer : 'Je ne suis pas sûr de comprendre. Pour plus d\'informations, appelez-nous au +225 05 09 09 39.' }]);
    }, 600);
  };

  const submitReview = async (e) => {
    e.preventDefault();
    try {
      await submitReview(reviewForm);
      setShowReview(false);
      setReviewForm({ name: '', rating: 5, comment: '' });
      fetchReviews().then(setReviews).catch(() => {});
    } catch {}
  };

  return (
    <div className="chat-widget">
      {open && (
        <div className="chat-panel">
          <div className="chat-header">
            <span className="display">Auto Elite</span>
            <div className="chat-header-actions">
              <button type="button" onClick={() => setShowReview(v => !v)} className="chat-icon-btn" title="Donner un avis"><StarIcon width="16" height="16" /></button>
              <button type="button" onClick={() => setLegalTab('mentions')} className="chat-icon-btn" title="Mentions légales">M</button>
              <button type="button" onClick={() => setLegalTab('privacy')} className="chat-icon-btn" title="Confidentialité">P</button>
              <button type="button" onClick={() => setLegalTab('cgv')} className="chat-icon-btn" title="CGV">C</button>
              <button type="button" onClick={() => setOpen(false)} className="chat-icon-btn"><CloseIcon width="16" height="16" /></button>
            </div>
          </div>

          {legalTab && (
            <div className="chat-legal">
              <div className="chat-legal-header">
                <span>{legalTab === 'mentions' ? 'Mentions légales' : legalTab === 'privacy' ? 'Politique de confidentialité' : 'CGV'}</span>
                <button type="button" onClick={() => setLegalTab(null)}><CloseIcon width="14" height="14" /></button>
              </div>
              <div className="chat-legal-body">
                {legalTab === 'mentions' && <p>{legal.mentions || 'Contenu à venir.'}</p>}
                {legalTab === 'privacy' && <p>{legal.privacy || 'Contenu à venir.'}</p>}
                {legalTab === 'cgv' && <p>{legal.cgv || 'Contenu à venir.'}</p>}
              </div>
            </div>
          )}

          {showReview && (
            <form className="chat-review-form" onSubmit={submitReview}>
              <div className="field-group">
                <label>Nom</label>
                <input value={reviewForm.name} onChange={(e) => setReviewForm({ ...reviewForm, name: e.target.value })} required />
              </div>
              <div className="field-group">
                <label>Note</label>
                <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })}>
                  {[5,4,3,2,1].map(n => <option key={n} value={n}>{n} / 5</option>)}
                </select>
              </div>
              <div className="field-group">
                <label>Commentaire</label>
                <textarea rows={3} value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} required />
              </div>
              <button type="submit" className="btn-primary" style={{ padding: '8px 14px', fontSize: 13 }}>Envoyer</button>
            </form>
          )}

          <div className="chat-messages">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.from}`}>{m.text}</div>
            ))}
            {articles.length > 0 && (
              <div className="chat-articles">
                {articles.slice(0, 3).map(a => (
                  <div key={a.id} className="chat-article">
                    <strong>{a.title}</strong>
                    <p>{a.excerpt || a.content?.slice(0, 120)}</p>
                  </div>
                ))}
              </div>
            )}
            {reviews.filter(r => r.approved).length > 0 && (
              <div className="chat-reviews">
                {reviews.filter(r => r.approved).slice(0, 3).map(r => (
                  <div key={r.id} className="chat-review">
                    <strong>{r.name}</strong> {'★'.repeat(r.rating)}
                    <p>{r.comment}</p>
                  </div>
                ))}
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form className="chat-input" onSubmit={handleSend}>
            <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Écrivez un message..." />
            <button type="submit" className="chat-send">Envoyer</button>
          </form>
        </div>
      )}
      <button type="button" className="chat-toggle" onClick={() => setOpen(!open)}>
        <MessageIcon width="22" height="22" />
      </button>
    </div>
  );
}

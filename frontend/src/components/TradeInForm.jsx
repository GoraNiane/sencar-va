import { useState } from 'react';
import { createTradein } from '../api.js';
import { TagIcon, CloseIcon } from './Icons.jsx';

export default function TradeInForm() {
  const [form, setForm] = useState({ name: '', phone: '', email: '', brand: '', model: '', year: '', mileage: '', description: '' });
  const [photos, setPhotos] = useState([]);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createTradein(form);
      setSent(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="tradein-success">
        <TagIcon width="20" height="20" />
        <p>Merci ! Votre véhicule a été enregistré. Nous vous contacterons pour l'expertise.</p>
      </div>
    );
  }

  return (
    <form className="tradein-form" onSubmit={submit}>
      <h3 className="display">Proposer mon véhicule en reprise</h3>
      <p>Estimez votre véhicule et proposez-le en reprise.</p>
      <div className="field-group">
        <label htmlFor="tiName">Nom complet</label>
        <input id="tiName" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
      </div>
      <div className="field-group">
        <label htmlFor="tiPhone">Téléphone</label>
        <input id="tiPhone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} required />
      </div>
      <div className="field-group">
        <label htmlFor="tiEmail">Email</label>
        <input id="tiEmail" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
      <div className="field-group">
        <label htmlFor="tiBrand">Marque</label>
        <input id="tiBrand" value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} required />
      </div>
      <div className="field-group">
        <label htmlFor="tiModel">Modèle</label>
        <input id="tiModel" value={form.model} onChange={(e) => setForm({ ...form, model: e.target.value })} required />
      </div>
      <div className="field-group">
        <label htmlFor="tiYear">Année</label>
        <input id="tiYear" type="number" value={form.year} onChange={(e) => setForm({ ...form, year: e.target.value })} />
      </div>
      <div className="field-group">
        <label htmlFor="tiMileage">Kilométrage</label>
        <input id="tiMileage" type="number" value={form.mileage} onChange={(e) => setForm({ ...form, mileage: e.target.value })} />
      </div>
      <div className="field-group">
        <label htmlFor="tiDesc">Description</label>
        <textarea id="tiDesc" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </div>
      <div className="field-group">
        <label>Photos (optionnel)</label>
        <input type="file" accept="image/*" multiple onChange={(e) => setPhotos(Array.from(e.target.files || []))} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Envoi...' : 'Envoyer'}</button>
    </form>
  );
}

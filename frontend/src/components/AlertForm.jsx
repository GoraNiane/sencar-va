import { useState } from 'react';
import { submitAlert } from '../api.js';
import SuccessToast from './SuccessToast.jsx';
import { useHaptic } from '../hooks/useHaptic.js';

export default function AlertForm() {
  const [contact, setContact] = useState('');
  const [brand, setBrand] = useState('');
  const [model, setModel] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const { light } = useHaptic();

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await submitAlert({ contact, brand, model, phone, email });
      setSent(true);
      setShowToast(true);
      light();
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'enregistrement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <>
        <div className="alert-success">
          <p>Merci ! Nous vous notifierons dès que ce véhicule est disponible.</p>
        </div>
        {showToast && <SuccessToast message="Alerte enregistrée avec succès." onClose={() => setShowToast(false)} />}
      </>
    );
  }

  return (
    <form className="alert-form" onSubmit={submit}>
      <h3 className="display">Être alerté</h3>
      <p>Laissez vos coordonnées pour être prévenu quand ce modèle arrive au showroom.</p>
      <div className="field-group">
        <label htmlFor="alertContact">Contact</label>
        <input id="alertContact" value={contact} onChange={(e) => setContact(e.target.value)} placeholder="Nom ou prénom" required />
      </div>
      <div className="field-group">
        <label htmlFor="alertBrand">Marque souhaitée</label>
        <input id="alertBrand" value={brand} onChange={(e) => setBrand(e.target.value)} placeholder="Ex: Toyota" />
      </div>
      <div className="field-group">
        <label htmlFor="alertModel">Modèle souhaité</label>
        <input id="alertModel" value={model} onChange={(e) => setModel(e.target.value)} placeholder="Ex: RAV4" />
      </div>
      <div className="field-group">
        <label htmlFor="alertPhone">Téléphone</label>
        <input id="alertPhone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+225 01 00 00 00 00" required />
      </div>
      <div className="field-group">
        <label htmlFor="alertEmail">Email</label>
        <input id="alertEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.com" />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Enregistrement...' : 'M\'alerter'}</button>
    </form>
  );
}

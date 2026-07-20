import { useState } from 'react';
import { createAppointment } from '../api.js';
import { CalendarIcon, CloseIcon } from './Icons.jsx';

const TIME_SLOTS = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

export default function AppointmentForm({ vehicleId }) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await createAppointment({ name, phone, email, vehicleId, date, time, message });
      setSent(true);
    } catch (err) {
      setError(err.message || 'Erreur lors de la prise de rendez-vous.');
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="appointment-success">
        <CalendarIcon width="20" height="20" />
        <p>Merci ! Votre demande de rendez-vous a été enregistrée. Nous vous contacterons pour confirmer.</p>
      </div>
    );
  }

  return (
    <form className="appointment-form" onSubmit={submit}>
      <h3 className="display">Prendre rendez-vous</h3>
      <p>Réservez un créneau pour essai au showroom.</p>
      <div className="field-group">
        <label htmlFor="apptName">Nom complet</label>
        <input id="apptName" value={name} onChange={(e) => setName(e.target.value)} required />
      </div>
      <div className="field-group">
        <label htmlFor="apptPhone">Téléphone</label>
        <input id="apptPhone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
      </div>
      <div className="field-group">
        <label htmlFor="apptEmail">Email</label>
        <input id="apptEmail" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="field-group">
        <label htmlFor="apptDate">Date</label>
        <input id="apptDate" type="date" value={date} onChange={(e) => setDate(e.target.value)} required />
      </div>
      <div className="field-group">
        <label htmlFor="apptTime">Créneau</label>
        <select id="apptTime" value={time} onChange={(e) => setTime(e.target.value)} required>
          <option value="">Choisir</option>
          {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="apptMsg">Message (optionnel)</label>
        <textarea id="apptMsg" rows={3} value={message} onChange={(e) => setMessage(e.target.value)} />
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Envoi...' : 'Réserver'}</button>
    </form>
  );
}

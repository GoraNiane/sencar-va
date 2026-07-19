import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useHaptic } from '../hooks/useHaptic.js';

const BUDGET_PRESETS = [
  { label: 'Moins de 10M', minPrice: '', maxPrice: '10000000' },
  { label: '10M - 20M', minPrice: '10000000', maxPrice: '20000000' },
  { label: '20M - 30M', minPrice: '20000000', maxPrice: '30000000' },
  { label: '30M+', minPrice: '30000000', maxPrice: '' }
];

export default function ArrivalQuickQuestionnaire({ onApplyFilters }) {
  const navigate = useNavigate();
  const { light } = useHaptic();
  const [open, setOpen] = useState(true);

  const defaultBudgetIndex = 0;
  const [budgetIndex, setBudgetIndex] = useState(defaultBudgetIndex);
  const [vehicleType, setVehicleType] = useState('Toutes');
  const [condition, setCondition] = useState('Toute');

  const [submitted, setSubmitted] = useState(false);

  const t = useMemo(() => {
    return {
      title: 'Question rapide',
      desc: 'En 20 secondes, on vous propose des véhicules plus adaptés.',
      budget: 'Votre budget',
      type: 'Type de véhicule',
      cond: 'Neuf importé ou occasion ?',
      apply: 'Voir les suggestions',
      close: 'Peut-être plus tard'
    };
  }, []);

  const submit = (e) => {
    e.preventDefault();
    if (submitted) return;
    const preset = BUDGET_PRESETS[budgetIndex] || BUDGET_PRESETS[0];

    // Map to existing filters structure:
    // - condition -> classification
    // - vehicleType -> q (quick)
    let classification = 'Toutes';
    if (condition === 'Neuf importé') classification = 'dedouane';
    if (condition === 'Occasion') classification = 'sous_douane';

    const q = vehicleType === 'Toutes' ? '' : vehicleType;

    const params = {
      q,
      transmission: 'Toutes',
      classification,
      available: '',
      minPrice: preset.minPrice,
      maxPrice: preset.maxPrice,
      sort: 'price_asc'
    };

    try {
      localStorage.setItem('ae_arrival_questionnaire_done', '1');
    } catch {}

    onApplyFilters(params);
    setSubmitted(true);
    setOpen(false);
    light();
    navigate('/#catalogue');
  };

  if (!open) return null;

  return (
    <div className="arrival-q-overlay" role="dialog" aria-modal="true" aria-label={t.title}>
      <div className="arrival-q" onClick={(e) => e.stopPropagation()}>
        <div className="arrival-q-head">
          <h3 className="display" style={{ fontSize: 22 }}>{t.title}</h3>
          <button type="button" className="arrival-q-close" onClick={() => setOpen(false)} aria-label={t.close}>×</button>
        </div>
        <p className="arrival-q-desc">{t.desc}</p>

        <form onSubmit={submit} className="arrival-q-form">
          <div className="arrival-q-field">
            <label>{t.budget}</label>
            <select value={budgetIndex} onChange={(e) => setBudgetIndex(Number(e.target.value))}>
              {BUDGET_PRESETS.map((b, i) => (
                <option key={b.label} value={i}>{b.label}</option>
              ))}
            </select>
          </div>

          <div className="arrival-q-field">
            <label>{t.type}</label>
            <select value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
              <option value="Toutes">Toutes</option>
              <option value="SUV">SUV</option>
              <option value="Berline">Berline</option>
              <option value="4x4">4x4</option>
            </select>
          </div>

          <div className="arrival-q-field">
            <label>{t.cond}</label>
            <select value={condition} onChange={(e) => setCondition(e.target.value)}>
              <option value="Toute">Toute</option>
              <option value="Neuf importé">Neuf importé</option>
              <option value="Occasion">Occasion</option>
            </select>
          </div>

          <button type="submit" className="btn-primary" disabled={submitted}>
            {t.apply}
          </button>

          <button type="button" className="btn-ghost arrival-q-secondary" onClick={() => setOpen(false)}>
            {t.close}
          </button>
        </form>
      </div>
    </div>
  );
}


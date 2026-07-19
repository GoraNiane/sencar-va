import { useState, useEffect } from 'react';
import { fetchVehicles } from '../api.js';
import { SearchIcon } from './Icons.jsx';
import { useHaptic } from '../hooks/useHaptic.js';

const TRANSMISSION_OPTIONS = ['Toutes', 'Automatique', 'Manuelle'];
const CLASSIFICATION_OPTIONS = [
  { value: 'Toutes', label: 'Toutes catégories' },
  { value: 'dedouane', label: 'Déjà dédouanées' },
  { value: 'sous_douane', label: 'Sous douane' },
  { value: 'sur_commande', label: 'Sur commande' }
];

export default function SearchCard({ onSearch }) {
  const { light } = useHaptic();
  const [q, setQ] = useState('');
  const [transmission, setTransmission] = useState('Toutes');
  const [classification, setClassification] = useState('Toutes');
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sort, setSort] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchVehicles().then((all) => {
      const unique = [...new Set(all.map(v => v.brand))].sort();
      setBrands(unique);
    }).catch(() => {});
  }, []);

  const submit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    const params = { q, transmission, classification, available: onlyAvailable ? 'true' : '', sort, minPrice, maxPrice };
    if (selectedBrands.length > 0) {
      params.brand = selectedBrands[0];
    }
    onSearch(params);
    light();
    window.setTimeout(() => setSubmitting(false), 650);
  };

  const toggleBrand = (b) => {
    setSelectedBrands(prev => prev.includes(b) ? prev.filter(x => x !== b) : [...prev, b]);
  };

  return (
    <form className={`search-card ${submitting ? 'search-card--loading' : ''}`} onSubmit={submit}>
      <div className="field-group">
        <label htmlFor="q">Rechercher</label>
        <input id="q" type="text" placeholder="Marque, modèle..." value={q} onChange={(e) => setQ(e.target.value)} />
      </div>
      <div className="field-group">
        <label htmlFor="transmission">Transmission</label>
        <select id="transmission" value={transmission} onChange={(e) => setTransmission(e.target.value)}>
          {TRANSMISSION_OPTIONS.map((opt) => <option key={opt} value={opt}>{opt}</option>)}
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="classification">Statut</label>
        <select id="classification" value={classification} onChange={(e) => setClassification(e.target.value)}>
          {CLASSIFICATION_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
      </div>
      <div className="field-group">
        <label htmlFor="minPrice">Budget min (FCFA)</label>
        <input id="minPrice" type="number" placeholder="Min" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
      </div>
      <div className="field-group">
        <label htmlFor="maxPrice">Budget max (FCFA)</label>
        <input id="maxPrice" type="number" placeholder="Max" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
      </div>
      <div className="field-group">
        <label htmlFor="sort">Tri</label>
        <select id="sort" value={sort} onChange={(e) => setSort(e.target.value)}>
          <option value="">Par défaut</option>
          <option value="price_asc">Prix croissant</option>
          <option value="price_desc">Prix décroissant</option>
          <option value="date_desc">Plus récents</option>
        </select>
      </div>
      <div className="field-group search-brand-group">
        <label>Marques</label>
        <div className="brand-checkboxes">
          {brands.map((b) => (
            <label key={b} className="checkbox-field">
              <input type="checkbox" checked={selectedBrands.includes(b)} onChange={() => toggleBrand(b)} />
              {b}
            </label>
          ))}
        </div>
      </div>
      <label className="checkbox-field">
        <input type="checkbox" checked={onlyAvailable} onChange={(e) => setOnlyAvailable(e.target.checked)} />
        Disponibles uniquement
      </label>
      <button type="submit" className="search-btn hero-ripple" disabled={submitting}>
        {submitting ? 'Recherche…' : (
          <>
            <SearchIcon width="15" height="15" />
            Rechercher
          </>
        )}
      </button>
      {submitting && (
        <div className="search-skeleton" aria-hidden="true">
          <div className="search-skeleton-bar" />
        </div>
      )}
    </form>
  );
}

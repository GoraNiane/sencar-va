import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleCard from './VehicleCard.jsx';
import HorizontalCarousel from './HorizontalCarousel.jsx';
import { fetchVehicles, mediaUrl } from '../api.js';

export default function VehicleGrid({ filters }) {
  const [vehicles, setVehicles] = useState([]);
  const [latest, setLatest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [phase, setPhase] = useState('in');

  const isFiltering = filters.q || filters.transmission !== 'Toutes' || filters.classification !== 'Toutes' || filters.available || filters.minPrice || filters.maxPrice || filters.sort || filters.brand;

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    const params = { ...filters };
    delete params.sort;
    fetchVehicles(params)
      .then((all) => {
        if (!mounted) return;
        setVehicles(all);
        if (!isFiltering) {
          const sorted = [...all].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setLatest(sorted.slice(0, 8));
        } else {
          setLatest([]);
        }
      })
      .catch(() => setError('Impossible de charger les véhicules pour le moment.'))
      .finally(() => {
        if (!mounted) return;
        setLoading(false);
      });
    return () => { mounted = false; };
  }, [filters, isFiltering]);

  useEffect(() => {
    if (!isFiltering) {
      setPhase('in');
      return;
    }
    setPhase('out');
    const t = window.setTimeout(() => setPhase('in'), 180);
    return () => window.clearTimeout(t);
  }, [vehicles, isFiltering]);

  const renderLatestItem = (v) => (
    <Link to={`/vehicule/${v.id}`} className="vcard-link" style={{ textDecoration: 'none', color: 'inherit' }}>
      <div className="vcard">
        <div className="vcard-media">
          {v.photos?.[0] ? (
            <img src={mediaUrl(v.id, v.photos[0])} alt={v.brand} />
          ) : (
            <div className="vcard-media-empty" style={{ height: 180 }}><span>Aucune photo</span></div>
          )}
        </div>
        <div className="vcard-body">
          <div className="vcard-title-row">
            <h3>{v.brand} {v.model}</h3>
          </div>
          {v.classification !== 'sur_commande' && (
            <div className="vcard-price mono">
              {new Intl.NumberFormat('fr-FR').format(v.price)} <small>FCFA</small>
            </div>
          )}
        </div>
      </div>
    </Link>
  );

  return (
    <section className="section" id="catalogue">
      <div className="wrap">
        {!isFiltering && latest.length > 0 && (
          <div className="section-head">
            <div>
              <div className="section-eyebrow">Nouveautés</div>
              <h2 className="display">Derniers arrivages</h2>
            </div>
            <Link to="/#catalogue" className="section-link">Voir tout <span aria-hidden="true">→</span></Link>
          </div>
        )}

        {!isFiltering && latest.length > 0 && (
          <HorizontalCarousel items={latest} renderItem={renderLatestItem} />
        )}

        <div className={`section-head ${(!isFiltering && latest.length > 0) ? 'section-head--with-space' : ''}`}>
          <div>
            <div className="section-eyebrow">Véhicules en exposition</div>
            <h2 className="display">Notre catalogue</h2>
          </div>
        </div>

        <div className="vehicle-grid">
          {loading && <p className="vehicle-empty">Chargement des véhicules...</p>}
          {!loading && error && <p className="vehicle-empty">{error}</p>}
          {!loading && !error && vehicles.length === 0 && (
            <p className="vehicle-empty">Aucun véhicule ne correspond à votre recherche.</p>
          )}
          {!loading && !error && vehicles.map((vehicle, idx) => (
            <Link key={vehicle.id} to={`/vehicule/${vehicle.id}`} className={`vcard-link ${phase === 'out' && isFiltering ? 'vcard-link--out' : 'vcard-link--in'}`}>
              <VehicleCard vehicle={vehicle} staggerIndex={idx} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

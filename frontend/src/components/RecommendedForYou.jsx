import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import VehicleCard from './VehicleCard.jsx';
import { fetchVehicles } from '../api.js';

const formatKey = (value) => String(value ?? '').trim().toLowerCase();

export default function RecommendedForYou() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const recents = useMemo(() => {
    try {
      const raw = localStorage.getItem('ae_viewed_vehicles');
      const arr = raw ? JSON.parse(raw) : [];
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }, []);

  const features = useMemo(() => {
    // We compute:
    // - top brand
    // - approximate price range (min/max around viewed)
    const brands = new Map();
    const prices = [];

    for (const item of recents) {
      const b = formatKey(item.brand);
      if (b) brands.set(b, (brands.get(b) || 0) + 1);
      if (typeof item.price === 'number' && Number.isFinite(item.price)) prices.push(item.price);
    }

    const topBrand = [...brands.entries()].sort((a, b) => b[1] - a[1])[0]?.[0] || '';
    const minP = prices.length ? Math.min(...prices) : null;
    const maxP = prices.length ? Math.max(...prices) : null;

    return {
      topBrand,
      minP,
      maxP
    };
  }, [recents]);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        // Pull a larger set, then pick client-side. (No new backend endpoint required.)
        const all = await fetchVehicles({ sort: 'date_desc' });
        if (!alive) return;

        const topBrand = features.topBrand;
        const minP = features.minP;
        const maxP = features.maxP;
        const hasPrice = minP !== null && maxP !== null;

        const filtered = all
          .filter(v => {
            if (!topBrand && !hasPrice) return false;
            const brandMatch = topBrand ? formatKey(v.brand) === topBrand : true;
            const priceMatch = hasPrice
              ? (typeof v.price === 'number' && v.price >= minP * 0.85 && v.price <= maxP * 1.15)
              : true;
            return brandMatch && priceMatch;
          })
          .slice(0, 8);

        // If nothing found, fallback to latest
        const pick = filtered.length ? filtered : all.slice(0, 4);
        setVehicles(pick);
      } catch {
        setVehicles([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [features.topBrand, features.minP, features.maxP]);

  if (loading) return null;
  if (!vehicles.length) return null;

  return (
    <section className="section" style={{ paddingTop: 28 }}>
      <div className="wrap">
        <div className="section-head">
          <div>
            <div className="section-eyebrow">Pour vous</div>
            <h2 className="display">Recommandé pour vous</h2>
          </div>
          <div />
        </div>
        <div className="latest-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          {vehicles.map((vehicle) => (
            <Link key={vehicle.id} to={`/vehicule/${vehicle.id}`} className="vcard-link">
              <VehicleCard vehicle={vehicle} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}


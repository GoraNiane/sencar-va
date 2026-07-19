import { useEffect, useState, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { fetchVehicle, fetchVehicles, mediaUrl, fetchQrCode, downloadPdf } from '../api.js';
import VehicleGallery from '../components/VehicleGallery.jsx';
import { ClockIcon, RoadIcon, TagIcon, ShareIcon, WhatsAppIcon, ChevronLeftIcon, DownloadIcon } from '../components/Icons.jsx';
import SequentialFade from '../components/SequentialFade.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { useHaptic } from '../hooks/useHaptic.js';

const formatPrice = (value) => new Intl.NumberFormat('fr-FR').format(value);

export default function VehicleDetail() {
  const { id } = useParams();
  const [vehicle, setVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [qrUrl, setQrUrl] = useState(null);
  const [shareOpen, setShareOpen] = useState(false);
  const { light } = useHaptic();

  useEffect(() => {
    setLoading(true);
    setError(null);
    fetchVehicle(id)
      .then((v) => {
        setVehicle(v);
        // Save lightweight viewed info for recommendations (client-side only)
        try {
          const key = 'ae_viewed_vehicles';
          const raw = localStorage.getItem(key);
          const arr = raw ? JSON.parse(raw) : [];
          const next = Array.isArray(arr) ? arr : [];

          next.unshift({ id: v.id, brand: v.brand, price: v.price, t: Date.now() });
          const dedup = [];
          const seen = new Set();
          for (const item of next) {
            if (!item?.id) continue;
            if (seen.has(item.id)) continue;
            seen.add(item.id);
            dedup.push(item);
            if (dedup.length >= 18) break;
          }
          localStorage.setItem(key, JSON.stringify(dedup));
        } catch {}

        return fetchVehicles({ classification: v.classification });
      })
      .then((all) => {
        const sim = all.filter(x => x.id !== Number(id) && (x.brand === vehicle?.brand || (x.price && vehicle?.price && Math.abs(x.price - vehicle.price) < vehicle.price * 0.3)));
        setSimilar(sim.slice(0, 3));
      })
      .catch(() => setError('Impossible de charger ce véhicule.'))
      .finally(() => setLoading(false));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);


  useEffect(() => {
    if (!vehicle) return;
    fetchQrCode(vehicle.id).then(setQrUrl).catch(() => {});
  }, [vehicle]);

  useEffect(() => {
    if (!vehicle) return;
    document.title = `${vehicle.brand} ${vehicle.model} — Auto Elite`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', `${vehicle.brand} ${vehicle.model} ${vehicle.year || ''} - ${formatPrice(vehicle.mileage)} km, ${vehicle.transmission}. ${vehicle.price ? formatPrice(vehicle.price) + ' FCFA' : 'Prix sur commande'}. Véhicule ${vehicle.classification === 'dedouane' ? 'dédouané' : vehicle.classification}. Disponible chez Auto Elite, Abidjan.`);
    }

    const existing = document.getElementById('vehicle-schema');
    if (existing) existing.remove();

    const schema = {
      '@context': 'https://schema.org',
      '@type': 'Vehicle',
      name: `${vehicle.brand} ${vehicle.model}`,
      vehicleModel: vehicle.model,
      brand: { '@type': 'Brand', name: vehicle.brand },
      modelDate: vehicle.year,
      mileageFromOdometer: { '@type': 'QuantitativeValue', value: vehicle.mileage, unitCode: 'KMT' },
      transmissionText: vehicle.transmission,
      offers: {
        '@type': 'Offer',
        price: vehicle.price,
        priceCurrency: 'XOF',
        availability: vehicle.available ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut'
      }
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'vehicle-schema';
    script.text = JSON.stringify(schema);
    document.head.appendChild(script);

    return () => {
      const el = document.getElementById('vehicle-schema');
      if (el) el.remove();
    };
  }, [vehicle]);

  const pageUrl = typeof window !== 'undefined' ? window.location.href : '';
  const whatsappMsg = encodeURIComponent(`Bonjour, je suis intéressé par le véhicule ${vehicle?.brand} ${vehicle?.model} : ${pageUrl}`);

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: `${vehicle.brand} ${vehicle.model}`, url: pageUrl }); return; } catch {}
    }
    setShareOpen(!shareOpen);
  };

  const copyLink = () => {
    navigator.clipboard?.writeText(pageUrl);
    setShareOpen(false);
  };

  if (loading) return <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>Chargement...</div>;
  if (error || !vehicle) return <div className="wrap" style={{ padding: '60px 0', textAlign: 'center' }}>{error || 'Véhicule introuvable.'}</div>;

  return (
    <PageTransition>
      <div className="vehicle-detail-page">
        <div className="wrap" style={{ padding: '28px 0 12px' }}>
          <Link to="/#catalogue" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '8px 14px', fontSize: 13 }}>
            <ChevronLeftIcon width="14" height="14" /> Retour au catalogue
          </Link>
        </div>

        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="vehicle-detail-grid">
              <div className="vehicle-detail-gallery">
                <VehicleGallery vehicleId={vehicle.id} photos={vehicle.photos} videos={vehicle.videos} />
              </div>
              <div className="vehicle-detail-info">
                <div className="vcard-badges" style={{ marginBottom: 12 }}>
                  {vehicle.classification === 'dedouane' && <span className="badge-status badge-dedouane">Déjà dédouané</span>}
                  {vehicle.classification === 'sous_douane' && <span className="badge-status badge-sous-douane">Sous douane</span>}
                  {vehicle.classification === 'sur_commande' && <span className="badge-status badge-sur-commande">Sur commande</span>}
                  {!vehicle.available && <span className="badge-unavailable">Réservé</span>}
                </div>
                <h1 className="display vehicle-detail-title">{vehicle.brand} {vehicle.model}</h1>
                <div className="vehicle-detail-price mono">
                  {vehicle.classification === 'sur_commande' ? (
                    <span className="price-ask">Prix sur commande</span>
                  ) : (
                    `${formatPrice(vehicle.price)} <small>FCFA</small>`
                  )}
                </div>

                <div className="vehicle-detail-specs">
                  {vehicle.year && <div className="spec-item"><ClockIcon width="18" height="18" /><span className="mono">{vehicle.year}</span></div>}
                  <div className="spec-item"><RoadIcon width="18" height="18" /><span className="mono">{formatPrice(vehicle.mileage)} km</span></div>
                  <div className="spec-item"><TagIcon width="18" height="18" /><span>{vehicle.transmission}</span></div>
                </div>

                {vehicle.amenities?.length > 0 && (
                  <SequentialFade>
                    <div className="vcard-amenities" style={{ margin: '18px 0' }}>
                      {vehicle.amenities.map((a) => (
                        <span key={a} className="amenity-badge"><TagIcon width="11" height="11" />{a}</span>
                      ))}
                    </div>
                  </SequentialFade>
                )}

                {vehicle.comment && <p className="vcard-comment" style={{ marginBottom: 18 }}>{vehicle.comment}</p>}

                <div className="vehicle-detail-actions">
                  <a href={`tel:+22505090939`} className="btn-primary" onClick={() => light()}>Contacter le showroom</a>
                  <a href={`https://wa.me/22500000000?text=${whatsappMsg}`} target="_blank" rel="noopener" className="btn-secondary-hero" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }} onClick={() => light()}>
                    <WhatsAppIcon width="18" height="18" /> WhatsApp
                  </a>
                  <button type="button" className="btn-ghost" onClick={() => { light(); handleShare(); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <ShareIcon width="15" height="15" /> Partager
                  </button>
                  <button type="button" className="btn-ghost" onClick={() => { light(); downloadPdf(vehicle.id, `fiche-${vehicle.brand}-${vehicle.model}.pdf`); }} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                    <DownloadIcon width="15" height="15" /> PDF
                  </button>
                </div>

                {shareOpen && (
                  <div className="share-dropdown">
                    <button type="button" className="share-option" onClick={copyLink}>
                      <span>Copier le lien</span>
                    </button>
                  </div>
                )}

                {qrUrl && (
                  <div className="vehicle-qr">
                    <img src={qrUrl} alt="QR code" width="120" height="120" />
                    <span>Scannez pour partager</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {similar.length > 0 && (
          <section className="section" style={{ marginTop: 48 }}>
            <div className="wrap">
              <div className="section-head">
                <div>
                  <div className="section-eyebrow">Vous aimerez aussi</div>
                  <h2 className="display">Véhicules similaires</h2>
                </div>
              </div>
              <div className="vehicle-grid">
                {similar.map((v) => (
                  <Link key={v.id} to={`/vehicule/${v.id}`} className="vcard-link">
                    <article className="vcard">
                      <div className="vcard-body">
                        <h3>{v.brand} {v.model}</h3>
                        <div className="vcard-specs">
                          {v.year && <span className="mono"><ClockIcon />{v.year}</span>}
                          <span className="mono"><RoadIcon />{formatPrice(v.mileage)} km</span>
                          <span>{v.transmission}</span>
                        </div>
                        <div className="vcard-price mono">
                          {v.classification === 'sur_commande' ? <span className="price-ask">Prix sur commande</span> : `${formatPrice(v.price)} <small>FCFA</small>`}
                        </div>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </div>
    </PageTransition>
  );
}

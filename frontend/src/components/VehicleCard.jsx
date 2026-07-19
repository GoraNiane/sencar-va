import VehicleGallery from './VehicleGallery.jsx';
import { ClockIcon, RoadIcon, TagIcon } from './Icons.jsx';
import useTilt from '../hooks/useTilt.js';
import { useHaptic } from '../hooks/useHaptic.js';

const formatPrice = (value) => new Intl.NumberFormat('fr-FR').format(value);

export default function VehicleCard({ vehicle, staggerIndex = 0 }) {
  const { ref, onMouseMove, onMouseLeave } = useTilt({ max: 6 });
  const { light } = useHaptic();

  const {
    id,
    brand,
    model,
    year,
    mileage,
    transmission,
    price,
    available,
    amenities,
    comment,
    photos,
    videos,
    classification
  } = vehicle;

  return (
    <article ref={ref} onMouseMove={onMouseMove} onMouseLeave={onMouseLeave} className="vcard io-reveal vcard-tilt" data-stagger-index={staggerIndex} style={{ ['--stagger-ms']: String(staggerIndex * 65) + 'ms' }}>
      <div className="vcard-tilt-inner">
      <VehicleGallery vehicleId={id} photos={photos} videos={videos} />

      <div className="vcard-body">
        <div className="vcard-title-row">
          <h3>{brand} {model}</h3>
          <div className="vcard-badges">
            {classification === 'sous_douane' && <span className="badge-status badge-sous-douane">Sous douane</span>}
            {classification === 'sur_commande' && <span className="badge-status badge-sur-commande">Sur commande</span>}
            {!available && <span className="badge-unavailable">Réservé</span>}
          </div>
        </div>

        <div className="vcard-specs">
          {year && <span className="mono"><ClockIcon />{year}</span>}
          <span className="mono"><RoadIcon />{formatPrice(mileage)} km</span>
          <span>{transmission}</span>
        </div>

        {amenities?.length > 0 && (
          <div className="vcard-amenities">
            {amenities.map((a) => (
              <span key={a} className="amenity-badge"><TagIcon width="11" height="11" />{a}</span>
            ))}
          </div>
        )}

        {comment && <p className="vcard-comment">{comment}</p>}

        <div className="vcard-price mono">
          {classification === 'sur_commande' ? (
            <span className="price-ask">Prix sur commande</span>
          ) : (
            <>
              {formatPrice(price)} <small>FCFA</small>
            </>
          )}
        </div>
        <a href={`tel:+22505090939`} className="vcard-cta" onClick={() => light()}>
          {classification === 'sur_commande' ? 'Commander' : 'Contacter le showroom'}
        </a>
      </div>
      </div>
    </article>
  );
}

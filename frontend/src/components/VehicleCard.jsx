import VehicleGallery from './VehicleGallery.jsx';
import { ClockIcon, RoadIcon, TagIcon } from './Icons.jsx';

const formatPrice = (value) => new Intl.NumberFormat('fr-FR').format(value);
const STATUS_LABELS = {
  en_mer: 'En mer',
  en_dedouanement: 'En dédouanement',
  disponible: 'Disponible'
};
const STATUS_CLASSES = {
  en_mer: 'badge-status badge-sous-douane',
  en_dedouanement: 'badge-status badge-sur-commande',
  disponible: 'badge-status badge-dedouane'
};

export default function VehicleCard({ vehicle }) {
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
    classification,
    status
  } = vehicle;

  const statusLabel = STATUS_LABELS[status] || STATUS_LABELS.disponible;
  const statusClass = STATUS_CLASSES[status] || STATUS_CLASSES.disponible;

  return (
    <article className="vcard">
      <VehicleGallery vehicleId={id} photos={photos} videos={videos} />

      <div className="vcard-body">
        <div className="vcard-title-row">
          <h3>{brand} {model}</h3>
          <div className="vcard-badges">
            <span className={statusClass}>{statusLabel}</span>
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
            {amenities.slice(0, 6).map((a) => (
              <span key={a} className="amenity-badge"><TagIcon width="11" height="11" />{a}</span>
            ))}
            {amenities.length > 6 && (
              <span className="amenity-badge amenity-badge-more">+{amenities.length - 6}</span>
            )}
          </div>
        )}

        {comment && <p className="vcard-comment">{comment}</p>}

        {classification !== 'sur_commande' && (
          <div className="vcard-price mono">
            {formatPrice(price)} <small>FCFA</small>
          </div>
        )}
        <a href={`tel:+22505090939`} className="vcard-cta">
          {classification === 'sur_commande' ? 'Appeler la compagnie' : 'Contacter le showroom'}
        </a>
      </div>
    </article>
  );
}

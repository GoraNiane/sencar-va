import { useState } from 'react';
import { deleteVehicle } from '../api.js';
import { EditIcon, TrashIcon, CameraIcon, VideoIcon } from './Icons.jsx';
import MediaManager from './MediaManager.jsx';

const formatPrice = (value) => new Intl.NumberFormat('fr-FR').format(value);

const getClassificationLabel = (val) => {
  switch (val) {
    case 'sous_douane': return 'Sous douane';
    case 'sur_commande': return 'Sur commande';
    case 'dedouane':
    default:
      return 'Dédouanée';
  }
};

export default function AdminVehicleList({ vehicles, onEdit, onChanged }) {
  const [expandedId, setExpandedId] = useState(null);

  const remove = async (id) => {
    if (!window.confirm('Supprimer définitivement ce véhicule et ses médias ?')) return;
    try {
      await deleteVehicle(id);
      onChanged();
    } catch (err) {
      alert(err.message || 'Une erreur est survenue lors de la suppression.');
    }
  };

  if (vehicles.length === 0) {
    return <p className="vehicle-empty">Aucun véhicule enregistré pour le moment.</p>;
  }

  return (
    <div className="admin-list">
      {vehicles.map((v) => (
        <div className="admin-list-item" key={v.id}>
          <div className="admin-list-row">
            <div>
              <h4>
                {v.brand} {v.model} 
                <span className="mono"> — {v.classification === 'sur_commande' ? 'Sur commande (Prix sur demande)' : `${formatPrice(v.price)} FCFA`}</span>
              </h4>
              <div className="admin-list-meta">
                <span>{v.year || '—'}</span>
                <span>{formatPrice(v.mileage)} km</span>
                <span>{v.transmission}</span>
                <span className={v.available ? 'tag-available' : 'tag-unavailable'}>
                  {v.available ? 'Disponible' : 'Réservé'}
                </span>
                <span className={`badge-status badge-${v.classification || 'dedouane'}`}>
                  {getClassificationLabel(v.classification)}
                </span>
                <span><CameraIcon width="12" height="12" /> {v.photos.length}</span>
                <span><VideoIcon width="12" height="12" /> {v.videos.length}</span>
              </div>
            </div>
            <div className="admin-list-actions">
              <button type="button" onClick={() => setExpandedId(expandedId === v.id ? null : v.id)}>
                {expandedId === v.id ? 'Fermer les médias' : 'Gérer les médias'}
              </button>
              <button type="button" onClick={() => onEdit(v)} aria-label="Modifier">
                <EditIcon width="15" height="15" />
              </button>
              <button type="button" onClick={() => remove(v.id)} aria-label="Supprimer" className="btn-danger">
                <TrashIcon width="15" height="15" />
              </button>
            </div>
          </div>
          {expandedId === v.id && (
            <MediaManager vehicle={v} onChanged={onChanged} />
          )}
        </div>
      ))}
    </div>
  );
}

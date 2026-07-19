import { mediaUrl, deleteMedia } from '../api.js';
import { TrashIcon } from './Icons.jsx';

export default function MediaManager({ vehicle, onChanged }) {
  const remove = async (type, filename) => {
    await deleteMedia(vehicle.id, type, filename);
    onChanged();
  };

  if (vehicle.photos.length === 0 && vehicle.videos.length === 0) {
    return <p className="upload-hint">Aucun média en ligne pour ce véhicule.</p>;
  }

  return (
    <div className="media-manager">
      {vehicle.photos.map((filename) => (
        <div className="media-thumb" key={filename}>
          <img src={mediaUrl(vehicle.id, filename)} alt="" />
          <button type="button" onClick={() => remove('photo', filename)} aria-label="Supprimer la photo">
            <TrashIcon width="13" height="13" />
          </button>
        </div>
      ))}
      {vehicle.videos.map((filename) => (
        <div className="media-thumb media-thumb-video" key={filename}>
          <video src={mediaUrl(vehicle.id, filename)} />
          <button type="button" onClick={() => remove('video', filename)} aria-label="Supprimer la vidéo">
            <TrashIcon width="13" height="13" />
          </button>
        </div>
      ))}
    </div>
  );
}

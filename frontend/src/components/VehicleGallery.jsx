import { useMemo, useState } from 'react';
import { mediaUrl } from '../api.js';
import { ChevronLeftIcon, ChevronRightIcon, CameraIcon, VideoIcon } from './Icons.jsx';

// Combine photos + vidéos en une seule piste de médias pour le carrousel
export default function VehicleGallery({ vehicleId, photos = [], videos = [] }) {
  const media = useMemo(() => (
    [
      ...photos.map((f) => ({ type: 'photo', filename: f })),
      ...videos.map((f) => ({ type: 'video', filename: f }))
    ]
  ), [photos, videos]);

  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(null); // { type, filename }

  if (media.length === 0) {
    return (
      <div className="vcard-media vcard-media-empty">
        <CameraIcon width="28" height="28" />
        <span>Photos à venir</span>
      </div>
    );
  }

  const current = media[index];
  const prev = () => setIndex((i) => (i === 0 ? media.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === media.length - 1 ? 0 : i + 1));

  return (
    <div className="vcard-media">
      <div className="gallery-crossfade" key={`${current.type}-${current.filename}`}> 
        {current.type === 'photo' ? (
          <button
            type="button"
            className="gallery-lightbox-btn"
            onClick={() => setLightbox(current)}
            aria-label="Voir la photo en plein écran"
          >
            <img src={mediaUrl(vehicleId, current.filename)} alt="Photo du véhicule" />
          </button>
        ) : (
          <video src={mediaUrl(vehicleId, current.filename)} controls />
        )}
      </div>

      {media.length > 1 && (
        <>
          <button type="button" className="gallery-nav gallery-nav-prev" onClick={prev} aria-label="Média précédent">
            <ChevronLeftIcon width="16" height="16" />
          </button>
          <button type="button" className="gallery-nav gallery-nav-next" onClick={next} aria-label="Média suivant">
            <ChevronRightIcon width="16" height="16" />
          </button>
          <div className="gallery-dots">
            {media.map((m, i) => (
              <span
                key={`${m.type}-${m.filename}`}
                className={`gallery-dot ${i === index ? 'active' : ''}`}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}

      <div className="gallery-count">
        <CameraIcon width="12" height="12" /> {photos.length}
        {videos.length > 0 && (
          <>
            <VideoIcon width="12" height="12" style={{ marginLeft: 8 }} /> {videos.length}
          </>
        )}
      </div>

      {lightbox?.type === 'photo' && (
        <div
          className="lightbox"
          role="dialog"
          aria-modal="true"
          aria-label="Photo plein écran"
          onClick={() => setLightbox(null)}
        >
          <div className="lightbox-inner" onClick={(e) => e.stopPropagation()}>
            <button type="button" className="lightbox-close" onClick={() => setLightbox(null)} aria-label="Fermer">
              ×
            </button>
            <img
              src={mediaUrl(vehicleId, lightbox.filename)}
              alt="Photo du véhicule en plein écran"
            />
          </div>
        </div>
      )}
    </div>
  );
}


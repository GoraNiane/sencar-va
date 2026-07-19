import { CameraIcon, ShieldIcon, TagIcon, VideoIcon } from './Icons.jsx';

const TRUST_ITEMS = [
  { icon: ShieldIcon, title: 'Déjà importées', text: 'Toutes nos voitures sont dédouanées et disponibles sur place.' },
  { icon: CameraIcon, title: 'Photos réelles', text: 'Prises directement au showroom, sans retouche.' },
  { icon: VideoIcon, title: 'Vidéos à l\u2019appui', text: 'Un aperçu filmé pour chaque véhicule disponible.' },
  { icon: TagIcon, title: 'Prix affiché', text: 'Aucune négociation cachée, le prix est clair dès le départ.' }
];

export default function TrustStrip() {
  return (
    <div className="trust-strip io-reveal" data-stagger-index={0}>
      <div className="wrap trust-grid">
        {TRUST_ITEMS.map(({ icon: Icon, title, text }) => (
          <div className="trust-item" key={title}>
            <Icon />
            <div><h4>{title}</h4><p>{text}</p></div>
          </div>
        ))}
      </div>
    </div>
  );
}

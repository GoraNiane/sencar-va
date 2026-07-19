import SearchCard from './SearchCard.jsx';
import { ArrowRightIcon, CameraIcon } from './Icons.jsx';
import { useHaptic } from '../hooks/useHaptic.js';

export default function Hero({ onSearch }) {
  const { light } = useHaptic();
  return (
    <section className="hero">
      <div className="wrap">
        <div className="hero-grid">
          <div className="hero-content hero-entrance">
            <div className="eyebrow hero-entrance-item">Showroom Auto Elite — Abidjan</div>
            <h1 className="display hero-entrance-item">
              Nos voitures déjà<br />importées, <em>en exposition</em>.
            </h1>
            <p className="hero-entrance-item">
              Découvrez le catalogue avec photos et vidéos réelles prises au
              showroom, prix affiché et commodités détaillées pour chaque véhicule.
            </p>
            <div className="hero-ctas hero-entrance-item">
              <a href="#catalogue" className="btn-primary hero-ripple" onClick={() => light()}>
                Voir les véhicules
                <ArrowRightIcon width="15" height="15" />
              </a>
              <a href="tel:+22505090939" className="btn-secondary-hero hero-ripple" onClick={() => light()}>Appeler le showroom</a>
            </div>
          </div>
          <div className="hero-visual hero-visual-rotate">
            <img src="/images/hero-showroom.png" alt="Showroom Auto Elite" className="hero-img" />
            <div className="verified-tag hero-verified-pulse">
              <CameraIcon width="13" height="13" />
              Photos & vidéos réelles
            </div>
          </div>
        </div>

        <SearchCard onSearch={onSearch} />
      </div>
    </section>
  );
}


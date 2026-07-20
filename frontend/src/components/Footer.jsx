import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer>
      <div className="wrap footer-top">
        <div className="footer-brand">
          <div className="logo-text display">AUTO ELITE</div>
          <p>Concessionnaire de véhicules neufs et d'occasion, vérifiés et garantis, au cœur d'Abidjan.</p>
        </div>
        <div className="footer-col">
          <h5>Navigation</h5>
          <a href="/">Accueil</a>
          <a href="/#catalogue">Véhicules</a>
          <a href="/#faq">FAQ</a>
          <a href="/#actualites">Actualités</a>
        </div>
        <div className="footer-col">
          <h5>Showroom Cocody</h5>
          <p>Dakar - mariste</p>
          <a href="tel:+22505090939">+221  774888464</a>
          <a href="mailto:contact@autoelite.ci">goraniane35@gmail</a>
        </div>
        <div className="footer-col">
          <h5>Légal</h5>
          <Link to="/legal/mentions">Mentions légales</Link>
          <Link to="/legal/privacy">Confidentialité</Link>
          <Link to="/legal/cgv">CGV</Link>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 Auto Elite. Tous droits réservés.</span>
      </div>
    </footer>
  );
}

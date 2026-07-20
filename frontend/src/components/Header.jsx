import { Link } from 'react-router-dom';

export default function Header() {
  return (
    <header>
      <div className="header-inner">
        <Link to="/" className="logo">
          <img src="/images/logo.png" alt="Auto Elite" className="header-logo" />
        </Link>
        <nav>
          <a href="/#catalogue">Véhicules</a>
          <a href="/#faq">FAQ</a>
          <a href="/#actualites">Actualités</a>
          <a href="/#contact">Contact</a>
        </nav>
        <div className="header-actions">
          <a
            href="https://wa.me/221774888464"
            target="_blank"
            rel="noopener"
            className="btn-ghost"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            WhatsApp
          </a>
        </div>
      </div>
    </header>
  );
}
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
          <Link to="/#contact">Contact</Link>
        </nav>
        <div className="header-actions">
          <a href="https://wa.me/22500000000" target="_blank" rel="noopener" className="btn-ghost" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            WhatsApp
          </a>
          <Link to="/admin" className="btn-ghost">Espace admin</Link>
        </div>
      </div>
    </header>
  );
}

import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useRef, useCallback, useState } from 'react';

export default function Header() {
  const navigate = useNavigate();
  const clickCount = useRef(0);
  const clickTimer = useRef(null);
  const [visualCount, setVisualCount] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  const closeMenu = useCallback(() => setMenuOpen(false), []);

  // Empêche le scroll du body quand le menu mobile est ouvert
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  // Secret: Clic 5 fois rapidement sur le logo pour accéder à l'admin
  const handleLogoSecretClick = useCallback((e) => {
    clickCount.current += 1;
    const current = clickCount.current;

    // Évite la navigation vers "/" qui réinitialiserait le compteur
    e.preventDefault();

    setVisualCount(current);

    if (current >= 5) {
      clickCount.current = 0;
      setVisualCount(0);
      clearTimeout(clickTimer.current);
      navigate('/admin/login');
    } else {
      clearTimeout(clickTimer.current);
      clickTimer.current = setTimeout(() => {
        clickCount.current = 0;
        setVisualCount(0);
      }, 1000);
    }
  }, [navigate]);

  // Secret: Raccourci clavier Ctrl+Shift+A pour accéder à l'admin
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignorer le raccourci si l'utilisateur est en train de taper dans un champ de saisie
      const activeEl = document.activeElement;
      if (
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
         activeEl.tagName === 'TEXTAREA' ||
         activeEl.tagName === 'SELECT' ||
         activeEl.isContentEditable)
      ) {
        return;
      }

      if (e.ctrlKey && e.shiftKey && (e.key === 'A' || e.key === 'a')) {
        e.preventDefault();
        navigate('/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [navigate]);

  return (
    <header>
      <div className="header-inner">
        <Link to="/" className="logo" onClick={(e) => { handleLogoSecretClick(e); closeMenu(); }}>
          <img
            src="/images/logo.png"
            alt="Auto Elite"
            className="header-logo"
            style={{
              transform: visualCount > 0
                ? `scale(${1 + visualCount * 0.04}) rotate(${visualCount % 2 === 0 ? -6 : 6}deg)`
                : undefined,
              transition: visualCount > 0
                ? 'transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
                : undefined
            }}
          />
        </Link>
        <nav>
          <a href="/#catalogue" onClick={closeMenu}>Véhicules</a>
          <a href="/#faq" onClick={closeMenu}>FAQ</a>
          <a href="/#actualites" onClick={closeMenu}>Actualités</a>
          <a href="/#contact" onClick={closeMenu}>Contact</a>
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
          <button
            type="button"
            className={`hamburger-btn ${menuOpen ? 'active' : ''}`}
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            <span></span>
            <span></span>
            <span></span>
          </button>
        </div>
      </div>

      {/* Mobile navigation overlay */}
      <div
        className={`mobile-nav-overlay ${menuOpen ? 'open' : ''}`}
        onClick={closeMenu}
      />

      {/* Mobile navigation drawer */}
      <nav className={`mobile-nav ${menuOpen ? 'open' : ''}`}>
        <button type="button" className="mobile-nav-close" onClick={closeMenu} aria-label="Fermer le menu">
          ×
        </button>
        <a href="/#catalogue" onClick={closeMenu}>Véhicules</a>
        <a href="/#faq" onClick={closeMenu}>FAQ</a>
        <a href="/#actualites" onClick={closeMenu}>Actualités</a>
        <a href="/#contact" onClick={closeMenu}>Contact</a>
        <a href="https://wa.me/221774888464" target="_blank" rel="noopener" onClick={closeMenu}>
          WhatsApp
        </a>
      </nav>
    </header>
  );
}
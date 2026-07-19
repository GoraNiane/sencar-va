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
          <h5>Suivez-nous</h5>
          <div className="socials">
            <a href="#" aria-label="Facebook">
              <svg viewBox="0 0 24 24" fill="currentColor" width="14" height="14">
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V8c0-.9.25-1.5 1.55-1.5H17V3.7C16.6 3.65 15.6 3.5 14.4 3.5c-2.5 0-4.1 1.5-4.1 4.3v2.1H7.6V13h2.7v8h3.2z" />
              </svg>
            </a>
            <a href="#" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.2" cy="6.8" r="1" />
              </svg>
            </a>
            <a href="#" aria-label="X">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" width="14" height="14">
                <path d="M4 4l16 16M20 4L4 20" />
              </svg>
            </a>
          </div>
        </div>
      </div>
      <div className="wrap footer-bottom">
        <span>© 2026 Auto Elite. Tous droits réservés.</span>
      </div>
    </footer>
  );
}

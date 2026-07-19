import { useEffect, useState } from 'react';
import { CheckIcon } from './Icons.jsx';

export default function SuccessToast({ message, onClose }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const t1 = window.setTimeout(() => setVisible(false), 2200);
    const t2 = window.setTimeout(() => onClose?.(), 2400);
    return () => { window.clearTimeout(t1); window.clearTimeout(t2); };
  }, [onClose]);

  if (!visible) return null;

  const pieces = Array.from({ length: 14 }).map((_, i) => ({
    id: i,
    left: `${30 + Math.random() * 40}%`,
    top: `${20 + Math.random() * 20}%`,
    bg: ['#D9531E', '#B8862B', '#2F6B4F', '#101B2D', '#F6F3EC'][i % 5],
    delay: `${Math.random() * 0.25}s`,
    duration: `${1 + Math.random() * 0.6}s`,
  }));

  return (
    <div className="success-overlay" role="status" aria-live="polite">
      {pieces.map((p) => (
        <span
          key={p.id}
          className="confetti-piece"
          style={{ left: p.left, top: p.top, background: p.bg, animationDelay: p.delay, animationDuration: p.duration }}
        />
      ))}
      <div className="success-card">
        <div className="success-icon">
          <CheckIcon width="28" height="28" />
        </div>
        <h3>Succès</h3>
        <p>{message || 'Votre demande a été envoyée.'}</p>
      </div>
    </div>
  );
}

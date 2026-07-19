import { useEffect, useState } from 'react';

export default function StartupSplash({ durationMs = 1000 }) {
  const [visible, setVisible] = useState(true);
  const [closing, setClosing] = useState(false);

  useEffect(() => {
    const t1 = window.setTimeout(() => setClosing(true), Math.max(0, durationMs - 180));
    const t2 = window.setTimeout(() => setVisible(false), durationMs);
    return () => {
      window.clearTimeout(t1);
      window.clearTimeout(t2);
    };
  }, [durationMs]);

  if (!visible) return null;

  return (
    <div className={`startup-splash ${closing ? 'startup-splash--closing' : ''}`}>
      <img src="/images/logo.png" alt="Auto Elite" className="startup-splash-logo-img" />
    </div>
  );
}


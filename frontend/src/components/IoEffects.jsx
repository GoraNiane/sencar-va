import { useEffect } from 'react';

// Generic IntersectionObserver helper for performance-friendly reveal/counters.
// - Reveal: add .io-reveal elements with optional data-stagger-index.
// - Counters: add .io-counter with data-target-number (number as string).
export default function IoEffects() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;

    // Reveal elements
    const revealEls = Array.from(document.querySelectorAll('.io-reveal'));
    if (revealEls.length) {
      for (const el of revealEls) {
        el.classList.add('io-reveal--init');
        if (reduceMotion) el.classList.remove('io-reveal--init');
      }

      if (!reduceMotion) {
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                entry.target.classList.add('io-reveal--in');
                io.unobserve(entry.target);
              }
            }
          },
          { threshold: 0.12, rootMargin: '40px 0px -10% 0px' }
        );
        for (const el of revealEls) io.observe(el);
      }
    }

    // Counters
    const counterEls = Array.from(document.querySelectorAll('.io-counter'));
    if (counterEls.length) {
      for (const el of counterEls) {
        const target = Number(el.dataset.targetNumber);
        if (!Number.isFinite(target)) continue;
        el.textContent = '0';
      }

      if (!reduceMotion) {
        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (!entry.isIntersecting) continue;
              const el = entry.target;
              const target = Number(el.dataset.targetNumber);
              if (!Number.isFinite(target)) return;

              const start = performance.now();
              const duration = 900; // ms

              const fmt = (n) => {
                const isInt = Math.abs(target - Math.round(target)) < 1e-6;
                if (isInt) return Math.round(n).toString();
                return n.toFixed(1);
              };

              const tick = (t) => {
                const p = Math.min(1, (t - start) / duration);
                // easeOutCubic
                const eased = 1 - Math.pow(1 - p, 3);
                const v = target * eased;
                el.textContent = fmt(v);
                if (p < 1) requestAnimationFrame(tick);
              };

              requestAnimationFrame(tick);
              io.unobserve(el);
            }
          },

          { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
        );

        for (const el of counterEls) io.observe(el);
      } else {
        for (const el of counterEls) {
          const target = Number(el.dataset.targetNumber);
          if (Number.isFinite(target)) el.textContent = String(target);
        }
      }
    }

    return () => {
      // observers are disconnected when effect unmounts
    };
  }, []);

  return null;
}


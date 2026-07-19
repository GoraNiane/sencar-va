import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const cursorRef = useRef(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    let x = 0, y = 0;
    let currentX = 0, currentY = 0;
    const ease = 0.18;

    const onMove = (e) => {
      x = e.clientX;
      y = e.clientY;
    };

    const onOver = (e) => {
      const target = e.target;
      if (!target) return;
      const tag = target.tagName.toLowerCase();
      const isClickable =
        target.closest('a, button, [role="button"], input, select, textarea, .vcard-link, .gallery-dot, .gallery-nav') ||
        target.hasAttribute('onclick');
      const isText = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.getAttribute('contenteditable') === 'true';

      cursor.classList.remove('ae-cursor--clickable', 'ae-cursor--text');
      if (isText) cursor.classList.add('ae-cursor--text');
      else if (isClickable) cursor.classList.add('ae-cursor--clickable');
    };

    const onOut = () => {
      cursor.classList.remove('ae-cursor--clickable', 'ae-cursor--text');
    };

    const animate = () => {
      currentX += (x - currentX) * ease;
      currentY += (y - currentY) * ease;
      cursor.style.transform = `translate(${currentX}px, ${currentY}px) translate(-50%, -50%)`;
      requestAnimationFrame(animate);
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseover', onOver, { passive: true });
    document.addEventListener('mouseout', onOut, { passive: true });

    requestAnimationFrame(animate);

    return () => {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseover', onOver);
      document.removeEventListener('mouseout', onOut);
    };
  }, []);

  return <div ref={cursorRef} className="ae-cursor" aria-hidden="true" />;
}

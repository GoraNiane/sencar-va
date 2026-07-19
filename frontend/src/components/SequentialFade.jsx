import { useEffect, useRef, useState } from 'react';

export default function SequentialFade({ children, once = true }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setIsVisible(true); if (once) observer.disconnect(); } },
      { threshold: 0.12 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [once]);

  return (
    <div ref={ref} className={`seq-fade ${isVisible ? 'is-visible' : ''}`}>
      {children}
    </div>
  );
}

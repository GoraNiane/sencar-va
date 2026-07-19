import { useEffect, useRef, useState } from 'react';

export default function ScrollTimeline({ children }) {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className={`timeline ${isVisible ? 'is-visible' : ''}`}>
      <div className="timeline-line" />
      {children}
    </div>
  );
}

export function TimelineItem({ children }) {
  return (
    <div className="timeline-item">
      <span className="timeline-dot" />
      <div className="timeline-content">{children}</div>
    </div>
  );
}

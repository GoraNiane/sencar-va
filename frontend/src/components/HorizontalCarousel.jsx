import { useEffect, useRef, useState } from 'react';

export default function HorizontalCarousel({ items, renderItem }) {
  const trackRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const updateActive = () => {
    const track = trackRef.current;
    if (!track) return;
    const index = Math.round(track.scrollLeft / (track.firstChild?.offsetWidth || 320));
    setActiveIndex(Math.min(index, items.length - 1));
  };

  const handleDotClick = (i) => {
    const track = trackRef.current;
    if (!track) return;
    track.scrollTo({ left: i * (track.firstChild?.offsetWidth || 320), behavior: 'smooth' });
  };

  return (
    <div>
      <div className="hcarousel" ref={trackRef} onScroll={updateActive}>
        {items.map((item, i) => (
          <div key={i} className="hcarousel-item">
            {renderItem(item, i)}
          </div>
        ))}
      </div>
      {items.length > 1 && (
        <div className="hcarousel-dots">
          {items.map((_, i) => (
            <button key={i} type="button" className={`hcarousel-dot ${i === activeIndex ? 'active' : ''}`} onClick={() => handleDotClick(i)} aria-label={`Aller à l'élément ${i + 1}`} />
          ))}
        </div>
      )}
    </div>
  );
}

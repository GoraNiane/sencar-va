export default function useTilt({ max = 8, perspective = 1200 } = {}) {
  const ref = typeof window !== 'undefined' ? { current: null } : { current: null };

  const handleMove = (e) => {
    const el = ref.current;
    if (!el || !el.isConnected) return;
    if (window.matchMedia('(hover: none)').matches) return;

    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -max;
    const rotateY = ((x - centerX) / centerX) * max;

    el.style.transform = `perspective(${perspective}px) rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  };

  const handleLeave = () => {
    const el = ref.current;
    if (!el) return;
    el.style.transform = 'perspective(1200px) rotateX(0deg) rotateY(0deg)';
  };

  return {
    ref,
    onMouseMove: handleMove,
    onMouseLeave: handleLeave,
  };
}

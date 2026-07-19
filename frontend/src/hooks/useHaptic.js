export function useHaptic() {
  const vibrate = (pattern = 12) => {
    try {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(pattern);
      }
    } catch {}
  };

  const light = () => vibrate(8);
  const medium = () => vibrate(15);
  const heavy = () => vibrate(25);

  return { vibrate, light, medium, heavy };
}

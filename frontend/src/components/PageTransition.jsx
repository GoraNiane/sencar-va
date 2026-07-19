import { useState } from 'react';

export default function PageTransition({ children }) {
  const [status, setStatus] = useState('in'); // in | out

  return (
    <div className={`page-${status}`}>
      {children}
    </div>
  );
}

export function usePageTransition() {
  return {
    PageTransition,
  };
}

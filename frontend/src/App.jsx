import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import PublicSite from './pages/PublicSite.jsx';
import AdminPage from './pages/AdminPage.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import PageTransition from './components/PageTransition.jsx';

function RouteTransition({ children }) {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState('in');

  useEffect(() => {
    if (location.pathname === displayLocation.pathname) return;
    setTransitionStage('out');
    const t = window.setTimeout(() => {
      setDisplayLocation(location);
      setTransitionStage('in');
    }, 250);
    return () => window.clearTimeout(t);
  }, [location, displayLocation]);

  return (
    <div className={`page-${transitionStage}`} key={displayLocation.pathname}>
      {children}
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicSite />} />
      <Route path="/vehicule/:id" element={<RouteTransition><VehicleDetail /></RouteTransition>} />
      <Route path="/admin" element={<AdminPage />} />
    </Routes>
  );
}

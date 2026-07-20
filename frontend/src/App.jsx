import { Routes, Route } from 'react-router-dom';
import StartupSplash from './components/StartupSplash.jsx';
import PublicSite from './pages/PublicSite.jsx';
import AdminLogin from './pages/AdminLogin.jsx';
import AdminPage from './pages/AdminPage.jsx';
import VehicleDetail from './pages/VehicleDetail.jsx';
import LegalPage from './pages/LegalPage.jsx';

export default function App() {
  return (
    <>
      <StartupSplash durationMs={1500} />
      <Routes>
        <Route path="/" element={<PublicSite />} />
        <Route path="/vehicule/:id" element={<VehicleDetail />} />
        <Route path="/legal/:page" element={<LegalPage />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </>
  );
}

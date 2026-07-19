import { useEffect, useState } from 'react';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import VehicleGrid from '../components/VehicleGrid.jsx';
import TrustStrip from '../components/TrustStrip.jsx';
import Footer from '../components/Footer.jsx';
import StartupSplash from '../components/StartupSplash.jsx';
import FaqSection from '../components/FaqSection.jsx';
import PartnersSection from '../components/PartnersSection.jsx';
import NewsSection from '../components/NewsSection.jsx';
import AlertForm from '../components/AlertForm.jsx';
import ArrivalQuickQuestionnaire from '../components/ArrivalQuickQuestionnaire.jsx';
import RecommendedForYou from '../components/RecommendedForYou.jsx';
import IoEffects from '../components/IoEffects.jsx';
import CustomCursor from '../components/CustomCursor.jsx';


export default function PublicSite() {
  const [filters, setFilters] = useState({ q: '', transmission: 'Toutes', classification: 'Toutes', available: '' });
  const [showArrivalQuestionnaire, setShowArrivalQuestionnaire] = useState(false);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    try {
      const done = localStorage.getItem('ae_arrival_questionnaire_done');
      setShowArrivalQuestionnaire(!done);
    } catch {
      setShowArrivalQuestionnaire(true);
    }
  }, []);
  useEffect(() => {
    const id = window.setTimeout(() => setStarted(true), 10000);
    return () => window.clearTimeout(id);
  }, []);

  return (
    <>
      {!started && <StartupSplash durationMs={10000} />}

      {started && (
        <>
          <Header />
          <Hero onSearch={setFilters} />
          <IoEffects />
          <CustomCursor />
        </>
      )}

      {started && showArrivalQuestionnaire && (
        <ArrivalQuickQuestionnaire
          onApplyFilters={(next) => setFilters((prev) => ({ ...prev, ...next }))}
        />
      )}

      {started && <RecommendedForYou />}
      {started && <VehicleGrid filters={filters} />}
      {started && <PartnersSection />}
      {started && <NewsSection />}
      {started && <FaqSection />}
      {started && <AlertForm />}
      {started && <TrustStrip />}
      {started && <Footer />}
    </>
  );
}


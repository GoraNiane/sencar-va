import { useState } from 'react';
import Header from '../components/Header.jsx';
import Hero from '../components/Hero.jsx';
import VehicleGrid from '../components/VehicleGrid.jsx';
import TrustStrip from '../components/TrustStrip.jsx';
import Footer from '../components/Footer.jsx';
import FaqSection from '../components/FaqSection.jsx';
import PartnersSection from '../components/PartnersSection.jsx';
import NewsSection from '../components/NewsSection.jsx';
import AlertForm from '../components/AlertForm.jsx';
import TradeInForm from '../components/TradeInForm.jsx';
import AppointmentForm from '../components/AppointmentForm.jsx';
import ChatWidget from '../components/ChatWidget.jsx';

export default function PublicSite() {
  const [filters, setFilters] = useState({ q: '', transmission: 'Toutes', classification: 'Toutes', available: '' });

  return (
    <>
      <Header />
      <Hero onSearch={setFilters} />
      <VehicleGrid filters={filters} />
      <PartnersSection />
      <NewsSection />
      <section className="section forms-section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-eyebrow">Services</div>
              <h2 className="display">Reprise & Rendez-vous</h2>
            </div>
          </div>
          <div className="forms-grid">
            <TradeInForm />
            <AppointmentForm />
          </div>
        </div>
      </section>
      <FaqSection />
      <AlertForm />
      <TrustStrip />
      <ChatWidget />
      <Footer />
    </>
  );
}

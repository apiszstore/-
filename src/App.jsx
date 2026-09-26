import { useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Hero from './components/Hero.jsx';
import QuickInfo from './components/QuickInfo.jsx';
import Services from './components/Services.jsx';
import SampServices from './components/SampServices.jsx';
import OtherServices from './components/OtherServices.jsx';
import ProductCatalog from './components/ProductCatalog.jsx';
import Pricing from './components/Pricing.jsx';
import Showcase from './components/Showcase.jsx';
import Testimonials from './components/Testimonials.jsx';
import HowToOrder from './components/HowToOrder.jsx';
import Payment from './components/Payment.jsx';
import Faq from './components/Faq.jsx';
import CtaSection from './components/CtaSection.jsx';
import Footer from './components/Footer.jsx';
import Toaster from './components/Toaster.jsx';
import { scrollToSection } from './lib/scroll.js';

export default function App() {
  /* Deep link: buka #products langsung scroll ke section itu.
     Scroll ditunda satu frame supaya section sudah ter-render. */
  useEffect(() => {
    const applyHash = () => {
      const id = window.location.hash.replace('#', '');
      if (!id) return;
      requestAnimationFrame(() => scrollToSection(id));
    };

    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-md focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-brand-ink"
      >
        Lewati ke konten utama
      </a>

      <Navbar />

      <main id="main">
        <Hero />
        <QuickInfo />
        <Services />
        <SampServices />
        <OtherServices />
        <ProductCatalog />
        <Pricing />
        <Showcase />
        <Testimonials />
        <HowToOrder />
        <Payment />
        <Faq />
        <CtaSection />
      </main>

      <Footer />
      <Toaster />
    </>
  );
}

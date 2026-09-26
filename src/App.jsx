import { useEffect } from 'react';
import { useApp } from './context/AppContext';
import About from './components/About';
import Contact from './components/Contact';
import DigitalService from './components/DigitalService';
import Faq from './components/Faq';
import Footer from './components/Footer';
import Hero from './components/Hero';
import Loader from './components/Loader';
import Navbar from './components/Navbar';
import OrderModal from './components/OrderModal';
import Payment from './components/Payment';
import Pricing from './components/Pricing';
import ProductCatalog from './components/ProductCatalog';
import ProductDetail from './components/ProductDetail';
import Promotion from './components/Promotion';
import SampServices from './components/SampServices';
import ScrollToTop from './components/ScrollToTop';
import Services from './components/Services';
import Showcase from './components/Showcase';
import Testimonials from './components/Testimonials';
import { HOME_SECTIONS } from './lib/sections';

/** Daftar section di halaman Home (urutan tampil). */
const HOME_BLOCKS = [
  ['services', Services],
  ['digital', DigitalService],
  ['samp', SampServices],
  ['pricing', Pricing],
  ['payment', Payment],
  ['showcase', Showcase],
  ['testimonials', Testimonials],
  ['about', About],
  ['faq', Faq],
  ['contact', Contact],
];

function Home() {
  return (
    <>
      <Hero />
      {HOME_BLOCKS.map(([id, Block]) => (
        <Block key={id} />
      ))}
      <Promotion />
    </>
  );
}

function NotFound() {
  return (
    <section className="section">
      <div className="container">
        <div className="empty">
          <h3>Halaman tidak ditemukan</h3>
          <p>URL yang kamu buka tidak tersedia di website ini.</p>
          <a className="btn btn--primary btn--sm" href="#/">
            Kembali ke Home
          </a>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const { route, ready, markReady } = useApp();

  /* Splash screen minimal supaya transisi awal tidak terasa kosong. */
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = setTimeout(markReady, reduce ? 120 : 900);
    return () => clearTimeout(timer);
  }, [markReady]);

  /* Ubah judul tab sesuai halaman. */
  useEffect(() => {
    if (route === '/products') {
      document.title = 'Store / Products - APISZ STORE';
    } else if (route.startsWith('/product/')) {
      document.title = 'Detail Produk - APISZ STORE';
    } else {
      document.title = 'APISZ STORE - Digital Service & SA-MP Service';
    }
  }, [route]);

  const isProductDetail = route.startsWith('/product/');

  return (
    <>
      <Loader visible={!ready} />
      <Navbar />

      <main id="main">
        {isProductDetail ? (
          <ProductDetail productId={route.replace('/product/', '')} />
        ) : route === '/products' ? (
          <ProductCatalog />
        ) : route !== '/' && !HOME_SECTIONS.includes(route.replace(/^\//, '')) ? (
          <NotFound />
        ) : (
          <Home />
        )}
      </main>

      <Footer />
      <OrderModal />
      <ScrollToTop />
    </>
  );
}

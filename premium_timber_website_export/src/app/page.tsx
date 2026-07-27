'use client';

import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import Hero from '../components/landing/Hero';
import About from '../components/landing/About';
import WorldMapSection from '../components/landing/WorldMapSection';
import WhyChooseUs from '../components/landing/WhyChooseUs';
import Gallery from '../components/landing/Gallery';
import Testimonials from '../components/landing/Testimonials';
import FAQ from '../components/landing/FAQ';
import Contact from '../components/landing/Contact';

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <Hero />
        <About />
        <WorldMapSection />
        <WhyChooseUs />
        <Gallery />
        <Testimonials />
        <FAQ />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

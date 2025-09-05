import React from 'react';
import { Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

// Components
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';
import ScrollToTop from '../components/ScrollToTop';

const MainLayout = () => {
  return (
    <>
      <Helmet>
        <title>ECOSHARE - Partagez, Réutilisez, Durable</title>
        <meta name="description" content="Plateforme de partage d'objets et d'aliments pour promouvoir la durabilité et créer une communauté d'entraide." />
      </Helmet>

      <div className="min-h-screen flex flex-col bg-gray-50">
        <Header />
        
        <main className="flex-1">
          <Outlet />
        </main>
        
        <Footer />
        <ScrollToTop />
      </div>
    </>
  );
};

export default MainLayout;

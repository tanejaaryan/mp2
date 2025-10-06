import React from 'react';
import './App.css';
import { Link, Route, Routes, Navigate, useLocation } from 'react-router-dom';
import ListView from './pages/ListView';
import GalleryView from './pages/GalleryView';
import DetailView from './pages/DetailView';
import { PokemonIndexProvider } from './context';

function App() {
  const location = useLocation();
  
  return (
    <div className="App">
      <nav className="Nav">
        <Link to="/list" className={location.pathname === '/list' ? 'active' : ''}>List</Link>
        <Link to="/gallery" className={location.pathname === '/gallery' ? 'active' : ''}>Gallery</Link>
      </nav>
      <PokemonIndexProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/list" replace />} />
          <Route path="/list" element={<ListView />} />
          <Route path="/gallery" element={<GalleryView />} />
          <Route path="/pokemon/:name" element={<DetailView />} />
          <Route path="*" element={<div>Not Found</div>} />
        </Routes>
      </PokemonIndexProvider>
    </div>
  );
}

export default App;

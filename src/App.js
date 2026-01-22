import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import MercurialeTab from './components/MercurialeTab';
import  FichesTechniquesTab  from './components/FichesTechniquesTab';
import InventaireTab from './components/InventaireTab';
import CaisseTab from './components/CaisseTab';
import './App.css';
import { demoIngredients, demoFiches } from './data/demoData';

/**
 * Application principale de gestion de restaurant
 * Gère la navigation entre mercuriale et fiches techniques
 */
function App() {
  const [activeTab, setActiveTab] = useState('mercuriale');
  const [ingredients, setIngredients] = useState([]);
  const [fiches, setFiches] = useState([]);

  // Chargement des données depuis localStorage au démarrage
  useEffect(() => {
    try {
      const savedIngredients = localStorage.getItem('restaurant_ingredients');
      const savedFiches = localStorage.getItem('restaurant_fiches');
      
      if (savedIngredients) {
        setIngredients(JSON.parse(savedIngredients));
      }
      if (savedFiches) {
        setFiches(JSON.parse(savedFiches));
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, []);

  // Sauvegarde automatique des ingrédients
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_ingredients', JSON.stringify(ingredients));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des ingrédients:', error);
    }
  }, [ingredients]);

  // Sauvegarde automatique des fiches
  useEffect(() => {
    try {
      localStorage.setItem('restaurant_fiches', JSON.stringify(fiches));
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des fiches:', error);
    }
  }, [fiches]);

  // Fonction pour importer les données démo
  const importDemoData = () => {
    if (window.confirm('Importer les données de démonstration ?\n\n• 22 ingrédients\n• 2 fiches techniques')) {
      // Vider le localStorage d'abord
      localStorage.removeItem('restaurant-ingredients');
      localStorage.removeItem('restaurant-fiches');
      
      // Importer les nouvelles données
      setIngredients(demoIngredients);
      setFiches(demoFiches);
      
      alert('✅ Données importées !');
      
      // Recharger pour être sûr
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  return (
    <div className="app">
      {/* En-tête */}
      <header className="app-header">
        <div className="header-content">
          <div className="header-title">
            <ShoppingCart size={36} />
            <div>
              <h1>Gestion Restaurant Pro</h1>
              <p className="header-subtitle">
                Solution complète pour vos fiches techniques & mercuriale
              </p>
            </div>
          </div>
          <div className="header-stats">
            <div className="stat-item">
              <span className="stat-number">{ingredients.length}</span>
              <span className="stat-label">Ingrédients</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{fiches.length}</span>
              <span className="stat-label">Fiches</span>
            </div>
          </div>
          
          {/* NOUVEAU BOUTON ICI */}
          <button 
            className="btn-secondary"
            onClick={importDemoData}
            style={{ marginLeft: '16px' }}
          >
            📦 Importer données démo
          </button>
        </div>
      </header>

      {/* Navigation */}
<nav className="app-nav">
  <button
    className={activeTab === 'mercuriale' ? 'active' : ''}
    onClick={() => setActiveTab('mercuriale')}
  >
    <span className="nav-icon">🛒</span>
    <span>Mercuriale</span>
    <span className="nav-badge">{ingredients.length}</span>
  </button>

  <button
    className={activeTab === 'fiches' ? 'active' : ''}
    onClick={() => setActiveTab('fiches')}
  >
    <span className="nav-icon">📋</span>
    <span>Fiches Techniques</span>
    <span className="nav-badge">{fiches.length}</span>
  </button>

  <button
    className={activeTab === 'inventaire' ? 'active' : ''}
    onClick={() => setActiveTab('inventaire')}
  >
    <span className="nav-icon">📦</span>
    <span>Inventaire</span>
    <span className="nav-badge">{ingredients.length}</span>
  </button>

  <button
    className={activeTab === 'caisse' ? 'active' : ''}
    onClick={() => setActiveTab('caisse')}
  >
    <span className="nav-icon">💳</span>
    <span>Caisse</span>
  </button>
</nav>

      {/* Contenu principal */}
      <main className="app-main">
        {activeTab === 'mercuriale' ? (
          <MercurialeTab 
            ingredients={ingredients} 
            setIngredients={setIngredients} 
          />
        ) : (
          <FichesTechniquesTab
            ingredients={ingredients}
            fiches={fiches}
            setFiches={setFiches}
          />
        )}
       {activeTab === 'inventaire' && (
  <InventaireTab
    ingredients={ingredients}
    setIngredients={setIngredients}
    fiches={fiches}
  />
)}

{activeTab === 'caisse' && (
  <CaisseTab
    fiches={fiches}
    ingredients={ingredients}
    setIngredients={setIngredients}
  />
)}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 Gestion Restaurant Pro - Tous droits réservés</p>
        <p className="footer-version">Version 1.0.0</p>
      </footer>
    </div>
  );
}

export default App;
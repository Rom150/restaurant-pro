import React, { useState } from 'react';
import { Package, Plus, Trash2, Edit2, Download, Upload, AlertCircle } from 'lucide-react';
import { importMercuriale, validateIngredients, detectDuplicates } from '../utils/mercurialeImport';

const ALLERGENES_OPTIONS = [
  'Gluten', 'Crustacés', 'Œufs', 'Poissons', 'Arachides',
  'Soja', 'Lait', 'Fruits à coque', 'Céleri', 'Moutarde',
  'Sésame', 'Sulfites', 'Lupin', 'Mollusques'
];

const UNITES = ['kg', 'L', 'unité', 'ml', 'cl', 'g', 'pièce', 'botte', 'douzaine'];

function MercurialeTab({ ingredients, setIngredients }) {
  const [formData, setFormData] = useState({
    nom: '',
    prix: '',
    unite: 'kg',
    allergenes: []
  });
  
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ message: '', percent: 0 });

  // ========================================
  // IMPORT OCR DE FICHIER (PDF, Image)
  // ========================================
  const handleFileImport = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png'];
    if (!validTypes.includes(file.type)) {
      alert('⚠️ Format non supporté. Utilisez PDF, JPG ou PNG');
      return;
    }

    setImporting(true);
    
    try {
      const extractedIngredients = await importMercuriale(file, (message, percent) => {
        setImportProgress({ message, percent });
      });

      const validIngredients = validateIngredients(extractedIngredients);
      
      if (validIngredients.length === 0) {
        alert('❌ Aucun ingrédient valide détecté dans le fichier');
        setImporting(false);
        return;
      }

      const { duplicates, toAdd } = detectDuplicates(ingredients, validIngredients);

      if (duplicates.length > 0) {
        let message = `🔍 ${duplicates.length} ingrédient(s) déjà présent(s) :\n\n`;
        
        duplicates.forEach(dup => {
          const emoji = parseFloat(dup.percentChange) > 0 ? '📈' : '📉';
          message += `${emoji} ${dup.existing.nom}\n`;
          message += `   Actuel: ${dup.existing.prix}€/${dup.existing.unite}\n`;
          message += `   Nouveau: ${dup.new.prix}€/${dup.new.unite}\n`;
          message += `   Variation: ${dup.percentChange}%\n\n`;
        });

        message += `\nVoulez-vous mettre à jour les prix ?`;

        if (window.confirm(message)) {
          const updatedIngredients = ingredients.map(ing => {
            const dup = duplicates.find(d => d.existing.id === ing.id);
            if (dup) {
              return { ...ing, prix: dup.new.prix, allergenes: dup.new.allergenes };
            }
            return ing;
          });
          setIngredients(updatedIngredients);
        }
      }

      if (toAdd.length > 0) {
        const confirmMsg = `✅ ${toAdd.length} nouvel(aux) ingrédient(s) détecté(s) :\n\n${
          toAdd.slice(0, 5).map(ing => `• ${ing.nom} - ${ing.prix}€/${ing.unite}${ing.quantite > 0 ? ` (Qté: ${ing.quantite})` : ''}`).join('\n')
        }${toAdd.length > 5 ? `\n... et ${toAdd.length - 5} autres` : ''}\n\nAjouter à la mercuriale ?`;

        if (window.confirm(confirmMsg)) {
          const newIngredients = toAdd.map((ing, index) => ({
            ...ing,
            id: Date.now() + index,
            photo: null,
            stockActuel: ing.quantite || 0,  // ✅ Utiliser la quantité importée
            stockMin: 10,
            stockCritique: 5,
            stockMax: Math.max(50, (ing.quantite || 0) * 2),  // Stock max = 2x la quantité importée
            mouvements: []
          }));

          setIngredients([...ingredients, ...newIngredients]);
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 3000);
        }
      } else if (duplicates.length === 0) {
        alert('ℹ️ Tous les ingrédients sont déjà dans la mercuriale');
      }

    } catch (error) {
      console.error('Erreur import:', error);
      alert(`❌ Erreur lors de l'import : ${error.message}`);
    } finally {
      setImporting(false);
      setImportProgress({ message: '', percent: 0 });
      e.target.value = null;
    }
  };

  // ========================================
  // AJOUT/MODIFICATION MANUEL
  // ========================================
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.nom || !formData.prix) {
      alert('⚠️ Veuillez remplir tous les champs obligatoires');
      return;
    }

    const prix = parseFloat(formData.prix);
    if (isNaN(prix) || prix <= 0) {
      alert('⚠️ Le prix doit être un nombre positif');
      return;
    }

    if (editingId) {
      setIngredients(ingredients.map(ing => 
        ing.id === editingId 
          ? { ...ing, ...formData, prix }
          : ing
      ));
      setEditingId(null);
      alert('✅ Ingrédient modifié avec succès !');
    } else {
      const newIngredient = {
        id: Date.now(),
        ...formData,
        prix,
        photo: null,
        stockActuel: 0,
        stockMin: 10,
        stockCritique: 5,
        stockMax: 50,
        mouvements: []
      };
      setIngredients([...ingredients, newIngredient]);
      alert('✅ Ingrédient ajouté avec succès !');
    }

    setFormData({
      nom: '',
      prix: '',
      unite: 'kg',
      allergenes: []
    });
  };

  // ========================================
  // ÉDITION
  // ========================================
  const handleEdit = (ingredient) => {
    setFormData({
      nom: ingredient.nom,
      prix: ingredient.prix.toString(),
      unite: ingredient.unite,
      allergenes: ingredient.allergenes || []
    });
    setEditingId(ingredient.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========================================
  // SUPPRESSION
  // ========================================
  const handleDelete = (id) => {
    const ingredient = ingredients.find(ing => ing.id === id);
    if (window.confirm(`Supprimer "${ingredient.nom}" ?`)) {
      setIngredients(ingredients.filter(ing => ing.id !== id));
      alert('✅ Ingrédient supprimé');
    }
  };

  // ========================================
  // ANNULER ÉDITION
  // ========================================
  const handleCancel = () => {
    setEditingId(null);
    setFormData({
      nom: '',
      prix: '',
      unite: 'kg',
      allergenes: []
    });
  };

  // ========================================
  // TOGGLE ALLERGÈNE
  // ========================================
  const toggleAllergene = (allergene) => {
    setFormData(prev => ({
      ...prev,
      allergenes: prev.allergenes.includes(allergene)
        ? prev.allergenes.filter(a => a !== allergene)
        : [...prev.allergenes, allergene]
    }));
  };

  // ========================================
  // EXPORT PDF
  // ========================================
  const handleExportPDF = () => {
    const content = `MERCURIALE - ${new Date().toLocaleDateString('fr-FR')}\n\n` +
      ingredients.map(ing => 
        `${ing.nom} - ${ing.prix}€/${ing.unite}${ing.allergenes?.length ? ` - Allergènes: ${ing.allergenes.join(', ')}` : ''}`
      ).join('\n');

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mercuriale_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ========================================
  // FILTRAGE
  // ========================================
  const filteredIngredients = ingredients.filter(ing =>
    ing.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================================
  // STATISTIQUES
  // ========================================
  const stats = {
    total: ingredients.length,
    prixMoyen: ingredients.length > 0 
      ? (ingredients.reduce((sum, ing) => sum + ing.prix, 0) / ingredients.length).toFixed(2)
      : 0
  };

  return (
    <div className="mercuriale-container">
      {/* HEADER */}
      <div className="mercuriale-header">
        <div className="header-title">
          <Package size={32} />
          <div>
            <h2>Mercuriale</h2>
            <p className="header-subtitle">{stats.total} ingrédients • Prix moyen: {stats.prixMoyen}€</p>
          </div>
        </div>
        
        <div className="header-actions">
          <label htmlFor="file-import" className="btn-import">
            <Upload size={18} />
            {importing ? `Import... ${Math.round(importProgress.percent * 100)}%` : 'Importer PDF/Image'}
            <input
              id="file-import"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileImport}
              style={{ display: 'none' }}
              disabled={importing}
            />
          </label>
          <button onClick={handleExportPDF} className="btn-export">
            <Download size={18} />
            Export PDF
          </button>
        </div>
      </div>

      {/* MESSAGE SUCCÈS */}
      {showSuccess && (
        <div className="success-banner">
          ✅ Import réussi ! Mercuriale mise à jour.
        </div>
      )}

      {/* PROGRESSION IMPORT */}
      {importing && (
        <div className="import-progress">
          <div className="progress-content">
            <div className="progress-text">{importProgress.message}</div>
            <div className="progress-bar">
              <div 
                className="progress-fill" 
                style={{ width: `${importProgress.percent * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      )}

      {/* FORMULAIRE */}
      <div className="form-card">
        <h3>{editingId ? '✏️ Modifier l\'ingrédient' : '➕ Ajouter un ingrédient'}</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: Tomates"
                required
              />
            </div>

            <div className="form-group">
              <label>Prix unitaire (€) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.prix}
                onChange={(e) => setFormData({...formData, prix: e.target.value})}
                placeholder="0.00"
                required
              />
            </div>

            <div className="form-group">
              <label>Unité *</label>
              <select
                value={formData.unite}
                onChange={(e) => setFormData({...formData, unite: e.target.value})}
              >
                {UNITES.map(unite => (
                  <option key={unite} value={unite}>{unite}</option>
                ))}
              </select>
            </div>
          </div>

          {/* ALLERGÈNES */}
          <div className="form-group">
            <label>Allergènes</label>
            <div className="allergenes-grid">
              {ALLERGENES_OPTIONS.map(allergene => (
                <button
                  key={allergene}
                  type="button"
                  className={`allergene-btn ${formData.allergenes.includes(allergene) ? 'active' : ''}`}
                  onClick={() => toggleAllergene(allergene)}
                >
                  {allergene}
                </button>
              ))}
            </div>
          </div>

          {/* BOUTONS */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? <><Edit2 size={18} /> Modifier</> : <><Plus size={18} /> Ajouter</>}
            </button>
            {editingId && (
              <button type="button" onClick={handleCancel} className="btn-secondary">
                Annuler
              </button>
            )}
          </div>
        </form>
      </div>

      {/* RECHERCHE */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Rechercher un ingrédient..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <span className="search-results">{filteredIngredients.length} résultat(s)</span>
        )}
      </div>

      {/* LISTE DES INGRÉDIENTS */}
      {filteredIngredients.length === 0 ? (
        <div className="empty-state">
          <Package size={48} />
          <h3>Aucun ingrédient</h3>
          <p>
            {searchTerm 
              ? 'Aucun résultat pour cette recherche'
              : 'Importez votre mercuriale PDF ou ajoutez des ingrédients manuellement'
            }
          </p>
        </div>
      ) : (
        <div className="ingredients-grid">
          {filteredIngredients.map(ingredient => (
            <div key={ingredient.id} className="ingredient-card">
              <div className="ingredient-header">
                <h4>{ingredient.nom}</h4>
                <div className="ingredient-actions">
                  <button
                    onClick={() => handleEdit(ingredient)}
                    className="btn-icon"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(ingredient.id)}
                    className="btn-icon btn-danger"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="ingredient-info">
                <div className="info-row">
                  <span className="label">Prix:</span>
                  <span className="value price">{ingredient.prix.toFixed(2)}€ / {ingredient.unite}</span>
                </div>

                {ingredient.allergenes && ingredient.allergenes.length > 0 && (
                  <div className="info-row">
                    <span className="label">Allergènes:</span>
                    <div className="allergenes-tags">
                      {ingredient.allergenes.map(allergene => (
                        <span key={allergene} className="allergene-tag">
                          <AlertCircle size={12} />
                          {allergene}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {ingredient.stockActuel !== undefined && (
                  <div className="info-row">
                    <span className="label">Stock:</span>
                    <span className="value">{ingredient.stockActuel} {ingredient.unite}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MercurialeTab;
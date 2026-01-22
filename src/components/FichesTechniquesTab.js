import React, { useState } from 'react';
import { FileText, Plus, Trash2, Edit2, Upload, Users, DollarSign, ChefHat } from 'lucide-react';
import { importFicheTechnique, validateRecipe, detectDuplicateRecipes } from '../utils/ficheImport';

function FichesTechniquesTab({ fiches, setFiches, ingredients }) {
  const [formData, setFormData] = useState({
    nom: '',
    portions: 4,
    categorie: 'Entrée',
    ingredients: [],
    instructions: '',
    cout: 0,
    prixVente: 0
  });

  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ message: '', percent: 0 });
  const [ingredientInput, setIngredientInput] = useState({ nom: '', quantite: '', unite: 'kg' });

  const CATEGORIES = ['Entrée', 'Plat', 'Dessert', 'Accompagnement', 'Sauce'];
  const UNITES = ['kg', 'g', 'L', 'ml', 'cl', 'pièce', 'unité', 'c.à.s', 'c.à.c'];

  // ========================================
  // IMPORT OCR
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
      const recipe = await importFicheTechnique(file, (message, percent) => {
        setImportProgress({ message, percent });
      });

      // Validation
      const validation = validateRecipe(recipe);
      if (!validation.isValid) {
        alert('❌ Erreurs détectées:\n' + validation.errors.join('\n'));
        setImporting(false);
        return;
      }

      // Détection doublons
      const duplicates = detectDuplicateRecipes(fiches, recipe);
      if (duplicates.length > 0) {
        const dup = duplicates[0];
        const confirm = window.confirm(
          `⚠️ Une recette similaire existe déjà:\n\n` +
          `"${dup.existing.nom}" (${dup.similarity}% de similarité)\n\n` +
          `Voulez-vous quand même ajouter "${recipe.nom}" ?`
        );
        
        if (!confirm) {
          setImporting(false);
          return;
        }
      }

      // Confirmation
      const confirmMsg = 
        `✅ Recette détectée:\n\n` +
        `📝 Nom: ${recipe.nom}\n` +
        `👥 Portions: ${recipe.portions}\n` +
        `🥘 Ingrédients: ${recipe.ingredients.length}\n\n` +
        `Ajouter cette fiche technique ?`;

      if (window.confirm(confirmMsg)) {
        const newFiche = {
          ...recipe,
          id: Date.now(),
          photo: null,
          date: new Date().toISOString()
        };

        setFiches([...fiches, newFiche]);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }

    } catch (error) {
      console.error('Erreur import:', error);
      alert(`❌ Erreur lors de l'import:\n${error.message}`);
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

    if (!formData.nom || formData.ingredients.length === 0) {
      alert('⚠️ Veuillez renseigner le nom et au moins un ingrédient');
      return;
    }

    if (editingId) {
      setFiches(fiches.map(fiche =>
        fiche.id === editingId ? { ...fiche, ...formData } : fiche
      ));
      setEditingId(null);
      alert('✅ Fiche modifiée avec succès !');
    } else {
      const newFiche = {
        id: Date.now(),
        ...formData,
        photo: null,
        date: new Date().toISOString()
      };
      setFiches([...fiches, newFiche]);
      alert('✅ Fiche ajoutée avec succès !');
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      nom: '',
      portions: 4,
      categorie: 'Entrée',
      ingredients: [],
      instructions: '',
      cout: 0,
      prixVente: 0
    });
    setIngredientInput({ nom: '', quantite: '', unite: 'kg' });
  };

  // ========================================
  // GESTION INGRÉDIENTS DU FORMULAIRE
  // ========================================
  const addIngredient = () => {
    if (!ingredientInput.nom || !ingredientInput.quantite) {
      alert('⚠️ Remplissez le nom et la quantité');
      return;
    }

    const newIngredient = {
      nom: ingredientInput.nom,
      quantite: parseFloat(ingredientInput.quantite),
      unite: ingredientInput.unite
    };

    setFormData({
      ...formData,
      ingredients: [...formData.ingredients, newIngredient]
    });

    setIngredientInput({ nom: '', quantite: '', unite: 'kg' });
  };

  const removeIngredient = (index) => {
    setFormData({
      ...formData,
      ingredients: formData.ingredients.filter((_, i) => i !== index)
    });
  };

  // ========================================
  // ÉDITION
  // ========================================
  const handleEdit = (fiche) => {
    setFormData({
      nom: fiche.nom,
      portions: fiche.portions,
      categorie: fiche.categorie,
      ingredients: fiche.ingredients,
      instructions: fiche.instructions,
      cout: fiche.cout,
      prixVente: fiche.prixVente
    });
    setEditingId(fiche.id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ========================================
  // SUPPRESSION
  // ========================================
  const handleDelete = (id) => {
    const fiche = fiches.find(f => f.id === id);
    if (window.confirm(`Supprimer "${fiche.nom}" ?`)) {
      setFiches(fiches.filter(f => f.id !== id));
      alert('✅ Fiche supprimée');
    }
  };

  // ========================================
  // FILTRAGE
  // ========================================
  const filteredFiches = fiches.filter(fiche =>
    fiche.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // ========================================
  // STATISTIQUES
  // ========================================
  const stats = {
    total: fiches.length,
    margeMoyenne: fiches.length > 0
      ? (fiches.reduce((sum, f) => sum + (f.prixVente - f.cout), 0) / fiches.length).toFixed(2)
      : 0
  };

  return (
    <div className="fiches-container">
      {/* HEADER */}
      <div className="fiches-header">
        <div className="header-title">
          <ChefHat size={32} />
          <div>
            <h2>Fiches Techniques</h2>
            <p className="header-subtitle">{stats.total} recettes • Marge moy: {stats.margeMoyenne}€</p>
          </div>
        </div>

        <div className="header-actions">
          <label htmlFor="fiche-import" className="btn-import">
            <Upload size={18} />
            {importing ? `Import... ${Math.round(importProgress.percent * 100)}%` : 'Importer Recette'}
            <input
              id="fiche-import"
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={handleFileImport}
              style={{ display: 'none' }}
              disabled={importing}
            />
          </label>
        </div>
      </div>

      {/* MESSAGE SUCCÈS */}
      {showSuccess && (
        <div className="success-banner">
          ✅ Import réussi ! Fiche technique ajoutée.
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
        <h3>{editingId ? '✏️ Modifier la fiche' : '➕ Nouvelle fiche technique'}</h3>

        <form onSubmit={handleSubmit}>
          <div className="form-row">
            <div className="form-group">
              <label>Nom de la recette *</label>
              <input
                type="text"
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: Tarte aux pommes"
                required
              />
            </div>

            <div className="form-group">
              <label>Portions *</label>
              <input
                type="number"
                min="1"
                value={formData.portions}
                onChange={(e) => setFormData({...formData, portions: parseInt(e.target.value)})}
                required
              />
            </div>

            <div className="form-group">
              <label>Catégorie *</label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({...formData, categorie: e.target.value})}
              >
                {CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          {/* INGRÉDIENTS */}
          <div className="form-group">
            <label>Ingrédients *</label>
            
            <div className="ingredient-input-row">
              <input
                type="text"
                placeholder="Nom"
                value={ingredientInput.nom}
                onChange={(e) => setIngredientInput({...ingredientInput, nom: e.target.value})}
                style={{ flex: 2 }}
              />
              <input
                type="number"
                step="0.01"
                placeholder="Qté"
                value={ingredientInput.quantite}
                onChange={(e) => setIngredientInput({...ingredientInput, quantite: e.target.value})}
                style={{ flex: 1 }}
              />
              <select
                value={ingredientInput.unite}
                onChange={(e) => setIngredientInput({...ingredientInput, unite: e.target.value})}
                style={{ flex: 1 }}
              >
                {UNITES.map(u => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <button type="button" onClick={addIngredient} className="btn-add-ingredient">
                <Plus size={18} /> Ajouter
              </button>
            </div>

            {/* LISTE INGRÉDIENTS */}
            {formData.ingredients.length > 0 && (
              <div className="ingredients-list">
                {formData.ingredients.map((ing, index) => (
                  <div key={index} className="ingredient-item">
                    <span>{ing.quantite} {ing.unite} {ing.nom}</span>
                    <button
                      type="button"
                      onClick={() => removeIngredient(index)}
                      className="btn-remove"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INSTRUCTIONS */}
          <div className="form-group">
            <label>Instructions</label>
            <textarea
              rows="6"
              value={formData.instructions}
              onChange={(e) => setFormData({...formData, instructions: e.target.value})}
              placeholder="Étape 1: ...&#10;Étape 2: ..."
            />
          </div>

          {/* PRIX */}
          <div className="form-row">
            <div className="form-group">
              <label>Coût total (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.cout}
                onChange={(e) => setFormData({...formData, cout: parseFloat(e.target.value)})}
              />
            </div>

            <div className="form-group">
              <label>Prix de vente (€)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.prixVente}
                onChange={(e) => setFormData({...formData, prixVente: parseFloat(e.target.value)})}
              />
            </div>

            {formData.prixVente > formData.cout && (
              <div className="form-group">
                <label>Marge</label>
                <div className="marge-display">
                  {(formData.prixVente - formData.cout).toFixed(2)}€
                  ({((formData.prixVente - formData.cout) / formData.cout * 100).toFixed(0)}%)
                </div>
              </div>
            )}
          </div>

          {/* BOUTONS */}
          <div className="form-actions">
            <button type="submit" className="btn-primary">
              {editingId ? <><Edit2 size={18} /> Modifier</> : <><Plus size={18} /> Ajouter</>}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="btn-secondary">
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
          placeholder="🔍 Rechercher une recette..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {searchTerm && (
          <span className="search-results">{filteredFiches.length} résultat(s)</span>
        )}
      </div>

      {/* LISTE DES FICHES */}
      {filteredFiches.length === 0 ? (
        <div className="empty-state">
          <FileText size={48} />
          <h3>Aucune fiche technique</h3>
          <p>
            {searchTerm
              ? 'Aucun résultat pour cette recherche'
              : 'Importez une recette ou créez-en une manuellement'
            }
          </p>
        </div>
      ) : (
        <div className="fiches-grid">
          {filteredFiches.map(fiche => (
            <div key={fiche.id} className="fiche-card">
              <div className="fiche-header">
                <h4>{fiche.nom}</h4>
                <div className="fiche-actions">
                  <button
                    onClick={() => handleEdit(fiche)}
                    className="btn-icon"
                    title="Modifier"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(fiche.id)}
                    className="btn-icon btn-danger"
                    title="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              <div className="fiche-info">
                <div className="info-badge">{fiche.categorie}</div>

                <div className="info-row">
                  <Users size={14} />
                  <span>{fiche.portions} portions</span>
                </div>

                <div className="info-row">
                  <span className="label">Ingrédients:</span>
                  <span className="value">{fiche.ingredients.length}</span>
                </div>

                {fiche.cout > 0 && (
                  <div className="info-row">
                    <DollarSign size={14} />
                    <span>Coût: {fiche.cout.toFixed(2)}€</span>
                  </div>
                )}

                {fiche.prixVente > 0 && (
                  <div className="info-row">
                    <DollarSign size={14} />
                    <span>Vente: {fiche.prixVente.toFixed(2)}€</span>
                  </div>
                )}

                {fiche.prixVente > fiche.cout && (
                  <div className="info-row marge">
                    <span className="label">Marge:</span>
                    <span className="value">
                      {(fiche.prixVente - fiche.cout).toFixed(2)}€
                      ({((fiche.prixVente - fiche.cout) / fiche.cout * 100).toFixed(0)}%)
                    </span>
                  </div>
                )}
              </div>

              {fiche.ingredients.length > 0 && (
                <div className="fiche-ingredients">
                  <strong>Ingrédients:</strong>
                  <ul>
                    {fiche.ingredients.slice(0, 5).map((ing, i) => (
                      <li key={i}>{ing.quantite} {ing.unite} {ing.nom}</li>
                    ))}
                    {fiche.ingredients.length > 5 && (
                      <li>... et {fiche.ingredients.length - 5} autres</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FichesTechniquesTab;
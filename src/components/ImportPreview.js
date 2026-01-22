import React, { useState } from 'react';
import { X, Save, Edit2, Trash2 } from 'lucide-react';

/**
 * ImportPreview Component
 * 
 * Displays parsed import data in an editable table with commit/cancel actions.
 * Used for both FichesTechniques and Mercuriale imports.
 * 
 * @param {Object} props
 * @param {boolean} props.isOpen - Whether the modal is visible
 * @param {Function} props.onClose - Called when user cancels
 * @param {Function} props.onCommit - Called when user commits changes
 * @param {Array} props.items - Parsed items to preview
 * @param {string} props.type - 'fiche' or 'mercuriale' to determine display format
 * @param {string} props.title - Modal title
 */
function ImportPreview({ isOpen, onClose, onCommit, items, type, title }) {
  const [editableItems, setEditableItems] = useState(items || []);
  const [editingIndex, setEditingIndex] = useState(null);
  const [committing, setCommitting] = useState(false);

  if (!isOpen) return null;

  const handleEdit = (index, field, value) => {
    const updated = [...editableItems];
    updated[index] = { ...updated[index], [field]: value };
    setEditableItems(updated);
  };

  const handleDelete = (index) => {
    if (window.confirm('Supprimer cet élément de l\'aperçu ?')) {
      setEditableItems(editableItems.filter((_, i) => i !== index));
    }
  };

  const handleCommit = async () => {
    setCommitting(true);
    try {
      await onCommit(editableItems);
    } catch (error) {
      console.error('Commit error:', error);
      alert(`Erreur lors de la validation: ${error.message}`);
    } finally {
      setCommitting(false);
    }
  };

  const renderFicheRow = (item, index) => (
    <tr key={index}>
      <td>
        <input
          type="text"
          value={item.nom || ''}
          onChange={(e) => handleEdit(index, 'nom', e.target.value)}
          className="preview-input"
        />
      </td>
      <td>
        <input
          type="number"
          value={item.portions || 4}
          onChange={(e) => handleEdit(index, 'portions', parseInt(e.target.value))}
          className="preview-input"
          min="1"
        />
      </td>
      <td>
        <select
          value={item.categorie || 'Plat'}
          onChange={(e) => handleEdit(index, 'categorie', e.target.value)}
          className="preview-select"
        >
          <option value="Entrée">Entrée</option>
          <option value="Plat">Plat</option>
          <option value="Dessert">Dessert</option>
          <option value="Accompagnement">Accompagnement</option>
          <option value="Sauce">Sauce</option>
        </select>
      </td>
      <td>{item.ingredients?.length || 0}</td>
      <td>
        <button
          onClick={() => setEditingIndex(editingIndex === index ? null : index)}
          className="btn-icon"
          title="Détails"
        >
          <Edit2 size={16} />
        </button>
        <button
          onClick={() => handleDelete(index)}
          className="btn-icon btn-danger"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );

  const renderMercurialeRow = (item, index) => (
    <tr key={index}>
      <td>
        <input
          type="text"
          value={item.nom || ''}
          onChange={(e) => handleEdit(index, 'nom', e.target.value)}
          className="preview-input"
        />
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          value={item.prix || 0}
          onChange={(e) => handleEdit(index, 'prix', parseFloat(e.target.value))}
          className="preview-input"
          min="0"
        />
      </td>
      <td>
        <select
          value={item.unite || 'kg'}
          onChange={(e) => handleEdit(index, 'unite', e.target.value)}
          className="preview-select"
        >
          <option value="kg">kg</option>
          <option value="L">L</option>
          <option value="unité">unité</option>
          <option value="ml">ml</option>
          <option value="cl">cl</option>
          <option value="g">g</option>
          <option value="pièce">pièce</option>
          <option value="botte">botte</option>
          <option value="douzaine">douzaine</option>
        </select>
      </td>
      <td>
        <input
          type="number"
          step="0.01"
          value={item.quantite || 0}
          onChange={(e) => handleEdit(index, 'quantite', parseFloat(e.target.value))}
          className="preview-input"
          min="0"
        />
      </td>
      <td>
        <button
          onClick={() => handleDelete(index)}
          className="btn-icon btn-danger"
          title="Supprimer"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );

  return (
    <div className="import-preview-overlay">
      <div className="import-preview-modal">
        {/* Header */}
        <div className="preview-header">
          <h2>{title || 'Aperçu de l\'import'}</h2>
          <button onClick={onClose} className="btn-icon" title="Fermer">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="preview-content">
          {editableItems.length === 0 ? (
            <div className="preview-empty">
              <p>Aucun élément à afficher</p>
            </div>
          ) : (
            <>
              <p className="preview-info">
                {editableItems.length} élément(s) détecté(s). Vous pouvez les modifier avant de les valider.
              </p>
              
              <div className="preview-table-container">
                <table className="preview-table">
                  <thead>
                    <tr>
                      {type === 'fiche' ? (
                        <>
                          <th>Nom</th>
                          <th>Portions</th>
                          <th>Catégorie</th>
                          <th>Ingrédients</th>
                          <th>Actions</th>
                        </>
                      ) : (
                        <>
                          <th>Nom</th>
                          <th>Prix (€)</th>
                          <th>Unité</th>
                          <th>Quantité</th>
                          <th>Actions</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {editableItems.map((item, index) => 
                      type === 'fiche' 
                        ? renderFicheRow(item, index)
                        : renderMercurialeRow(item, index)
                    )}
                  </tbody>
                </table>
              </div>

              {/* Ingredient details for fiches */}
              {type === 'fiche' && editingIndex !== null && editableItems[editingIndex] && (
                <div className="ingredient-details">
                  <h4>Ingrédients - {editableItems[editingIndex].nom}</h4>
                  {editableItems[editingIndex].ingredients?.map((ing, idx) => (
                    <div key={idx} className="ingredient-detail-item">
                      {ing.quantite} {ing.unite} {ing.nom}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="preview-footer">
          <button 
            onClick={onClose} 
            className="btn-secondary"
            disabled={committing}
          >
            Annuler
          </button>
          <button 
            onClick={handleCommit} 
            className="btn-primary"
            disabled={committing || editableItems.length === 0}
          >
            <Save size={18} />
            {committing ? 'Validation...' : 'Valider et Enregistrer'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ImportPreview;

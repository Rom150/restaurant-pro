# Restaurant Pro - Gestion Restaurant

Solution complète pour la gestion de restaurant avec fiches techniques et mercuriale.

![Application Screenshot](https://github.com/user-attachments/assets/135d5faf-defb-46de-82e1-4e428f8d5778)

## Fonctionnalités

- 📋 **Fiches Techniques**: Créez et gérez vos recettes avec ingrédients, portions, et coûts
- 🛒 **Mercuriale**: Gérez vos prix d'ingrédients et allergènes
- 📦 **Inventaire**: Suivez vos stocks en temps réel
- 💳 **Caisse**: Système de point de vente intégré

![Fiches Techniques](https://github.com/user-attachments/assets/70beaa9f-38a5-4011-a485-658f25aeba40)

## Import de Données

L'application supporte deux modes d'import:

### 1. Mode Client-Side (Par défaut)
L'application utilise Tesseract.js et PDF.js pour extraire les données directement dans le navigateur.

### 2. Mode Server-Side (Optionnel)
Configurez l'URL de votre API backend pour bénéficier d'un traitement côté serveur plus performant.

#### Configuration Backend

1. Créez un fichier `.env` à la racine du projet:
```bash
REACT_APP_API_URL=http://votre-backend-url
```

2. Votre backend doit exposer les endpoints suivants:

**POST /api/upload/parse**
- Reçoit un fichier (PDF/Image) via multipart/form-data
- Paramètre `type`: 'fiche' ou 'mercuriale'
- Retourne un tableau JSON d'objets parsés

Exemple de réponse pour type='fiche':
```json
[
  {
    "nom": "Tarte aux pommes",
    "portions": 8,
    "categorie": "Dessert",
    "ingredients": [
      {"nom": "Farine", "quantite": 250, "unite": "g"},
      {"nom": "Sucre", "quantite": 100, "unite": "g"}
    ],
    "instructions": "Étape 1: ...",
    "cout": 5.50,
    "prixVente": 12.00
  }
]
```

Exemple de réponse pour type='mercuriale':
```json
[
  {
    "nom": "Tomates",
    "prix": 3.50,
    "unite": "kg",
    "quantite": 10,
    "allergenes": []
  }
]
```

**POST /api/upload/commit**
- Reçoit le JSON validé par l'utilisateur
- Header: `Authorization: Bearer <JWT_TOKEN>` (si authentification configurée)
- Body:
```json
{
  "items": [...],
  "type": "fiche" | "mercuriale"
}
```

#### Flux d'Import avec Backend

1. L'utilisateur sélectionne un fichier
2. Le fichier est envoyé à `/api/upload/parse`
3. Le composant `ImportPreview` affiche les données parsées dans un tableau éditable
4. L'utilisateur peut modifier, supprimer des lignes
5. En cliquant sur "Valider", les données sont envoyées à `/api/upload/commit`
6. Les données sont ajoutées à l'application

#### Authentification JWT

Le système utilise un token JWT stocké dans localStorage sous la clé `accessToken`.

Pour configurer l'authentification:
```javascript
import { setAuthToken } from './utils/auth';

// Après connexion réussie
setAuthToken('votre-jwt-token');
```

Le token est automatiquement envoyé dans le header `Authorization: Bearer <token>` lors de l'appel à `/api/upload/commit`.

## Installation

```bash
npm install
```

## Développement

```bash
npm start
```

Ouvre [http://localhost:3000](http://localhost:3000) dans le navigateur.

## Build Production

```bash
npm run build
```

Crée le build optimisé dans le dossier `build/`.

## Tests

```bash
npm test
```

## Technologies

- React 19
- Tesseract.js (OCR)
- PDF.js (Extraction PDF)
- Lucide React (Icônes)
- Chart.js (Graphiques)

## Architecture

```
src/
├── components/
│   ├── FichesTechniquesTab.js  # Gestion des fiches techniques
│   ├── MercurialeTab.js         # Gestion de la mercuriale
│   ├── ImportPreview.js         # Modal de prévisualisation d'import
│   ├── InventaireTab.js         # Gestion des stocks
│   └── CaisseTab.js             # Point de vente
├── utils/
│   ├── ficheImport.js           # Import OCR pour fiches
│   ├── mercurialeImport.js      # Import OCR pour mercuriale
│   └── auth.js                  # Gestion authentification JWT
└── App.js                       # Composant principal
```

## Sécurité

- ✅ CodeQL: Aucune vulnérabilité détectée
- ✅ Validation des entrées utilisateur
- ✅ Gestion sécurisée des tokens JWT
- ✅ Headers CORS configurables

## License

Tous droits réservés © 2026

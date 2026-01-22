# Restaurant Pro - Gestion Restaurant

Solution complète pour la gestion de restaurant avec fiches techniques et mercuriale.

## Fonctionnalités

- 📋 **Fiches Techniques**: Créez et gérez vos recettes avec ingrédients, portions, et coûts
- 🛒 **Mercuriale**: Gérez vos prix d'ingrédients et allergènes
- 📦 **Inventaire**: Suivez vos stocks en temps réel
- 💳 **Caisse**: Système de point de vente intégré

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

Le système cherche automatiquement le token JWT dans localStorage sous ces clés:
- `accessToken`
- `jwt_token`
- `token`

Le token est envoyé dans le header `Authorization: Bearer <token>` lors de l'appel à `/api/upload/commit`.

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

## License

Tous droits réservés © 2026

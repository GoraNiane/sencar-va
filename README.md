# Auto Elite — Site vitrine (voitures déjà importées)

Site d'exposition de véhicules déjà importés, avec un espace admin permettant
d'ajouter pour chaque voiture des photos et vidéos prises au téléphone, le
prix, les commodités et un commentaire. Architecture full-stack Node.js
(Express) + React (Vite).

## Structure

```
auto-elite/
├── backend/                    API Node.js / Express
│   ├── data/
│   │   ├── vehicles.json       Base de données (fichier JSON)
│   │   └── store.js            Lecture/écriture des véhicules
│   ├── middleware/upload.js    Upload des photos/vidéos (multer)
│   ├── routes/vehicles.js      Routes CRUD + gestion des médias
│   ├── uploads/vehicles/<id>/  Photos et vidéos stockées par véhicule
│   └── server.js
└── frontend/                   React (Vite)
    └── src/
        ├── pages/
        │   ├── PublicSite.jsx  Vitrine publique
        │   └── AdminPage.jsx   Espace admin (liste + formulaire)
        ├── components/
        │   ├── VehicleGallery.jsx   Carrousel photos/vidéos
        │   ├── VehicleForm.jsx      Formulaire d'ajout/édition + upload
        │   ├── MediaManager.jsx     Suppression individuelle d'un média
        │   ├── AdminVehicleList.jsx Liste admin (modifier/supprimer)
        │   └── ... (Header, Hero, SearchCard, VehicleCard, TrustStrip, Footer)
        ├── api.js               Tous les appels à l'API
        └── App.jsx              Routes "/" (site) et "/admin" (gestion)
```

## Lancer le projet en local

### 1. API (backend)

```bash
cd backend
npm install
npm run dev      # http://localhost:5000
```

### 2. Frontend (React)

Dans un second terminal :

```bash
cd frontend
npm install
npm run dev       # http://localhost:5173
```

- Site public : http://localhost:5173
- Espace admin : http://localhost:5173/admin

Le frontend proxy `/api/*` et `/uploads/*` vers le backend (voir `vite.config.js`).

## Utilisation de l'espace admin

1. Aller sur `/admin` (lien "Espace admin" dans l'en-tête du site).
2. Cliquer sur **Ajouter un véhicule** : renseigner marque, modèle, année,
   kilométrage, transmission, prix, commodités (cases à cocher) et un
   commentaire libre.
3. Dans les champs **Photos** et **Vidéos**, choisir directement les fichiers
   depuis le téléphone (l'attribut `capture` ouvre l'appareil photo/caméra
   sur mobile) — plusieurs fichiers à la fois sont acceptés.
4. Après enregistrement, le véhicule apparaît immédiatement sur le site
   public avec sa galerie (photos + vidéos), son prix en FCFA, ses
   commodités et le commentaire.
5. Depuis la liste admin, **Gérer les médias** permet de supprimer une
   photo ou une vidéo précise sans toucher au reste de la fiche.
6. **Modifier** permet de changer les infos ou d'ajouter d'autres
   photos/vidéos ; **Supprimer** retire la fiche et tous ses fichiers.

## API disponible

| Méthode | Route                          | Description                                    |
|---------|--------------------------------|--------------------------------------------------|
| GET     | `/api/vehicles`                | Liste (filtres : `q`, `transmission`, `available`) |
| GET     | `/api/vehicles/:id`            | Détail d'un véhicule                              |
| POST    | `/api/vehicles`                | Créer une fiche véhicule                          |
| PUT     | `/api/vehicles/:id`            | Modifier les informations                         |
| DELETE  | `/api/vehicles/:id`            | Supprimer le véhicule et ses fichiers             |
| POST    | `/api/vehicles/:id/media`      | Ajouter des photos/vidéos (`multipart/form-data`, champs `photos` et `videos`) |
| DELETE  | `/api/vehicles/:id/media`      | Retirer un média précis (`{ type, filename }`)    |

Les médias sont servis statiquement sous `/uploads/vehicles/<id>/<fichier>`.

## À savoir avant un vrai déploiement

- **Stockage** : les véhicules sont stockés dans un fichier JSON
  (`backend/data/vehicles.json`) — pratique pour démarrer, mais à remplacer
  par une vraie base de données (PostgreSQL, MongoDB...) pour un usage en
  production avec plusieurs utilisateurs simultanés.
- **Authentification** : l'espace `/admin` n'est protégé par aucun mot de
  passe dans cette version — n'importe qui connaissant l'URL peut y accéder.
  Avant mise en ligne publique, il faut ajouter une authentification
  (connexion admin, token, etc.).
- **Taille des fichiers** : la limite est fixée à 80 Mo par fichier
  (confortable pour des vidéos filmées au téléphone) — ajustable dans
  `backend/middleware/upload.js`.
- **Stockage des fichiers** : les photos/vidéos sont actuellement stockées
  sur le disque du serveur. Pour un hébergement cloud (Render, Railway...),
  prévoir un stockage persistant ou un service externe (S3, Cloudinary).

## Build pour production

```bash
cd frontend
npm run build      # génère frontend/dist
```

Servez `frontend/dist` avec un serveur statique, et déployez `backend/`
séparément (ou derrière un reverse proxy commun), en pensant à monter un
volume persistant pour `backend/uploads/`.

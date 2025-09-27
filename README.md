# NextWatch Backend

Plateforme de streaming — API backend Express.js

## Fonctionnalités principales

- Authentification JWT (inscription, connexion, rôles)
- Gestion des utilisateurs et abonnements (free, premium)
- Sécurisation des accès aux films premium
- Upload et gestion des films (vidéos, miniatures)
- Endpoints RESTful pour le frontend React
- Middleware d'autorisation (admin, premium, etc.)
- Connexion à MongoDB (Mongoose)
- Dockerisation prête pour le déploiement

## Stack technique
- **Node.js** / **Express.js**
- **Mongoose** (MongoDB)
- **JWT** (authentification)
- **Multer** (upload fichiers)
- **Docker**

## Démarrage local

```bash
npm install
npm run dev
```

## Déploiement avec Docker

```bash
docker build -t nextwatch-backend .
docker run -p 5000:5000 nextwatch-backend
```

## Orchestration complète avec docker-compose

Un fichier `docker-compose.yml` à la racine permet de lancer le backend, le frontend et MongoDB en une seule commande :

```bash
docker-compose up --build
```

## Endpoints principaux
- `/api/auth` : Authentification, inscription, login
- `/api/uploads` : Upload et gestion des films
- `/api/movies` : Accès aux films (avec restriction premium)

## Sécurité
- Vérification du rôle utilisateur sur chaque endpoint sensible
- Blocage des accès premium pour les utilisateurs "free"
- Middleware d'authentification et d'autorisation

---
© 2025 NextWatch — Backend développé par Pascal Yao

# Font Ninja Backend

Ce projet contient un environnement Docker Compose avec :

- un service `mysql`
- un service `backend` NestJS en TypeScript
- un service `scrapper` Node.js
- un dossier `DB/` avec le script d'initialisation SQL

## Stack

- Node.js 20
- NestJS
- TypeScript
- MySQL 8.4
- Sequelize
- un service de scrapping Node.js
- ESLint
- Prettier
- Swagger
- Jest
- moment.js

## Lancement

```bash
docker compose up --build
```

Le script [`DB/init.sql`](/Users/trobin/workspace/Test_technque_Font_ninja/DB/init.sql) est exécuté automatiquement par MySQL au premier démarrage du volume.

Le service `scrapper` démarre dans un conteneur séparé et peut appeler le backend via `http://backend:3000/api`.

## Préparation Git

Les fichiers suivants sont déjà prêts avant un futur `git init` :

- [`.gitignore`](/Users/trobin/workspace/Test_technque_Font_ninja/.gitignore)
- [`.gitattributes`](/Users/trobin/workspace/Test_technque_Font_ninja/.gitattributes)
- [`.editorconfig`](/Users/trobin/workspace/Test_technque_Font_ninja/.editorconfig)
- [`.gitmessage.txt`](/Users/trobin/workspace/Test_technque_Font_ninja/.gitmessage.txt)

Après `git init`, tu peux optionnellement brancher le template de commit :

```bash
git config commit.template .gitmessage.txt
```

## Qualité de code

Dans le dossier [`backend`](/Users/trobin/workspace/Test_technque_Font_ninja/backend), les commandes disponibles sont :

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Endpoints

- API: `http://localhost:3000/api/health`
- Swagger: `http://localhost:3000/api/docs`
- Articles: `http://localhost:3000/api/articles`
- Scrappers: `http://localhost:3000/api/scrappers`

Exemple de filtre :

```bash
GET /api/articles?days=7
```

## Variables de connexion MySQL

- hôte: `mysql`
- port: `3306`
- base: `font_ninja`
- utilisateur: `app`
- mot de passe: `app`

## Variables du service `scrapper`

- `BACKEND_API_URL` : URL du backend vue depuis le conteneur, par défaut `http://backend:3000/api`
- `SCRAPPER_ID` : identifiant du scrapper a mettre a jour via l'API
- `SCRAPPER_STARTUP_STATE` : statut envoye au demarrage, par defaut `run`

## Table `articles`

La table `articles` est prévue avec les colonnes suivantes :

- `id` : identifiant auto-généré
- `title` : titre de l'article
- `url` : lien vers l'article
- `publication_date` : date de publication, nullable
- `source` : nom du site d'actualité

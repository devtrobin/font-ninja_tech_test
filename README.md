# Font Ninja Backend

Ce projet contient un environnement Docker Compose avec :

- un service `mysql`
- un service `backend` NestJS en TypeScript
- un dossier `DB/` avec le script d'initialisation SQL

## Stack

- Node.js 20
- NestJS
- TypeScript
- MySQL 8.4
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

## Variables de connexion MySQL

- hôte: `mysql`
- port: `3306`
- base: `font_ninja`
- utilisateur: `app`
- mot de passe: `app`

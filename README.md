# Font Ninja Backend

Ce projet contient un environnement Docker Compose avec :

- un service `mysql`
- un service `backend` NestJS en TypeScript
- deux services `scrapper` Node.js dedies aux sources BBC et Y Combinator
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

Les services `scrapper` démarrent dans des conteneurs séparés et appellent le backend via `http://backend:3000/api`.

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
GET /api/articles?days=7&limit=20&offset=0
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
- `URI_TO_SCRAP` : URL source a analyser
- `EXTRACTOR_FILE` : fichier extracteur a charger pour la source concernee

## Table `articles`

La table `articles` est prévue avec les colonnes suivantes :

- `id` : identifiant auto-généré
- `title` : titre de l'article
- `url` : lien vers l'article
- `publication_date` : date de publication, nullable
- `source` : nom du site d'actualité

## Requete SQL Optimisee

Requete pour recuperer les articles publies au cours des 7 derniers jours, tries par date de publication decroissante :

```sql
SELECT id, title, url, publication_date, source
FROM articles
WHERE publication_date >= NOW() - INTERVAL 7 DAY
ORDER BY publication_date DESC, id ASC;
```

Indexes proposes dans [`DB/init.sql`](/Users/trobin/workspace/Test_technque_Font_ninja/DB/init.sql) :

```sql
CREATE UNIQUE INDEX ux_articles_url_hash ON articles (url_hash);
CREATE INDEX idx_articles_publication_date_id ON articles (publication_date DESC, id ASC);
```

Pourquoi ces indexes :

- `ux_articles_url_hash` garantit l'unicite metier sur une URL longue sans depasser la limite de taille d'index MySQL sur `VARCHAR(2048)`.
- `idx_articles_publication_date_id` accelere le filtre temporel sur `publication_date` et soutient le tri `ORDER BY publication_date DESC, id ASC`.

## Choix Techniques

- Le scraping est externalise du backend NestJS dans des services Node.js dedies. Ce choix evite de melanger exposition API, logique de persistance et traitements de scraping potentiellement longs ou instables dans le meme processus.
- Cette separation permet de scaler les scrappers independamment du backend API, de les redemarrer separement et d'isoler les extracteurs par source.
- L'API `articles` expose pagination et filtrage (`days`, `limit`, `offset`) afin de limiter la charge sur la base et sur les reponses HTTP quand le volume augmente.
- Le scrapper verifie l'existence d'un article avant creation afin de limiter les doublons applicatifs, en complement d'une indexation dediee en base.

## Architecture

L'architecture actuelle est modulaire NestJS :

- module `articles`
- module `scrappers`
- services applicatifs relies directement a Sequelize

Pour evoluer vers une architecture hexagonale, la direction naturelle serait :

- extraire un domaine `article` et un domaine `scrapper` contenant les regles metier et les contrats
- introduire des cas d'usage applicatifs du type `ScrapeArticlesUseCase`, `GetArticlesUseCase`, `CheckArticleExistsUseCase`
- deplacer Sequelize dans une couche infrastructure implementant des repositories
- conserver les controllers NestJS comme adaptateurs d'entree HTTP
- conserver les extracteurs BBC/Y Combinator comme adaptateurs sortants specialises

Ce projet reste volontairement pragmatique pour tenir le cadre du test tout en gardant une trajectoire claire vers une architecture plus hexagonale.

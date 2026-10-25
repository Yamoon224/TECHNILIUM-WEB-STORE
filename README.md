# Technilium — Store

Vitrine marketplace (clients) du projet Technilium : catalogue de produits technologiques, recherche, fiches produit — Afrique francophone, prix en F CFA.

Application NextJS **totalement autonome** : ses propres dépendances, son propre `src/components` et `src/lib`, rien d'importé depuis un autre dépôt. L'identité visuelle (palette noir/or, logo) est extraite du logo de marque Techlium Group et dupliquée à l'identique dans [TECHNILIUM-WEB-BACKOFFICE](https://github.com/Yamoon224/TECHNILIUM-WEB-BACKOFFICE), par choix — pas de package de design partagé.

Dépôts liés : [TECHNILIUM-BACKEND](https://github.com/Yamoon224/TECHNILIUM-BACKEND) (API) · [TECHNILIUM-WEB-BACKOFFICE](https://github.com/Yamoon224/TECHNILIUM-WEB-BACKOFFICE)

## Stack

- NextJS 16 (App Router), React 19, TypeScript strict
- Tailwind CSS v4
- Space Grotesk (titres/prix) + IBM Plex Sans (texte courant)
- Vitest

## Démarrage rapide

Nécessite le backend [TECHNILIUM-BACKEND](https://github.com/Yamoon224/TECHNILIUM-BACKEND) démarré sur `http://localhost:8000`.

```bash
npm install
cp .env.example .env
npm run dev            # http://localhost:3000
```

## Qualité

```bash
npm run lint
npm run typecheck
npm run test
```

Régénérer le client API typé une fois le backend démarré :

```bash
npm run generate:api-client
```

## Pages

- `/` — accueil catalogue : recherche, filtre par catégorie, grille produits (données réelles via l'API Catalog).
- `/produits/[slug]` — fiche produit détaillée (prix, garantie, caractéristiques, vendeur).

## Identité visuelle

Palette échantillonnée directement du logo (fond quasi-noir `#070604`, dégradé or `#5e3306 → #fbf28c`) — monochrome par choix, pas de couleur secondaire inventée. Pas d'ombres ni de cartes SaaS génériques ; hiérarchie portée par la typographie et la luminosité de l'or.

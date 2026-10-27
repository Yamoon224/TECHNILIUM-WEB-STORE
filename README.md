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
- `/produits/[slug]` — fiche produit détaillée (prix, garantie, caractéristiques, vendeur), ajout au panier respectant le stock.
- `/panier` — panier (localStorage) : quantités, suppression, sous-total.
- `/commande` — champ **code promotionnel** avec aperçu de la remise et du total avant confirmation (le code est revalidé côté serveur à la commande) ; formulaire de livraison + confirmation, paiement à la livraison uniquement.
- `/commande/[orderNumber]` — accusé de réception, retrouvé via sessionStorage juste après la commande ; sinon un formulaire redemande le téléphone (jamais dans l'URL — voir plus bas).
- Après la commande (`/commande/[orderNumber]`) et dans `/compte` : le **code de confirmation de livraison** à ne donner au livreur qu'à la remise du colis ; « Partiellement expédiée / livrée » et statut de chaque colis pour une commande multi-vendeurs.
- Sur `/produits/[slug]` : **avis clients** — note moyenne, répartition par étoiles, liste des avis avec la mention « Achat vérifié » ; un client connecté qui a reçu le produit peut donner son avis (publié aussitôt, ou après vérification s'il est signalé).
- `/aide` — support (connecté) : ouvrir une demande (catégorie, commande concernée choisie parmi ses commandes), suivre ses demandes et leur statut, échanger avec le support. Lien depuis `/compte`.
- `/connexion` — connexion et création de compte (un même formulaire, bascule entre les deux modes).
- `/compte` — informations du compte et historique des commandes (`GET /orders/mine`, authentifié) ; « Mes factures » sur chaque commande confirmée : liste des factures et avoirs et téléchargement du PDF (`/customer/...`, limité à ses propres commandes).

Se connecter avant de passer commande rattache automatiquement la commande au compte (`customer_id`) sans rien changer au parcours invité, qui reste entièrement supporté.

## Identité visuelle

Palette échantillonnée directement du logo (fond quasi-noir `#070604`, dégradé or `#5e3306 → #fbf28c`) — monochrome par choix, pas de couleur secondaire inventée. Pas d'ombres ni de cartes SaaS génériques ; hiérarchie portée par la typographie et la luminosité de l'or.

# Template Node + Vue service

Squelette de dépôt « Template repository » GitHub pour un service Node.js avec une
interface Vue 3. Il fournit une base testée dès le premier commit : client Vite, serveur
Express, endpoint de santé, conteneur multi-étapes, intégration continue mutualisée,
Dependabot groupé et socle de règles `ai-template`.

## Prérequis

- Node.js `>= 22.22.2` et npm.
- Docker et Docker Compose pour le déploiement conteneurisé.

## Contenu

- `client/` — Vue 3 + Vite, servi en développement sur le port 5173, avec un test Vitest.
- `server/` — Express, `GET /api/health`, avec un test Vitest et `supertest`.
- `Dockerfile` — build multi-étapes, image de base épinglée.
- `docker-compose.yml` — réseau externe configurable, port publié sur `127.0.0.1` par défaut.
- `.github/workflows/` — CI, vérification du titre de PR, labeler et release-drafter.
- `.github/dependabot.yml` — mises à jour hebdomadaires groupées, fusion manuelle.
- `.ai-template/` — sous-module `ai-template`, règles communes et checklist RGPD.
- `AGENTS.md`, `opencode.json`, `.opencode/agents` — câblage des agents et compétences.
- `docs/rgpd/etat.yml` — état RGPD initial, tous les items en `a_verifier`.

## Démarrage local

Installer et lancer chaque côté séparément :

```bash
cd client && npm ci && npm run dev
cd server && npm ci && npm run dev
```

Le client Vite proxifie `/api` vers `http://localhost:3000`.

## Tests et qualité

```bash
cd client && npm run lint && npm run format:check && npm run test:coverage
cd server && npm run lint && npm run format:check && npm run test:coverage
npm test
```

`npm test` à la racine exécute les tests du script de validation des titres de PR.
Les seuils de couverture sont de 80 % et sont appliqués par Vitest et par la CI.

## Docker

```bash
cp .env.example .env
docker network inspect app-net >/dev/null 2>&1 || docker network create app-net
docker compose up -d --build
curl http://127.0.0.1:3000/api/health
```

L'application est publiée sur `127.0.0.1` par défaut. Pour l'exposer volontairement,
modifier `HOST_BIND` dans `.env`.

## Configuration

| Variable           | Défaut     | Description                                                |
| ------------------ | ---------- | ---------------------------------------------------------- |
| `VERSION`          | `0.1.0`    | Tag de l'image Docker                                      |
| `PORT`             | `3000`     | Port publié sur l'hôte                                     |
| `HOST_BIND`        | `127.0.0.1`| Interface d'écoute du port publié                          |
| `EXTERNAL_NETWORK` | `app-net`  | Réseau Docker externe à rejoindre, créé au préalable       |

`.env` n'est jamais versionné ; seul `.env.example` l'est.

## Architecture

```text
navigateur -> app:3000 (Express: API /api/health + client statique)
                    -> réseau Docker externe (services partagés)
```

- `GET /api/health` renvoie `{ "status": "ok" }`.
- Le serveur sert `client/dist` lorsqu'il existe.
- Le client appelle `/api/health` sur la même origine.

## Sous-module ai-template

Le sous-module pointe vers
`https://github.com/tozano-ai-labs/ai-template.git`. Après un clone ou la création d'un
dépôt depuis ce template :

```bash
git submodule update --init --recursive
```

La version attendue est déclarée dans `ai-template.json`. Le dossier `.opencode/agents`
est un lien symbolique vers `.ai-template/.opencode/agents` ; il est versionné comme tel.

## Intégration continue

`ci.yml` appelle `shared-workflows@v1` pour le client et le serveur, puis valide la
configuration du dépôt : `actionlint`, `yamllint`, `hadolint` et les tests du script de
titre de PR. `pr-title.yml`, `labeler.yml` et `release-drafter.yml` appellent également
les workflows partagés.

Le mode de fusion cible est le squash : le titre de la PR devient le message de commit
sur `main`. Il doit respecter le format
`<gitmoji> <type>(<scope>): <description>` (72 caractères maximum).

Dependabot est configuré pour des mises à jour hebdomadaires groupées. La fusion reste
manuelle : aucun auto-merge n'est activé.

## RGPD

`docs/rgpd/etat.yml` est un état initial, pas un audit. Tous les items restent en
`a_verifier` jusqu'à une revue réelle. La checklist de référence est fournie par le
sous-module `.ai-template`.

## Après création du dépôt

Effectuer ces étapes dans cet ordre.

1. **Renommer le dépôt et ses références.** Remplacer `template-node-vue-service` dans
   `package.json`, `docker-compose.yml`, ce README et les titres de travail. Vérifier
   avec :

   ```bash
   rg -n "template-node-vue-service" .
   ```

2. **Initialiser le sous-module** après le clone ou la création depuis le template :

   ```bash
   git submodule update --init --recursive
   ```

3. **Compléter `AGENTS.md`.** Remplacer tous les `<À COMPLÉTER>`, ajuster
   `ai-template.json` si la version du sous-module change, puis remplir
   `docs/rgpd/etat.yml` après une revue réelle. Ne pas inventer de statut conforme.

4. **Créer le fichier d'environnement local :**

   ```bash
   cp .env.example .env
   ```

   Adapter `VERSION`, `PORT`, `HOST_BIND` et `EXTERNAL_NETWORK`. Créer le réseau externe
   s'il n'existe pas :

   ```bash
   docker network inspect app-net >/dev/null 2>&1 || docker network create app-net
   ```

5. **Configurer le ruleset de la branche `main`.** Dans GitHub : Settings > Rules >
   Rulesets. Exiger une pull request, les vérifications CI, l'historique linéaire, et
   interdire le force push. Autoriser uniquement le squash merge. La création du
   ruleset se fait dans l'interface GitHub : la version de `gh` installée localement
   (2.4.0) n'expose pas de commande `ruleset`. Vérifier les commandes disponibles dans
   votre version avant de scripter. Les réglages de fusion peuvent être fixés par API :

   ```bash
   gh api -X PATCH repos/tozano-ai-labs/<nom-du-depot> \
     -F allow_squash_merge=true \
     -F allow_merge_commit=false \
     -F allow_rebase_merge=false
   ```

   Ajouter comme vérifications requises les noms exacts affichés dans l'onglet Checks
   d'une pull request. Ne pas les deviner.

6. **Synchroniser les labels** depuis le dépôt d'organisation `.github` :

   ```bash
   ../.github/scripts/sync-labels.sh tozano-ai-labs/<nom-du-depot> --dry-run
   ../.github/scripts/sync-labels.sh tozano-ai-labs/<nom-du-depot>
   ```

7. **Marquer le dépôt comme template.** Dans Settings, cocher « Template repository »,
   ou :

   ```bash
   gh api -X PATCH repos/tozano-ai-labs/<nom-du-depot> -F is_template=true
   ```

8. **Vérifier Dependabot.** S'assurer qu'aucun auto-merge n'est activé et que la fusion
   des PR Dependabot reste manuelle.

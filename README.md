# MCP Latrach Node

Un serveur MCP (Model Context Protocol) simple construit avec Node.js et TypeScript, prêt pour le déploiement sur Google Cloud Platform.

## Déploiement sur Google Cloud Run (étape par étape)
### Permissions nécessaires pour Cloud Build

Assurez-vous que votre compte Google dispose des droits suffisants sur le projet GCP :

1. Vous devez être propriétaire ou avoir le rôle `Editor` ou `Cloud Build Editor` sur le projet.
2. Pour vérifier ou ajouter des droits :
  - Rendez-vous dans la console GCP > IAM & Admin > IAM
  - Ajoutez votre email avec le rôle `roles/cloudbuild.builds.editor` ou `roles/editor`
3. Si vous avez plusieurs comptes Google, vérifiez le compte actif :
  ```bash
  gcloud auth login
  gcloud config set account VOTRE_EMAIL@gmail.com
  ```
4. Si vous n'avez pas les droits, demandez à l'administrateur du projet de vous les accorder.

### 1. Installer l'outil gcloud

Suivez la documentation officielle : https://cloud.google.com/sdk/docs/install

Sur macOS :
```bash
brew install --cask google-cloud-sdk
```
Après installation, rechargez votre terminal ou exécutez :
```bash
gcloud init
```

### 2. Préparer le Dockerfile
Assure-toi que ton Dockerfile contient :
```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
COPY tsconfig.json ./
RUN npm ci
COPY src ./src
RUN npm run build
EXPOSE 8080
ENV PORT=8080
CMD ["node", "dist/index.js"]
```

### 3. Construire et pousser l'image Docker sur Google Container Registry (GCR)
```bash

# Trouver l'ID de votre projet GCP (project_id)
#
# 1. Depuis la console web : https://console.cloud.google.com/ (colonne "ID du projet")
# 2. Ou en ligne de commande :
gcloud projects list
# L'ID du projet est dans la colonne PROJECT_ID

# Configurer le projet GCP
gcloud config set project mcp-latrach

## Méthode 1 : Build manuel (local)
# Construire l'image
docker build -t gcr.io/mcp-latrach/mcp-latrach-node:latest .
# Pousser l'image
docker push gcr.io/mcp-latrach/mcp-latrach-node:latest

## Méthode 2 : Build et déploiement automatique avec Cloud Build
# (Recommandé pour CI/CD)
#
# 1. Vérifiez que votre fichier cloudbuild.yaml contient une étape de déploiement Cloud Run (voir plus bas)
# 2. Avant de lancer le build, vérifiez que vous êtes bien authentifié avec le bon compte Google :
gcloud auth login
gcloud config set account xxxxx@gmail.com
# 3. Lancez le build et le déploiement :
gcloud builds submit --config cloudbuild.yaml
# Cloud Build va construire, pousser et déployer automatiquement sur Cloud Run (avec accès public)
# Pour éviter l'erreur Forbidden, assurez-vous que l'option --allow-unauthenticated est bien présente dans la commande de déploiement Cloud Run
```

### 4. Déployer sur Cloud Run
```bash
gcloud run deploy mcp-latrach-node \
  --image gcr.io/mcp-latrach/mcp-latrach-node:latest \
  --platform managed \
  --region europe-west1 \
  --allow-unauthenticated
```

### 5. Récupérer l'URL de l'application Cloud Run

Après le déploiement, pour obtenir l'URL publique de votre service :

```sh
gcloud run services describe mcp-latrach-node --platform managed --region europe-west1 --format 'value(status.url)'
```

Ou pour lister tous les services et leurs URLs :

```sh
gcloud run services list --platform managed --region europe-west1
```

L'URL s'affichera dans la colonne "URL" pour le service `mcp-latrach-node`.

Le serveur HTTP sera accessible via l'URL fournie par Cloud Run (port 8080 géré automatiquement). Voir [API_DOC.md](./API_DOC.md) pour la documentation de l'API REST.
## Fonctionnalités

- **Mode de fonctionnement HTTP:**
  - **HTTP** (`index.ts`): Pour déploiement local ou sur GCP, écoute sur le port 8080

- **Outils disponibles:**
  - `greet`: Salue une personne avec son nom
  - `calculate`: Effectue des calculs mathématiques simples

- **Ressources disponibles:**
  - `example://info`: Informations sur le serveur

## Développement local

### Prérequis

- Node.js 20 ou supérieur
- npm ou yarn

### Installation

```bash
npm install
```

### Compilation

```bash
npm run build
```

### Exécution

**Mode HTTP (port 8080):**
```bash
npm run start:http
```

### Développement avec rechargement automatique

```bash
npm run dev:http
```

Le serveur HTTP sera accessible sur `http://localhost:8083`. Voir [API_DOC.md](./API_DOC.md) pour la documentation complète de l'API.

### Option 2: Cloud Build (CI/CD automatique)

1. **Configurer Cloud Build:**

```bash
# Activer l'API Cloud Build
gcloud services enable cloudbuild.googleapis.com

# Configurer les permissions
gcloud projects add-iam-policy-binding mcp-latrach \
  --member serviceAccount:YOUR_PROJECT_NUMBER@cloudbuild.gserviceaccount.com \
  --role roles/run.admin
```

2. **Déclencher un build:**

```bash
gcloud builds submit --config cloudbuild.yaml
```

3. **Déployer automatiquement sur Cloud Run après le build:**

Ajoutez cette étape à `cloudbuild.yaml`:

```yaml
- name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
  entrypoint: gcloud
  args:
    - 'run'
    - 'deploy'
    - 'mcp-latrach-node'
    - '--image'
    - 'gcr.io/$PROJECT_ID/mcp-latrach-node:$COMMIT_SHA'
    - '--region'
    - 'europe-west1'
    - '--platform'
    - 'managed'
```

## Structure du projet

```
.
├── src/
│   └── index.ts          # Point d'entrée principal
├── dist/                 # Code compilé (généré)
├── package.json
├── tsconfig.json
├── Dockerfile
├── cloudbuild.yaml
└── README.md
```

## Licence

MIT


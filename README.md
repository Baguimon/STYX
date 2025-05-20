# STYX 

Application fullstack pour organiser et rejoindre des événements sportifs entre amis.  
Développée avec **Symfony** (backend), **React Native via Expo** (frontend), et **MySQL** via Docker.

---

## Technologies utilisées

- 🐘 **PHP 8.1+**
- ⚙️ **Symfony 6.x** (API REST)
- 📱 **React Native** (Expo)
- 🐳 **Docker** + **MySQL**
- 🌐 **ngrok** (accès mobile local)

---

## Installation du projet

### 1. Cloner le projet

```bash
git clone https://github.com/Baguimon/STYX.git
cd STYX
```

---

### 2. Lancer l’environnement Docker (base de données)

```bash
cd docker
docker compose up -d
```

Vérification rapide :
- phpMyAdmin : http://localhost:8080  
- MySQL dispo sur le port `3309`  
- Exemple de `DATABASE_URL` (dans `.env` ou `.env.local`) :

```dotenv
DATABASE_URL="mysql://styx:styxpass@127.0.0.1:3309/styxdb?serverVersion=8.0"
```

---

### 3. Installer les dépendances backend

```bash
cd backend
composer install
```

---

### 4. Lancer le serveur Symfony

```bash
symfony serve --no-tls --allow-http --port=8000
```

L'API est alors dispo sur : http://127.0.0.1:8000

---

## Accès depuis mobile (React Native)

### 5. Installer et configurer ngrok

```bash
npm install -g ngrok
ngrok http 8000
```

🔗 Copie l’URL générée par ngrok (ex: `https://xxxx.ngrok-free.app`)  
Et remplace la constante `API_URL` dans `frontend/styx-app/api.js` :

```js
const API_URL = 'https://xxxx.ngrok-free.app/api';
```

Vérifie aussi que `CORS_ALLOW_ORIGIN` dans `.env` backend est bien :

```dotenv
CORS_ALLOW_ORIGIN=https://xxxx.ngrok-free.app
```

---

### 6. Lancer l’application mobile

```bash
cd frontend/styx-app
npm install @react-navigation/native
npm install @react-navigation/bottom-tabs
npm install @react-navigation/native-stack
npx expo start --tunnel
```

Scanne le QR Code avec **Expo Go** sur ton téléphone.  
L’authentification et l’accès API doivent maintenant fonctionner via l'URL ngrok.

---

## Structure du projet

```
STYX/
├── backend/           → Symfony API
├── frontend/styx-app/ → React Native (Expo)
├── docker/            → Docker & MySQL
```

---

## Endpoints API disponibles

| Méthode | URL              | Description                          |
|:--------|:-----------------|:-------------------------------------|
| GET     | `/api/users`     | Liste des utilisateurs               |
| POST    | `/api/register`  | Créer un nouvel utilisateur          |
| POST    | `/api/login`     | Se connecter                         |
| GET     | `/api/games`     | Liste des matchs disponibles         |
| POST    | `/api/games`     | Créer un nouveau match               |

---

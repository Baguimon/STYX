# STYX 

Projet d’application fullstack pour organiser des événements sportifs entre amis.  
Développé en Symfony (backend) et React Native via Expo (frontend), avec MySQL via Docker.

---

## Technologies utilisées

- ⚙️ Backend : Symfony 6.x
- 📱 Frontend : React Native (Expo)
- 🐳 Docker + MySQL
- 🐘 PHP 8.1+
- 🧠 Node.js + npm

---

## Installation du projet

### 1. Cloner le dépôt

```bash
git clone https://github.com/Baguimon/STYX.git
cd STYX
```

---

## STYX – Guide de démarrage local 🏁

### 1. Cloner le projet

```bash
git clone <URL_DU_REPO_GITHUB>
cd STYX
```

### 2. Lancer l’environnement Docker

```bash
cd docker
docker compose up -d
```

### Vérification :
- phpMyAdmin : http://localhost:8080  
- MySQL : accessible sur le port **3309**  
- Fichier `.env` du backend :

```ini
DATABASE_URL="mysql://styx:styxpass@127.0.0.1:3309/styxdb?serverVersion=8.0"
```

### 3. Générer les clés JWT (si manquantes)

```bash
cd backend
mkdir -p config/jwt
openssl genrsa -out config/jwt/private.pem 4096
openssl rsa -pubout -in config/jwt/private.pem -out config/jwt/public.pem
```

### Vérifie le `.env` :

```dotenv
JWT_SECRET_KEY=%kernel.project_dir%/config/jwt/private.pem
JWT_PUBLIC_KEY=%kernel.project_dir%/config/jwt/public.pem
JWT_PASSPHRASE=styxpassphrase
```

### 4. Installer les dépendances Symfony

```bash
cd backend
composer install
```

### 5. Lancer le serveur Symfony

```bash
symfony serve --no-tls --allow-http --port=8000
```

- API accessible sur : http://127.0.0.1:8000

### 6. Lancer le frontend React Native

```bash
cd frontend/styx-app
npm install
npx expo start
```

- Scanner le **QR Code** avec **Expo Go** (sur mobile)
- Vérifie que les services pointent bien vers l’URL backend correcte.

---

##  Structure du projet

```
STYX/
├── backend/           → Symfony (API)
├── frontend/styx-app/ → React Native (Expo)
├── docker/            → docker-compose + MySQL
```

---

##  API disponible

| Méthode | URL              | Description                        |
|:--------|:-----------------|:-----------------------------------|
| GET     | `/api/users`      | Récupérer la liste des utilisateurs |

---

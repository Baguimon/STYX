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

### 2. Lancer la base de données avec Docker

> Assurez-vous d’avoir Docker Desktop installé.

```bash
cd docker
docker-compose up -d
```

La base de données sera disponible sur :  
`localhost:3309`  
Base de données : `styxdb`  
Utilisateur : `styx`  
Mot de passe : `styxpass`

---

### 3. Installer le backend Symfony

```bash
cd ../backend
composer install
```

Créez un fichier `.env.local` si besoin, ou modifiez le `.env` :

```dotenv
DATABASE_URL="mysql://styx:styxpass@127.0.0.1:3309/styxdb?serverVersion=8.0"
```

➡️ Puis créez la base si ce n’est pas déjà fait :

```bash
php bin/console doctrine:database:create
php bin/console doctrine:migrations:migrate
```

---

### 4. Installer le frontend avec Expo

```bash
cd ../frontend/styx-app
npm install
npx expo start
```

➡️ Utilisez l’app **Expo Go** sur votre smartphone pour scanner le QR code  
➡️ Ou ouvrez le simulateur Android/iOS depuis l’interface Expo

---

## 📁 Structure du projet

```
STYX/
├── backend/           → Symfony (API)
├── frontend/styx-app/ → React Native (Expo)
├── docker/            → docker-compose + MySQL
```



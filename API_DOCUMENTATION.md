# 📘 RVM Backend — Documentation API

> **Base URL** : (https://rvm-backend-oaot.onrender.com)
>
> **Auth** : Sessions (cookies). Appeler `POST /user/login` pour s'authentifier au dashboard Admin.

---

## 📑 Table des matières

1. [Authentification & Utilisateurs (Admin)](#1--authentification--gestion-utilisateurs)
2. [Ouvriers / Personnel (Workers)](#2--ouvriers--personnel-workers)
3. [Machines](#3--machines)
4. [Notifications](#4--notifications)
5. [Bacs de recyclage (RecyclingBin)](#5--bacs-de-recyclage)
6. [Produits recyclés (RecycledProduct)](#6--produits-recyclés)
7. [Modèles de données (JSON)](#7--modèles-de-données)

---

## 1 — Authentification & Gestion Utilisateurs

Base path : **`/user`**

### `POST /user/login`
Connecte un administrateur et crée une session.
**Body:** `{ "email": "admin@rvm.com", "password": "pass" }`
**Réponse 200:** `{ "message": "Login success", "role": "admin" }`

### `POST /user/logout`
Déconnecte l'utilisateur.

### `POST /user/`
Crée un nouvel utilisateur. Seul le rôle `"admin"` est défini pour l'application.
**Body (JSON)** : `username`, `nomcomplet`, `adress`, `email`, `phone`, `city`, `password`, `role` ("admin").

### `GET /user/role/:role`
Récupère tous les utilisateurs d'un rôle donné (ex: `/user/role/admin`).

### `GET /user/role/:role/search`
Recherche avec Query Params : `username`, `phone`, `city`, `startDate`, `endDate`.

### `PUT /user/change-password`
Modifie le mot de passe.
**Body:** `{ "email": "...", "oldPassword": "...", "newPassword": "..." }`

---

## 2 — Ouvriers / Personnel (Workers)

Base path : **`/worker`**

Gère les membres de l'équipe (Techniciens et Videurs) sur le terrain pour la traçabilité.

### `POST /worker/add`
Ajouter un nouvel ouvrier.
**Body:** 
- `nomcomplet` (String, obligatoire)
- `phone` (String, obligatoire)
- `city` (String, obligatoire)
- `role` (String, `"technicien"` ou `"videur"`)

### `GET /worker/all`
Liste de tout le personnel (trié par date décroissante).

### `GET /worker/role/:role`
Liste du personnel pour un rôle spécifique (`technicien` ou `videur`).

### `PUT /worker/update-status/:id`
Changer le statut d'un ouvrier (ex: a quitté la société).
**Body:** `{ "status": "actif" }` ou `"inactif"`.

### `DELETE /worker/delete/:id`
Supprimer la fiche d'un ouvrier.

---

## 3 — Machines

Base path : **`/machine`**

### `GET /machine/`
Récupère toutes les machines (statut remonté).

### `GET /machine/stats`
Récupère les statistiques pour le dashboard (Poids PET, Poids ALU, Nb Machines).

### `GET /machine/search`
Filtres avec Query Params : `name`, `status` ("actif", "inactif", "en_panne"), `type` ("PET", "ALU"), `lat`, `lng`, `radius`.

### `POST /machine/create`
**Body:** `machine_id`, `name`, `latitude`, `longitude`, `city`, `status`, `photo_url`.

### `GET /machine/:id`
Récupère une machine spécifique par ID.

### `PUT /machine/:id/status`
Met à jour le statut d'une machine.

### `DELETE /machine/:id`
Supprime une machine spécifique.

---

## 4 — Notifications

Base path : **`/notif`**

### `GET /notif/admin`
Historique global des notifications clôturées (statut `"traitée"`).

### `GET /notif/admin/envoyees`
Notifications actives non lues (statut `"envoyée"`).

### `GET /notif/machine/:machineId`
Historique des notifications clôturées (`"traitée"`) d'une machine spécifique. (`:machineId` peut être le `machine_id` lisible ex:"M001" ou l'`_id` MongoDB).

### `PUT /notif/status/:id`
Clôture ou met à jour le statut d'une notification.

**Body attendu pour clôturer :**
```json
{
  "status": "traitée",
  "worker_name": "Jean Dupont"
}
```
> **⚠️ ATTENTION :**
> - Le paramètre `worker_name` est **obligatoire** lors du passage à `"traitée"`.
> - Pour une panne, renseigner le nom d'un technicien.
> - Pour un bac plein/alerte (remplissage, alerte_80), renseigner le nom d'un videur.
> - **Magie du backend :** Le nom sera automatiquement greffé au `message` de la notification pour figurer de façon permanente dans l'historique !

---

## 5 — Bacs de recyclage

Base path : **`/bin`**

### `POST /bin/`
Crée un bac (**Body:** `machine`: ObjectId, `type`: "PET" | "ALU", `capacity_kg`: Number).

### `GET /bin/`
Liste tous les bacs.

### `GET /bin/machine/:machineId`
Liste les bacs d'une machine.

### `PUT /bin/:id`
Met à jour un bac (niveau de remplissage via requêtes custom).

### `DELETE /bin/:id`
Supprime un bac.

---

## 6 — Produits recyclés

Base path : **`/product`**

### `POST /product/`
Insère un déchet et met à jour dynamiquement le bac.
**Body:** `{ "machine": "...", "type": "PET", "weight_kg": 0.05 }`
> **⚠️ RÈGLE DE REFUS :** Si l'insertion de ce poids fait dépasser la `capacity_kg` limite du bac lié, la requête est rejetée en erreur 400.

### `GET /product/` , `GET /product/machine/:machineId` , `GET /product/type/:type`
Récupérations diverses de l'historique des insertions.

### `DELETE /product/:id`
Supprime un historique de produit.

---

## 7 — Modèles de données

### 👤 User
```json
{
  "_id": "ObjectId",
  "username": "String (unique)",
  "nomcomplet": "String",
  "role": "admin",
  "email": "String (unique)",
  ...
}
```

### 👷 Worker
```json
{
  "_id": "ObjectId",
  "nomcomplet": "String",
  "phone": "String",
  "city": "String",
  "role": "technicien | videur",
  "status": "actif | inactif"
}
```

### 🤖 Machine
```json
{
  "_id": "ObjectId",
  "machine_id": "String (unique, ex: M001)",
  "status": "actif | inactif | en_panne",
  ...
}
```

### 🔔 Notification
```json
{
  "_id": "ObjectId",
  "type": "panne | remplissage | alerte_80",
  "recipient_role": "admin",
  "status": "envoyée | traitée",
  "message": "String (dynamiquement modifié à la clôture avec nom de l'ouvrier)",
  "worker_name": "String",
  "priority_level": "bas | moyen | élevé"
}
```

# 📘 RVM Backend — Documentation API

> **Base URL** : (https://rvm-backend-oaot.onrender.com)
>
> **Auth** : Sessions (cookies). Appeler `POST /user/login` pour s'authentifier.

---

## 📑 Table des matières

1. [Authentification (User)](#1--authentification--gestion-utilisateurs)
2. [Machines](#2--machines)
3. [Notifications](#3--notifications)
4. [Bacs de recyclage (RecyclingBin)](#4--bacs-de-recyclage)
5. [Produits recyclés (RecycledProduct)](#5--produits-recyclés)
6. [Modèles de données](#6--modèles-de-données)

---

## 1 — Authentification & Gestion Utilisateurs

Base path : **`/user`**

### `POST /user/login`

Connecte un utilisateur et crée une session.

| Champ      | Type   | Requis | Description       |
|------------|--------|--------|-------------------|
| `email`    | String | ✅     | Email de l'utilisateur |
| `password` | String | ✅     | Mot de passe       |

**Réponse 200 :**
```json
{ "message": "Login success", "role": "admin" }
```

**Erreurs :** `400` email/mot de passe invalide

---

### `POST /user/logout`

Déconnecte l'utilisateur (détruit la session).

**Aucun body requis.**

**Réponse 200 :**
```json
{ "message": "Logged out" }
```

---

### `POST /user/`

Crée un nouvel utilisateur (admin only).

| Champ        | Type   | Requis | Description                                |
|--------------|--------|--------|--------------------------------------------|
| `username`   | String | ✅     | Nom d'utilisateur (unique)                 |
| `nomcomplet` | String | ✅     | Nom complet                                |
| `adress`     | String | ✅     | Adresse                                    |
| `email`      | String | ✅     | Email (unique)                             |
| `phone`      | String | ❌     | Téléphone                                  |
| `city`       | String | ✅     | Ville                                      |
| `password`   | String | ✅     | Mot de passe (sera hashé)                  |
| `role`       | String | ✅     | `"admin"` / `"technicien"` / `"videur"`    |

**Réponse 200 :**
```json
{ "message": "User created successfully" }
```

**Erreurs :** `400` rôle invalide ou utilisateur déjà existant

---

### `GET /user/role/:role`

Récupère tous les utilisateurs d'un rôle donné.

| Paramètre URL | Valeurs possibles                     |
|----------------|---------------------------------------|
| `:role`        | `admin`, `technicien`, `videur`       |

**Réponse 200 :** tableau d'objets `User`

---

### `GET /user/role/:role/search`

Recherche d'utilisateurs par rôle avec filtres.

| Paramètre URL | Valeurs possibles                     |
|----------------|---------------------------------------|
| `:role`        | `admin`, `technicien`, `videur`       |

| Query Params | Type   | Description                        |
|--------------|--------|------------------------------------|
| `username`   | String | Filtre partiel (regex, insensible à la casse) |
| `phone`      | String | Filtre partiel                     |
| `city`       | String | Filtre partiel                     |
| `startDate`  | Date   | Date de début (format ISO)         |
| `endDate`    | Date   | Date de fin (format ISO)           |

**Réponse 200 :** tableau d'objets `User`

---

## 2 — Machines

Base path : **`/machine`**

### `GET /machine/`

Récupère toutes les machines avec leurs bacs (`recyclingBins`) et produits recyclés (`recycledProducts`) peuplés.

**Réponse 200 :** tableau d'objets `Machine` (avec virtuals peuplés)

---

### `GET /machine/search`

Recherche de machines avec filtres multiples.

| Query Params | Type   | Description                                        |
|--------------|--------|----------------------------------------------------|
| `name`       | String | Filtre partiel sur le nom                          |
| `status`     | String | `"actif"`, `"inactif"`, `"en_panne"`               |
| `type`       | String | Type de bac : `"PET"` ou `"ALU"` (filtre les machines ayant ce type de bac) |
| `lat`        | Number | Latitude pour recherche géographique               |
| `lng`        | Number | Longitude pour recherche géographique              |
| `radius`     | Number | Rayon de recherche (défaut : `0.05`)               |

**Réponse 200 :** tableau d'objets `Machine` (avec `recyclingBins` peuplés si filtre `type`)

---

### `POST /machine/create`

Crée une nouvelle machine (admin only).

| Champ            | Type   | Requis | Description                              |
|------------------|--------|--------|------------------------------------------|
| `machine_id`     | String | ✅     | Identifiant unique de la machine         |
| `name`           | String | ✅     | Nom de la machine                        |
| `latitude`       | Number | ✅     | Latitude GPS                             |
| `longitude`      | Number | ✅     | Longitude GPS                            |
| `city`           | String | ❌     | Ville                                    |
| `status`         | String | ❌     | `"actif"` (défaut), `"inactif"`, `"en_panne"` |
| `last_online_at` | Date   | ❌     | Dernière connexion                       |
| `photo_url`      | String | ❌     | URL de la photo                          |
| `ai_accuracy`    | Number | ❌     | Précision IA (défaut : `0`)              |

**Réponse 201 :** objet `Machine` créé

---

## 3 — Notifications

Base path : **`/notif`**

> Les notifications sont filtrées par **la ville** de l'utilisateur identifié par `:userId`.

### Admin

#### `GET /notif/admin/:userId`

Historique complet des notifications pour les machines de la ville de l'admin.

**Réponse 200 :** tableau d'objets `Notification` (avec `machine` peuplée)

#### `GET /notif/admin/:userId/recent`

Notifications des **30 dernières secondes** pour les machines de la ville de l'admin.

**Réponse 200 :** tableau d'objets `Notification`

---

### Technicien

#### `GET /notif/technicien/:userId`

Historique des notifications destinées aux techniciens dans la ville du technicien.

> ⚠️ L'utilisateur doit avoir le rôle `technicien`, sinon → `403`

**Réponse 200 :** tableau d'objets `Notification`

#### `GET /notif/technicien/:userId/recent`

Notifications récentes (30s) pour le technicien.

**Réponse 200 :** tableau d'objets `Notification`

---

### Videur

#### `GET /notif/videur/:userId`

Historique des notifications destinées aux videurs dans la ville du videur.

> ⚠️ L'utilisateur doit avoir le rôle `videur`, sinon → `403`

**Réponse 200 :** tableau d'objets `Notification`

#### `GET /notif/videur/:userId/recent`

Notifications récentes (30s) pour le videur.

**Réponse 200 :** tableau d'objets `Notification`

---

## 4 — Bacs de recyclage

Base path : **`/bin`**

### `POST /bin/`

Crée un nouveau bac de recyclage.

| Champ             | Type   | Requis | Description                        |
|-------------------|--------|--------|------------------------------------|
| `machine`         | ObjectId | ✅   | ID de la machine associée          |
| `type`            | String | ✅     | `"PET"` ou `"ALU"`                 |
| `capacity_kg`     | Number | ✅     | Capacité en kg                     |
| `current_fill_kg` | Number | ❌     | Remplissage actuel (défaut : `0`)  |

**Réponse 201 :** objet `RecyclingBin` créé

**Erreurs :** `404` machine non trouvée

---

### `GET /bin/`

Récupère tous les bacs (avec `machine` peuplée : `name`, `machine_id`, `city`, `status`).

**Réponse 200 :** tableau d'objets `RecyclingBin`

---

### `GET /bin/machine/:machineId`

Récupère les bacs d'une machine spécifique.

| Paramètre URL | Description              |
|----------------|--------------------------|
| `:machineId`   | ID MongoDB de la machine |

**Réponse 200 :** tableau d'objets `RecyclingBin`

---

### `PUT /bin/:id`

Met à jour un bac (niveau de remplissage, capteur, etc.).

| Paramètre URL | Description            |
|----------------|------------------------|
| `:id`          | ID MongoDB du bac      |

**Body :** tout champ du modèle `RecyclingBin` à modifier.

**Réponse 200 :** objet `RecyclingBin` mis à jour

**Erreurs :** `404` bac non trouvé

---

### `DELETE /bin/:id`

Supprime un bac.

**Réponse 200 :**
```json
{ "message": "Bac supprimé avec succès" }
```

**Erreurs :** `404` bac non trouvé

---

## 5 — Produits recyclés

Base path : **`/product`**

### `POST /product/`

Enregistre un nouveau produit recyclé.

| Champ       | Type     | Requis | Description                |
|-------------|----------|--------|----------------------------|
| `machine`   | ObjectId | ✅     | ID de la machine           |
| `type`      | String   | ✅     | `"PET"` ou `"ALU"`         |
| `weight_kg` | Number   | ✅     | Poids en kg                |

**Réponse 201 :** objet `RecycledProduct` créé

**Erreurs :** `404` machine non trouvée

---

### `GET /product/`

Récupère tous les produits recyclés (avec `machine` peuplée).

**Réponse 200 :** tableau d'objets `RecycledProduct`

---

### `GET /product/machine/:machineId`

Récupère les produits recyclés d'une machine.

**Réponse 200 :** tableau d'objets `RecycledProduct`

---

### `GET /product/type/:type`

Récupère les produits par type.

| Paramètre URL | Valeurs possibles |
|----------------|-------------------|
| `:type`        | `PET`, `ALU`      |

**Réponse 200 :** tableau d'objets `RecycledProduct`

**Erreurs :** `400` type invalide

---

### `DELETE /product/:id`

Supprime un produit recyclé.

**Réponse 200 :**
```json
{ "message": "Produit supprimé avec succès" }
```

**Erreurs :** `404` produit non trouvé

---

## 6 — Modèles de données

### User

```json
{
  "_id": "ObjectId",
  "username": "String (unique)",
  "nomcomplet": "String",
  "adress": "String",
  "email": "String (unique)",
  "phone": "String",
  "city": "String",
  "role": "admin | technicien | videur",
  "password_hash": "String (non retourné idéalement)",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### Machine

```json
{
  "_id": "ObjectId",
  "machine_id": "String (unique)",
  "name": "String",
  "latitude": "Number",
  "longitude": "Number",
  "city": "String",
  "status": "actif | inactif | en_panne",
  "last_online_at": "Date",
  "photo_url": "String",
  "ai_accuracy": "Number",
  "created_at": "Date",
  "updated_at": "Date",
  "recyclingBins": "[RecyclingBin]  (virtual, peuplé)",
  "recycledProducts": "[RecycledProduct]  (virtual, peuplé)"
}
```

### Notification

```json
{
  "_id": "ObjectId",
  "machine": "ObjectId → Machine",
  "type": "panne | remplissage | urgence",
  "message": "String",
  "recipient_role": "technicien | videur",
  "status": "envoyée | lue | traitée",
  "priority_level": "bas | moyen | élevé",
  "created_at": "Date",
  "updated_at": "Date"
}
```

### RecyclingBin

```json
{
  "_id": "ObjectId",
  "machine": "ObjectId → Machine",
  "type": "PET | ALU",
  "capacity_kg": "Number",
  "current_fill_kg": "Number",
  "last_emptied_at": "Date"
}
```

### RecycledProduct

```json
{
  "_id": "ObjectId",
  "machine": "ObjectId → Machine",
  "type": "PET | ALU",
  "weight_kg": "Number"
}
```

---

## ⚠️ Notes importantes

- **Toutes les erreurs serveur** renvoient `500` avec `{ error: "..." }` ou `{ message: "Erreur serveur" }`
- **Les IDs** (`_id`, `machine`, `:userId`, `:machineId`, `:id`) sont des **ObjectId MongoDB** (24 caractères hex)
- **Le Content-Type** de toutes les requêtes POST/PUT doit être `application/json`
- **Les sessions** utilisent des cookies — le front doit envoyer les requêtes avec `credentials: "include"` (fetch) ou `withCredentials: true` (axios)

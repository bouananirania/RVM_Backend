# 🚀 Guide de Survie pour le Développeur Front-End

Ce document rassemble les **règles métiers obligatoires (Business Rules)** implémentées dans le composant Backend (Node.js). 
Il est le parfait complément au fichier `API_DOCUMENTATION.md`.

*(Attention : Si vous ne respectez pas ces règles côté React/Angular/Flutter, le Backend vous bloquera ou renverra des erreurs).*

---

### 1. 🍪 L'Authentification (Cookies & Axios/Fetch)
Le système n'utilise pas de tokens JWT basiques dans les Headers, mais des **Sessions (Cookies)** gérées automatiquement par Express. 
Dès que vous réussissez un `POST /user/login`, le Backend renvoie un Cookie sécurisé contenant votre session. 

👉 **RÈGLE FRONT-END :** Vous devez **absolument** configurer votre client HTTP global pour autoriser l'envoi/réception de cookies inter-domaines.
- Si vous utilisez **Axios** (React/Vue/etc.) : `axios.defaults.withCredentials = true;`
- Si vous utilisez **Fetch API** : Ajoutez `credentials: "include"` dans les options de la requête fetch.
*(Dans le cas contraire, même avec des bons identifiants, toutes les routes protégées vous interdiront l'accès).*

---

### 2. 🧙‍♂️ La Clôture des Notifications (Règles très strictes !)
Le Dashboard Admin permet de clôturer les alertes machines. Mais le Backend impose des verrous RH pour la traçabilité.
Quand vous effectuez un `PUT /notif/status/:id` pour mettre `{"status": "traitée"}` :

- ❌ **Notification `"panne"` :** Vous obtiendrez une **Erreur 400** si vous ne fournissez pas le champ `worker_name` (le nom du technicien).
- ❌ **Notification `"remplissage"` (Machine pleine) :** Vous obtiendrez une **Erreur 400** si vous ne mettez pas le `worker_name` (le nom du videur).
- ✅ **Notification `"alerte_80"` (Bientôt pleine) :** Vous pouvez envoyer `status: traitée` tout seul.

> 🎁 **Alerte Magie Backend** : Vous n'avez pas besoin de gérer vous-même d'historique ! Une fois clôturée avec succès, le Backend va **muter le message principal** en lui rajoutant une balise texte à la fin `(Bac vidé par : Nom_Du_Gars)`. Vous n'avez qu'à re-fetcher la liste et à l'afficher telle quelle aux Admins !

---

### 3. 🤔 Différence Cruciale : `_id` VS `machine_id`
L'API est très pointilleuse sur la façon de nommer/chercher une Machine dans les requêtes. Vous devez faire la distinction entre :
- `_id` : L'ID pur de base de données MongoDB (ex: `64x8az...`).
- `machine_id` : L'identifiant public personnalisé (ex: `M001`, `RVM-FAC-01`).

👉 **RÈGLE FRONT-END :**
- Pour **Voir les détails d'une machine précise** (`GET /machine/:id`) : Utilisez le **`machine_id`** (ex : /machine/M001).
- Pour **Supprimer une machine** (`DELETE /machine/:id`) : Utilisez le **`machine_id`**.
- Pour **Récupérer les Bacs ou Produits d'une machine précise** (`GET /bin/machine/:id`) : Utilisez l'**`_id`** (MongoDB).

*(Référez-vous toujours au `API_DOCUMENTATION.md` si vous avez un doute).*

---

### 4. 🧮 Pas de calculs mathématiques pour vos Jauges !
Vous devez coder un graphique circulaire (Pie chart) ou des jauges de remplissage de poubelle ? Vous n'avez **aucun produit en croix à faire** !
Lorsque vous appelez la route de détails `GET /machine/:id`, le backend analyse lui-même le poids actuel et la capacité maximum, et **vous donne accès à un attribut virtuel `.fill_percentage`** (ex: `"85%"`). 
Injectez cette valeur brute directement dans vos props CSS/HTML.

---

### 5. 🚫 Pourquoi je reçois des Erreurs 400 sur `/product` ?
Si vous travaillez sur l'application mobile/IoT qui sert à insérer un produit dans la machine via `POST /product/`, attendez-vous à recevoir du texte d'erreur avec un status HTTP 400.
Si vous recevez *"Produit refusé : la capacité maximale du bac sera dépassée"* : **Le Backend n'est pas cassé, il fait son travail**. La poubelle virtuelle associée est simplement certifiée "pleine". Vous devez capter cette exception pour afficher un message Pop-Up rouge à l'utilisateur du genre *"Désolé, cette poubelle est actuellement pleine"*.

---

### 6. ✨ Automatisation et Garbage Collection (Paresse Front-End autorisée)
- **Création de Machine** : Quand vous appelez `POST /machine/create`, ne vous souciez pas des bacs de recyclage. En envoyant la taille `type: "petit"` ou `type: "grand"`, le Backend gère tout (instanciation de deux bacs de 50kg ou 100kg en tâche de fond).
- **Suppression** : Si vous supprimez une Machine, ne créez pas de requêtes API multiples pour nettoyer les traces de la machine. Le Backend supprime tout seul ses notifications liées, ses produits et ses bacs. Laissez le backend gérer ce stress.

# 🌍 Projet RVM_Backend : Vue d'Ensemble de l'Architecture

## 📋 Présentation Générale
Le système **RVM_Backend** ("Reverse Vending Machine") est le pivot central (API REST) conçu pour gérer une infrastructure de recyclage intelligente répartie dans la ville. Ce backend sert de "Tour de Contrôle" et de cerveau entre les **Machines Physiques (IoT)** sur le terrain, **les Employés mobiles** (Techniciens/Videurs) et **les Administrateurs** via leur tableau de bord web.

## 🛠️ Technologies Déployées
- **Environnement** : Node.js avec le framework Express.js.
- **Base de Données** : MongoDB (NoSQL) géré via l'ORM asynchrone Mongoose.
- **Sécurité et Identité** : 
  - Hashage mathématique de mots de passe par `bcrypt`.
  - Gestion sécurisée des connexions via `express-session` (Cookies HTTP-only pour empêcher les failles XSS classiques).

---

## 🏗️ L'Architecture Modulaire de la Base de Données

Le backend est proprement découpé en 6 grands "modules". Chacun possède son propre Modèle de base de données, son propre Contrôleur de logique (le muscle) et ses Routes (points d'accès internet).

### 1. 🤖 Module `Machine` (L'Équipement)
- **Rôle** : Superviser le parc de machines RVM déployées physiquement.
- **Fonctionnalités** : Création intelligente (instancie automatiquement ses 2 poubelles internes selon sa taille : "petit/grand"), géolocalisation pour carte interactive, suivi d'état (actif, en_panne, inactif), et calcul des statistiques de production pour le front-end.
- **Fonction Cascade** : Supprimer une machine nettoiera automatiquement tout ce qu’elle a généré dans le serveur complet.

### 2. 🗑️ Module `RecyclingBin` (Les Poubelles Physiques)
- **Rôle** : Représenter les réceptacles de tri internes (PET / ALU) connectés de chaque machine.
- **Le Lien IoT** : Ce module est "l'oreille" du Cloud pour la vraie machine. La carte Arduino (ou capteur de l'appareil) appellera cette API pour informer l'application Web que sa porte de service a été manipulée et que son poids est retombé à 0.

### 3. ♻️ Module `RecycledProduct` (La Production)
- **Rôle** : Tenir un livre comptable et tracer chaque canette ou bouteille scannée par le capteur optique de la machine.
- **Bouclier Logique (Business Rule)** : C'est ce module qui protège la machine du vandalisme ou des débordements de déchets physiques. Il repousse l'insertion par une Erreur 400 pour empêcher une poubelle matérielle de déborder au-delà de sa limite autorisée (ex: refus du dépôt > 50kg).

### 4. 🔔 Module `Notification` (Alertes automatiques)
- **Rôle** : Mettre en alerte le Dashboard et générer la comptabilité des réparations.
- **Génération Automatique** : S'auto-déclenche seul quand le backend calcule qu'une capacité croise des seuils limites (Bac plein, Alerte de 80%, ou un statut en panne).
- **Règle Stricte** : La clôture d'une telle urgence modifie et gèle définitivement (en lecture seule) le texte de l'intervention pour la traçabilité RH.

### 5. 👥 Module `User` (Le Centre de Commande Admin)
- **Rôle** : Comptes sécurisés centralisant le pouvoir de la plateforme.
- **Fonctionnalités** : Connexion par hash, et accès en lecture directe aux métriques globales : (Poids Aluminium total récolté, Kilos de Plastique générés, le ratio des terminaux).

### 6. 👷 Module `Worker` (Ressources Humaines du Terrain)
- **Rôle** : La base de données en silo des employés logistiques (Ceux qui Vident / Ceux qui Réparent).
- **Concept** : Stratégie de sécurité. Les ouvriers ne se connectent *pas* à l'API afin de bloquer les failles côté applicatif (pas de mot de passe, pas de rôles hybrides complexes). Ce module permet aux Admins d'emprunter et lier un profil humain lors de la résolution d'un problème.

---
## 🎯 M-V-C pur et séparation des rôles (Design Pattern)
Ce projet valide les notions requises de séparation des préoccupations :
1. **Les Models** : Contiennent strictement le *Schema* de données.
2. **Les Controllers** : Hébergent la totalité des algos asynchrones, des calculs de pourcentage, des contraintes d'impossibilité et envoient les codes HTTP finaux.
3. **Les Routes** : Restent minimalistes et lisibles pour que le trafic internet soit réorienté intuitivement en un dixième de seconde.

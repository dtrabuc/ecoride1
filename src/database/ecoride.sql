-- ===============================================
-- 🚗 SCRIPT SQL SIMPLIFIÉ POUR ECORIDE - VERSION 3.0
-- Base de données hybride : MySQL + MongoDB
-- MySQL: Users, Auth, Réservations
-- MongoDB: Trajets, Messages, Évaluations
-- ===============================================

-- 🗑️ Suppression et création de la base de données
DROP DATABASE IF EXISTS ecoride;
CREATE DATABASE ecoride 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
USE ecoride;

-- ===============================================
-- 📋 TABLES MYSQL (ESSENTIELLES)
-- ===============================================

-- 👤 Table des utilisateurs (reste en MySQL pour l'auth)
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(320) UNIQUE NOT NULL COMMENT 'Email unique',
    password VARCHAR(255) NOT NULL COMMENT 'Hash bcrypt du mot de passe',
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    telephone VARCHAR(20),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_active (is_active)
) ENGINE=InnoDB COMMENT='Table des utilisateurs - Authentification';

-- 📝 Table des réservations (MySQL pour les transactions)
CREATE TABLE reservations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    trajet_mongo_id VARCHAR(24) NOT NULL COMMENT 'ObjectId MongoDB du trajet',
    passager_id INT NOT NULL,
    nombre_places INT DEFAULT 1,
    prix_total DECIMAL(8,2) NOT NULL,
    statut ENUM('en_attente', 'confirmee', 'annulee', 'terminee') DEFAULT 'en_attente',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (passager_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_trajet_mongo (trajet_mongo_id),
    INDEX idx_passager (passager_id),
    INDEX idx_statut (statut),
    
    CONSTRAINT chk_places_positives CHECK (nombre_places > 0),
    CONSTRAINT chk_prix_total CHECK (prix_total >= 0)
) ENGINE=InnoDB COMMENT='Table des réservations - Référence MongoDB';

-- ===============================================
-- 📊 DONNÉES DE TEST UTILISATEURS
-- ===============================================

-- 👥 Insertion des utilisateurs de test
INSERT INTO users (email, password, nom, prenom, telephone) VALUES 
('alice.dupont@ecoride.com', '$2b$10$XYZ123HashAlice', 'Dupont', 'Alice', '0123456789'),
('bob.martin@ecoride.com', '$2b$10$ABC456HashBob', 'Martin', 'Bob', '0987654321'),
('charlie.bernard@ecoride.com', '$2b$10$DEF789HashCharlie', 'Bernard', 'Charlie', '0156789234'),
('diana.dubois@ecoride.com', '$2b$10$GHI012HashDiana', 'Dubois', 'Diana', '0134567890'),
('emma.rousseau@ecoride.com', '$2b$10$JKL345HashEmma', 'Rousseau', 'Emma', '0145678901');

-- ===============================================
-- 📋 VÉRIFICATION DES DONNÉES
-- ===============================================

SELECT '=== 👤 UTILISATEURS CRÉÉS ===' AS section;
SELECT id, email, CONCAT(prenom, ' ', nom) AS nom_complet, telephone 
FROM users ORDER BY id;

SELECT '=== ✅ BASE MYSQL CRÉÉE - PRÊTE POUR MONGODB ! ===' AS message;

-- ===============================================
-- 📝 NOTES POUR MONGODB
-- ===============================================
/*
COLLECTIONS MONGODB À CRÉER :

1. 'trajets' - Documents des trajets
{
  _id: ObjectId,
  depart: String,
  destination: String,
  date_depart: Date,
  places_disponibles: Number,
  prix_par_place: Number,
  conducteur_id: Number, // Référence MySQL users.id
  description: String,
  statut: String,
  created_at: Date,
  updated_at: Date
}

2. 'evaluations' - Documents des évaluations
{
  _id: ObjectId,
  reservation_id: Number, // Référence MySQL reservations.id
  evaluateur_id: Number, // Référence MySQL users.id
  evalue_id: Number, // Référence MySQL users.id
  note: Number,
  commentaire: String,
  type: String, // 'conducteur' ou 'passager'
  created_at: Date
}

3. 'messages' - Documents des messages
{
  _id: ObjectId,
  trajet_id: ObjectId, // Référence MongoDB trajets._id
  expediteur_id: Number, // Référence MySQL users.id
  destinataire_id: Number, // Référence MySQL users.id
  contenu: String,
  lu: Boolean,
  created_at: Date
}
*/



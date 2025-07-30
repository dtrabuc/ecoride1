// ===============================================
// 🔧 SERVICE UTILISATEURS - Logique métier MySQL
// Gestion des utilisateurs et authentification
// ===============================================

const pool = require('../config/mysql');

class UserService {
  
  // Récupérer un utilisateur par ID
  static async getUserById(userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id, email, nom, prenom, telephone, is_active, created_at FROM users WHERE id = ?',
        [userId],
        (err, results) => {
          if (err) return reject(err);
          if (results.length === 0) return resolve(null);
          resolve(results[0]);
        }
      );
    });
  }

  // Récupérer plusieurs utilisateurs par IDs
  static async getUsersByIds(userIds) {
    return new Promise((resolve, reject) => {
      if (!userIds || userIds.length === 0) return resolve([]);
      
      const placeholders = userIds.map(() => '?').join(',');
      pool.query(
        `SELECT id, email, nom, prenom, telephone, is_active, created_at 
         FROM users WHERE id IN (${placeholders})`,
        userIds,
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  // Récupérer tous les utilisateurs actifs
  static async getAllActiveUsers() {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id, email, nom, prenom, telephone, created_at FROM users WHERE is_active = true ORDER BY nom, prenom',
        (err, results) => {
          if (err) return reject(err);
          resolve(results);
        }
      );
    });
  }

  // Vérifier si un utilisateur existe et est actif
  static async userExistsAndActive(userId) {
    return new Promise((resolve, reject) => {
      pool.query(
        'SELECT id FROM users WHERE id = ? AND is_active = true',
        [userId],
        (err, results) => {
          if (err) return reject(err);
          resolve(results.length > 0);
        }
      );
    });
  }

  // Enrichir les données avec infos utilisateur
  static async enrichWithUserInfo(data, userIdField = 'conducteur_id') {
    if (!data) return null;
    
    // Si c'est un tableau
    if (Array.isArray(data)) {
      const userIds = [...new Set(data.map(item => item[userIdField]).filter(Boolean))];
      const users = await this.getUsersByIds(userIds);
      const userMap = new Map(users.map(user => [user.id, user]));
      
      return data.map(item => ({
        ...item,
        conducteur: userMap.get(item[userIdField]) || null
      }));
    }
    
    // Si c'est un objet unique
    const user = await this.getUserById(data[userIdField]);
    return {
      ...data,
      conducteur: user
    };
  }

  // Formater les infos utilisateur pour l'API
  static formatUserForApi(user) {
    if (!user) return null;
    
    return {
      id: user.id,
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      telephone: user.telephone,
      nom_complet: `${user.prenom} ${user.nom}`,
      is_active: user.is_active,
      membre_depuis: user.created_at
    };
  }
}

module.exports = UserService;

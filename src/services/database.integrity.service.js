// ===============================================
// 🔄 SERVICE INTÉGRITÉ DATABASES
// Validation croisée MySQL ↔ MongoDB
// ===============================================

const pool = require('../config/mysql');
const Trajet = require('../models/trajet.model');
const UserService = require('./user.service');

class DatabaseIntegrityService {

  // Vérifier la cohérence des données entre MySQL et MongoDB
  static async validateDataIntegrity() {
    try {
      console.log('🔍 Validation de l\'intégrité des données...');
      
      // 1. Vérifier les conducteurs orphelins dans MongoDB
      const orphanedTrajets = await this.findOrphanedTrajets();
      
      // 2. Statistiques générales
      const stats = await this.getIntegrityStats();
      
      return {
        success: true,
        orphanedTrajets,
        stats,
        message: 'Validation terminée'
      };
    } catch (error) {
      throw new Error(`Erreur validation intégrité: ${error.message}`);
    }
  }

  // Trouver les trajets avec des conducteurs inexistants
  static async findOrphanedTrajets() {
    try {
      // Récupérer tous les conducteur_id uniques de MongoDB
      const conducteurIds = await Trajet.distinct('conducteur_id');
      
      if (conducteurIds.length === 0) return [];
      
      // Vérifier lesquels existent dans MySQL
      const existingUsers = await UserService.getUsersByIds(conducteurIds);
      const existingUserIds = existingUsers.map(user => user.id);
      
      // Trouver les IDs orphelins
      const orphanedIds = conducteurIds.filter(id => !existingUserIds.includes(id));
      
      if (orphanedIds.length === 0) return [];
      
      // Récupérer les trajets orphelins
      const orphanedTrajets = await Trajet.find({ 
        conducteur_id: { $in: orphanedIds } 
      });
      
      return orphanedTrajets.map(trajet => ({
        trajet_id: trajet._id,
        conducteur_id: trajet.conducteur_id,
        depart: trajet.depart,
        destination: trajet.destination,
        date_depart: trajet.date_depart
      }));
    } catch (error) {
      throw new Error(`Erreur recherche trajets orphelins: ${error.message}`);
    }
  }

  // Statistiques d'intégrité
  static async getIntegrityStats() {
    try {
      // Compter trajets actifs
      const totalTrajets = await Trajet.countDocuments({ statut: 'actif' });
      
      // Compter utilisateurs actifs
      const activeUsers = await UserService.getAllActiveUsers();
      const totalActiveUsers = activeUsers.length;
      
      // Compter conducteurs uniques dans les trajets
      const uniqueConducteurs = await Trajet.distinct('conducteur_id');
      
      return {
        total_trajets_actifs: totalTrajets,
        total_utilisateurs_actifs: totalActiveUsers,
        conducteurs_uniques: uniqueConducteurs.length,
        integrité_ok: true
      };
    } catch (error) {
      throw new Error(`Erreur calcul statistiques: ${error.message}`);
    }
  }

  // Nettoyer les données orphelines
  static async cleanOrphanedData(force = false) {
    try {
      if (!force) {
        throw new Error('Utilisez force=true pour confirmer la suppression');
      }
      
      const orphanedTrajets = await this.findOrphanedTrajets();
      
      if (orphanedTrajets.length === 0) {
        return { deleted: 0, message: 'Aucune donnée orpheline trouvée' };
      }
      
      const orphanedIds = orphanedTrajets.map(t => t.trajet_id);
      const result = await Trajet.deleteMany({ _id: { $in: orphanedIds } });
      
      return {
        deleted: result.deletedCount,
        message: `${result.deletedCount} trajets orphelins supprimés`
      };
    } catch (error) {
      throw new Error(`Erreur nettoyage données: ${error.message}`);
    }
  }

  // Test de connectivité des deux bases
  static async testConnections() {
    try {
      const results = {
        mysql: false,
        mongodb: false,
        errors: []
      };

      // Test MySQL
      try {
        await new Promise((resolve, reject) => {
          pool.query('SELECT 1 as test', (err, result) => {
            if (err) reject(err);
            else resolve(result);
          });
        });
        results.mysql = true;
      } catch (error) {
        results.errors.push(`MySQL: ${error.message}`);
      }

      // Test MongoDB
      try {
        await Trajet.countDocuments();
        results.mongodb = true;
      } catch (error) {
        results.errors.push(`MongoDB: ${error.message}`);
      }

      return results;
    } catch (error) {
      throw new Error(`Erreur test connexions: ${error.message}`);
    }
  }
}

module.exports = DatabaseIntegrityService;

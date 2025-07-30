// ===============================================
// 🚗 SERVICE TRAJETS - Logique métier MongoDB + MySQL
// Communication entre les deux bases de données
// ===============================================

const Trajet = require('../models/trajet.model');
const UserService = require('./user.service');
const DatabaseIntegrityService = require('./database.integrity.service');

class TrajetService {

  // Récupérer tous les trajets avec infos conducteurs
  static async getAllTrajetsWithConducteurs() {
    try {
      const trajets = await Trajet.find({ statut: 'actif' }).sort({ date_depart: 1 });
      const trajetsPlain = trajets.map(t => t.toJSON());
      return await UserService.enrichWithUserInfo(trajetsPlain, 'conducteur_id');
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des trajets: ${error.message}`);
    }
  }

  // Récupérer un trajet par ID avec infos conducteur
  static async getTrajetByIdWithConducteur(trajetId) {
    try {
      const trajet = await Trajet.findById(trajetId);
      if (!trajet) return null;
      
      const trajetPlain = trajet.toJSON();
      const enrichedTrajet = await UserService.enrichWithUserInfo(trajetPlain, 'conducteur_id');
      return enrichedTrajet;
    } catch (error) {
      throw new Error(`Erreur lors de la récupération du trajet: ${error.message}`);
    }
  }

  // Créer un nouveau trajet avec validation utilisateur
  static async createTrajetWithValidation(trajetData) {
    try {
      // 1. Vérifier que le conducteur existe et est actif
      const userExists = await UserService.userExistsAndActive(trajetData.conducteur_id);
      if (!userExists) {
        throw new Error('Conducteur introuvable ou inactif');
      }

      // 2. Validation supplémentaire des données
      if (!trajetData.conducteur_id || !trajetData.depart || !trajetData.destination) {
        throw new Error('Données obligatoires manquantes');
      }

      // 3. Créer le trajet
      const newTrajet = new Trajet(trajetData);
      await newTrajet.save();
      
      // 4. Récupérer le trajet créé avec les infos conducteur
      const result = await this.getTrajetByIdWithConducteur(newTrajet._id);
      
      // 5. Log pour traçabilité
      console.log(`Trajet cree: ${newTrajet._id} par conducteur ${trajetData.conducteur_id}`);
      
      return result;
    } catch (error) {
      console.error(`Erreur creation trajet:`, error.message);
      throw new Error(`Erreur lors de la création du trajet: ${error.message}`);
    }
  }

  // Mettre à jour un trajet avec validation
  static async updateTrajetWithValidation(trajetId, trajetData) {
    try {
      // Vérifier que le trajet existe
      const existingTrajet = await Trajet.findById(trajetId);
      if (!existingTrajet) {
        throw new Error('Trajet non trouvé');
      }

      // Si le conducteur change, vérifier qu'il existe
      if (trajetData.conducteur_id && trajetData.conducteur_id !== existingTrajet.conducteur_id) {
        const userExists = await UserService.userExistsAndActive(trajetData.conducteur_id);
        if (!userExists) {
          throw new Error('Nouveau conducteur introuvable ou inactif');
        }
      }

      // Mettre à jour le trajet
      const updatedTrajet = await Trajet.findByIdAndUpdate(
        trajetId, 
        trajetData, 
        { new: true, runValidators: true }
      );
      
      // Récupérer le trajet mis à jour avec les infos conducteur
      return await this.getTrajetByIdWithConducteur(updatedTrajet._id);
    } catch (error) {
      throw new Error(`Erreur lors de la mise à jour du trajet: ${error.message}`);
    }
  }

  // Supprimer un trajet
  static async deleteTrajetById(trajetId) {
    try {
      const result = await Trajet.findByIdAndDelete(trajetId);
      if (!result) {
        return { deletedCount: 0 };
      }
      return { deletedCount: 1 };
    } catch (error) {
      throw new Error(`Erreur lors de la suppression du trajet: ${error.message}`);
    }
  }

  // Rechercher des trajets avec filtres
  static async searchTrajets(filters = {}) {
    try {
      let query = { statut: 'actif' };

      // Construire la requête MongoDB
      if (filters.depart) {
        query.depart = new RegExp(filters.depart, 'i');
      }

      if (filters.destination) {
        query.destination = new RegExp(filters.destination, 'i');
      }

      if (filters.date_min) {
        query.date_depart = { $gte: new Date(filters.date_min) };
      }

      if (filters.places_min) {
        query.places_disponibles = { $gte: parseInt(filters.places_min) };
      }

      const trajets = await Trajet.find(query).sort({ date_depart: 1 });
      const trajetsPlain = trajets.map(t => t.toJSON());
      
      // Enrichir avec les infos conducteurs
      return await UserService.enrichWithUserInfo(trajetsPlain, 'conducteur_id');
    } catch (error) {
      throw new Error(`Erreur lors de la recherche de trajets: ${error.message}`);
    }
  }

  // Récupérer les trajets d'un conducteur spécifique
  static async getTrajetsByConducteur(conducteurId) {
    try {
      const trajets = await Trajet.find({ conducteur_id: parseInt(conducteurId) })
                                 .sort({ date_depart: 1 });
      const trajetsPlain = trajets.map(t => t.toJSON());
      return await UserService.enrichWithUserInfo(trajetsPlain, 'conducteur_id');
    } catch (error) {
      throw new Error(`Erreur lors de la récupération des trajets du conducteur: ${error.message}`);
    }
  }

  // 🔧 MÉTHODES D'INTÉGRITÉ ET MAINTENANCE

  // Vérifier l'intégrité des données MySQL ↔ MongoDB
  static async checkDataIntegrity() {
    try {
      return await DatabaseIntegrityService.validateDataIntegrity();
    } catch (error) {
      throw new Error(`Erreur vérification intégrité: ${error.message}`);
    }
  }

  // Nettoyer les trajets avec conducteurs inexistants
  static async cleanOrphanedTrajets(force = false) {
    try {
      return await DatabaseIntegrityService.cleanOrphanedData(force);
    } catch (error) {
      throw new Error(`Erreur nettoyage: ${error.message}`);
    }
  }

  // Test des connexions bases de données
  static async testDatabaseConnections() {
    try {
      return await DatabaseIntegrityService.testConnections();
    } catch (error) {
      throw new Error(`Erreur test connexions: ${error.message}`);
    }
  }
}

module.exports = TrajetService;

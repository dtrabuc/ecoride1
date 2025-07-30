// ===============================================
// 🚗 CONTRÔLEUR TRAJETS - API Routes
// Utilise les services pour la logique métier
// ===============================================

const TrajetService = require('../services/trajet.service');

// Liste de tous les trajets avec infos conducteurs
exports.getAll = async (req, res) => {
  try {
    const trajets = await TrajetService.getAllTrajetsWithConducteurs();
    res.json(trajets);
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer un trajet par ID avec infos conducteur
exports.getOne = async (req, res) => {
  try {
    const trajet = await TrajetService.getTrajetByIdWithConducteur(req.params.id);
    
    if (!trajet) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }
    
    res.json(trajet);
  } catch (error) {
    console.error('Erreur lors de la récupération du trajet:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Créer un nouveau trajet
exports.create = async (req, res) => {
  try {
    const newTrajet = await TrajetService.createTrajetWithValidation(req.body);
    res.status(201).json(newTrajet);
  } catch (error) {
    console.error('Erreur lors de la création du trajet:', error);
    
    if (error.message.includes('Conducteur introuvable')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Mettre à jour un trajet
exports.update = async (req, res) => {
  try {
    const updatedTrajet = await TrajetService.updateTrajetWithValidation(req.params.id, req.body);
    res.json(updatedTrajet);
  } catch (error) {
    console.error('Erreur lors de la mise à jour du trajet:', error);
    
    if (error.message.includes('non trouvé')) {
      return res.status(404).json({ error: error.message });
    }
    
    if (error.message.includes('Conducteur introuvable')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Supprimer un trajet
exports.delete = async (req, res) => {
  try {
    const result = await TrajetService.deleteTrajetById(req.params.id);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Trajet non trouvé' });
    }
    
    res.json({ message: 'Trajet supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du trajet:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Rechercher des trajets avec filtres
exports.search = async (req, res) => {
  try {
    const filters = {
      depart: req.query.depart,
      destination: req.query.destination,
      date_min: req.query.date_min,
      places_min: req.query.places_min
    };
    
    const trajets = await TrajetService.searchTrajets(filters);
    res.json(trajets);
  } catch (error) {
    console.error('Erreur lors de la recherche de trajets:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// Récupérer les trajets d'un conducteur
exports.getByConducteur = async (req, res) => {
  try {
    const trajets = await TrajetService.getTrajetsByConducteur(req.params.conducteurId);
    res.json(trajets);
  } catch (error) {
    console.error('Erreur lors de la récupération des trajets du conducteur:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

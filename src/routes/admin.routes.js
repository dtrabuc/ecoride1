// ===============================================
// 🛠️ ROUTES ADMIN - Maintenance et monitoring
// Gestion de l'intégrité des données
// ===============================================

const express = require('express');
const TrajetService = require('../services/trajet.service');
const router = express.Router();

// Vérifier l'intégrité des données
router.get('/integrity/check', async (req, res) => {
  try {
    const result = await TrajetService.checkDataIntegrity();
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Test des connexions
router.get('/connections/test', async (req, res) => {
  try {
    const connections = await TrajetService.testDatabaseConnections();
    const allConnected = connections.mysql && connections.mongodb;
    
    res.status(allConnected ? 200 : 503).json({
      success: allConnected,
      connections,
      message: allConnected ? 'Toutes les connexions OK' : 'Problème de connexion détecté'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Nettoyer les données orphelines (DANGER - nécessite confirmation)
router.delete('/integrity/clean', async (req, res) => {
  try {
    const { force } = req.query;
    
    if (force !== 'true') {
      return res.status(400).json({
        success: false,
        message: 'Ajoutez ?force=true pour confirmer la suppression'
      });
    }
    
    const result = await TrajetService.cleanOrphanedTrajets(true);
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Statistiques générales
router.get('/stats', async (req, res) => {
  try {
    const integrity = await TrajetService.checkDataIntegrity();
    res.json({
      success: true,
      stats: integrity.stats,
      last_check: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;

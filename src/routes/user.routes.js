const express = require('express');
const router = express.Router();
const { 
  getProfile, 
  getAllUsers, 
  getUserById,
  updateProfile, 
  deleteProfile 
} = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// Routes publiques
router.get('/', getAllUsers);  // Liste tous les utilisateurs
router.get('/:id', getUserById);  // Récupérer un utilisateur par ID

// Routes protégées (authentification requise)
router.get('/me/profile', authMiddleware, getProfile);  // Mon profil
router.put('/me/profile', authMiddleware, updateProfile);  // Modifier mon profil
router.delete('/me/profile', authMiddleware, deleteProfile);  // Supprimer mon compte

module.exports = router;
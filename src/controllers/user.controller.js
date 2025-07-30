const { findByEmail, findById, getAllUsers, updateUser, deleteUser } = require('../models/user.model');

// Récupérer le profil de l'utilisateur connecté
exports.getProfile = (req, res) => {
  const userId = req.user.id;
  findById(userId, (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    // Retourner les données sans le mot de passe
    const { password, ...userData } = user;
    res.json(userData);
  });
};

// Récupérer tous les utilisateurs (admin)
exports.getAllUsers = (req, res) => {
  getAllUsers((err, users) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(users);
  });
};

// Récupérer un utilisateur par ID
exports.getUserById = (req, res) => {
  const userId = req.params.id;
  findById(userId, (err, user) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    
    // Retourner les données sans le mot de passe
    const { password, ...userData } = user;
    res.json(userData);
  });
};

// Mettre à jour le profil de l'utilisateur connecté
exports.updateProfile = (req, res) => {
  const userId = req.user.id;
  const { email, nom, prenom, telephone } = req.body;
  
  if (!email && !nom && !prenom && !telephone) {
    return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });
  }

  // Vérifier si l'email existe déjà (si email modifié)
  if (email) {
    findByEmail(email, (err, existingUser) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (existingUser && existingUser.id !== userId) {
        return res.status(400).json({ error: 'Cet email est déjà utilisé' });
      }
      
      // Mettre à jour l'utilisateur
      updateUser(userId, { email, nom, prenom, telephone }, (err) => {
        if (err) return res.status(400).json({ error: 'Erreur lors de la mise à jour' });
        res.json({ message: 'Profil mis à jour avec succès' });
      });
    });
  } else {
    // Mettre à jour sans changer l'email
    updateUser(userId, { nom, prenom, telephone }, (err) => {
      if (err) return res.status(400).json({ error: 'Erreur lors de la mise à jour' });
      res.json({ message: 'Profil mis à jour avec succès' });
    });
  }
};

// Supprimer son propre compte
exports.deleteProfile = (req, res) => {
  const userId = req.user.id;
  deleteUser(userId, (err) => {
    if (err) return res.status(400).json({ error: 'Erreur lors de la suppression' });
    res.json({ message: 'Compte supprimé avec succès' });
  });
};
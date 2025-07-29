const { findByEmail, createUser } = require('../models/user.model');
const pool = require('../config/mysql');

// Récupérer le profil de l'utilisateur connecté
exports.getProfile = (req, res) => {
  const userId = req.user.id;
  pool.query('SELECT id, email FROM users WHERE id = ?', [userId], (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    if (!results[0]) return res.status(404).json({ error: 'Utilisateur non trouvé' });
    res.json(results[0]);
  });
};

// Récupérer tous les utilisateurs (sans mot de passe)
exports.getAllUsers = (req, res) => {
  pool.query('SELECT id, email FROM users', (err, results) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json(results);
  });
};

// Mettre à jour un utilisateur
exports.updateUser = (req, res) => {
  const userId = req.params.id;
  const { email, password } = req.body;
  if (!email && !password) return res.status(400).json({ error: 'Aucune donnée à mettre à jour' });

  // Vérifier si l'email existe déjà (si email modifié)
  if (email) {
    findByEmail(email, (err, user) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (user && user.id != userId) return res.status(409).json({ error: 'Email déjà utilisé' });

      // Mise à jour
      update();
    });
  } else {
    update();
  }

  function update() {
    const fields = [];
    const values = [];
    if (email) {
      fields.push('email = ?');
      values.push(email);
    }
    if (password) {
      fields.push('password = ?');
      values.push(password);
    }
    values.push(userId);

    pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE id = ?`,
      values,
      (err, result) => {
        if (err) return res.status(500).json({ error: 'Erreur serveur' });
        res.json({ message: 'Utilisateur mis à jour' });
      }
    );
  }
};

// Supprimer un utilisateur
exports.deleteUser = (req, res) => {
  const userId = req.params.id;
  pool.query('DELETE FROM users WHERE id = ?', [userId], (err, result) => {
    if (err) return res.status(500).json({ error: 'Erreur serveur' });
    res.json({ message: 'Utilisateur supprimé' });
  });
};
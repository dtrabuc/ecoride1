const pool = require('../config/mysql');

// Récupérer un utilisateur par email
function findByEmail(email, callback) {
  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Récupérer un utilisateur par ID
function findById(id, callback) {
  pool.query('SELECT * FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Créer un nouvel utilisateur
function createUser(userData, callback) {
  const { email, password, nom, prenom, telephone } = userData;
  pool.query(
    'INSERT INTO users (email, password, nom, prenom, telephone) VALUES (?, ?, ?, ?, ?)',
    [email, password, nom || null, prenom || null, telephone || null],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results.insertId);
    }
  );
}

// Mettre à jour un utilisateur
function updateUser(id, userData, callback) {
  const { email, nom, prenom, telephone } = userData;
  pool.query(
    'UPDATE users SET email = ?, nom = ?, prenom = ?, telephone = ? WHERE id = ?',
    [email, nom, prenom, telephone, id],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results);
    }
  );
}

// Supprimer un utilisateur
function deleteUser(id, callback) {
  pool.query('DELETE FROM users WHERE id = ?', [id], (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

// Récupérer tous les utilisateurs (pour admin)
function getAllUsers(callback) {
  pool.query('SELECT id, email, nom, prenom, telephone, created_at FROM users', (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

module.exports = { 
  findByEmail, 
  findById,
  createUser, 
  updateUser,
  deleteUser,
  getAllUsers
};
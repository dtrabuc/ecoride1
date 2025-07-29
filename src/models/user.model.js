const pool = require('../config/mysql');

// Récupérer un utilisateur par email
function findByEmail(email, callback) {
  pool.query('SELECT * FROM users WHERE email = ?', [email], (err, results) => {
    if (err) return callback(err);
    callback(null, results[0]);
  });
}

// Créer un nouvel utilisateur
function createUser(email, password, callback) {
  pool.query(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [email, password],
    (err, results) => {
      if (err) return callback(err);
      callback(null, results.insertId);
    }
  );
}

module.exports = { findByEmail, createUser };
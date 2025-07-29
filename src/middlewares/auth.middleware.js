const jwt = require('jsonwebtoken');
const pool = require('../config/mysql');

module.exports = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // Recherche l'utilisateur dans la base MySQL
    pool.query('SELECT id, email FROM users WHERE id = ?', [decoded.id], (err, results) => {
      if (err) return res.status(500).json({ error: 'Erreur serveur' });
      if (!results[0]) return res.status(401).json({ error: 'User not found' });
      req.user = results[0];
      next();
    });
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
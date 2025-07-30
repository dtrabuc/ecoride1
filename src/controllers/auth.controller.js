const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { findByEmail, createUser } = require('../models/user.model');

// Inscription d'un nouvel utilisateur
exports.register = (req, res) => {
  const { email, password, nom, prenom, telephone } = req.body;
  
  // Vérifier si l'utilisateur existe déjà
  findByEmail(email, async (err, existingUser) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (existingUser) {
      return res.status(400).json({ error: 'Cet email est déjà utilisé' });
    }
    
    try {
      // Hasher le mot de passe
      const hashedPassword = await bcrypt.hash(password, 10);
      
      // Créer l'utilisateur
      createUser({ email, password: hashedPassword, nom, prenom, telephone }, (err, userId) => {
        if (err) {
          return res.status(400).json({ error: 'Erreur lors de la création de l\'utilisateur' });
        }
        
        // Générer le token JWT
        const token = jwt.sign({ id: userId, email }, process.env.JWT_SECRET, {
          expiresIn: '1d',
        });
        
        res.status(201).json({ 
          message: 'Utilisateur créé avec succès',
          token,
          user: { id: userId, email, nom, prenom }
        });
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors du hashage du mot de passe' });
    }
  });
};

// Connexion d'un utilisateur
exports.login = (req, res) => {
  const { email, password } = req.body;
  
  // Chercher l'utilisateur par email
  findByEmail(email, async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Erreur serveur' });
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }
    
    try {
      // Vérifier le mot de passe
      const isValidPassword = await bcrypt.compare(password, user.password);
      
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
      }
      
      // Générer le token JWT
      const token = jwt.sign({ id: user.id, email: user.email }, process.env.JWT_SECRET, {
        expiresIn: '1d',
      });
      
      res.json({ 
        message: 'Connexion réussie',
        token,
        user: { 
          id: user.id, 
          email: user.email, 
          nom: user.nom, 
          prenom: user.prenom 
        }
      });
    } catch (error) {
      res.status(500).json({ error: 'Erreur lors de la vérification du mot de passe' });
    }
  });
};
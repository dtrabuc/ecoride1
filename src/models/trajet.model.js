// ===============================================
// 🚗 MODÈLE TRAJETS - Mongoose Schema
// Gestion des trajets dans MongoDB avec Mongoose
// ===============================================

const mongoose = require('mongoose');

// Schéma pour les trajets
const trajetSchema = new mongoose.Schema({
  conducteur_id: {
    type: Number,
    required: true,
    ref: 'User' // Référence vers l'utilisateur MySQL (par ID)
  },
  depart: {
    type: String,
    required: true,
    trim: true
  },
  destination: {
    type: String,
    required: true,
    trim: true
  },
  date_depart: {
    type: Date,
    required: true
  },
  heure_depart: {
    type: String,
    required: true
  },
  places_disponibles: {
    type: Number,
    required: true,
    min: 1,
    max: 8
  },
  prix_par_place: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  voiture: {
    marque: {
      type: String,
      trim: true
    },
    modele: {
      type: String,
      trim: true
    },
    couleur: {
      type: String,
      trim: true
    },
    immatriculation: {
      type: String,
      trim: true
    }
  },
  preferences: {
    fumeur_accepte: {
      type: Boolean,
      default: false
    },
    animaux_acceptes: {
      type: Boolean,
      default: false
    },
    discussions: {
      type: String,
      enum: ['aucune', 'limitées', 'ouvertes'],
      default: 'ouvertes'
    },
    musique: {
      type: String,
      enum: ['aucune', 'douce', 'libre'],
      default: 'libre'
    }
  },
  statut: {
    type: String,
    enum: ['actif', 'complet', 'annule', 'termine'],
    default: 'actif'
  },
  arrets_intermediaires: [{
    ville: {
      type: String,
      trim: true
    },
    heure: {
      type: String
    },
    places_restantes: {
      type: Number,
      min: 0
    }
  }]
}, {
  timestamps: true, // Ajoute createdAt et updatedAt automatiquement
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimiser les recherches
trajetSchema.index({ depart: 1, destination: 1, date_depart: 1 });
trajetSchema.index({ conducteur_id: 1 });
trajetSchema.index({ statut: 1 });

// Méthodes d'instance
trajetSchema.methods.toJSON = function() {
  const trajet = this.toObject();
  trajet.id = trajet._id.toString();
  delete trajet._id;
  delete trajet.__v;
  return trajet;
};

// Méthodes statiques
trajetSchema.statics.findByDepartDestination = function(depart, destination) {
  return this.find({
    depart: new RegExp(depart, 'i'),
    destination: new RegExp(destination, 'i'),
    statut: 'actif'
  });
};

trajetSchema.statics.findByConducteur = function(conducteurId) {
  return this.find({ conducteur_id: conducteurId });
};

trajetSchema.statics.findAvailable = function(places_min = 1) {
  return this.find({
    statut: 'actif',
    places_disponibles: { $gte: places_min },
    date_depart: { $gte: new Date() }
  });
};

const Trajet = mongoose.model('Trajet', trajetSchema);

module.exports = Trajet;

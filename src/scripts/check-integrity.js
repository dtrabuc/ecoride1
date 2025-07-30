// ===============================================
// 🔍 SCRIPT DE MAINTENANCE
// Validation périodique de l'intégrité des données
// Usage: node scripts/check-integrity.js
// ===============================================

const dotenv = require('dotenv');
dotenv.config();

const connectMongoDB = require('../config/mongodb');
const TrajetService = require('../services/trajet.service');

async function runIntegrityCheck() {
  console.log('🔍 === VÉRIFICATION INTÉGRITÉ MYSQL ↔ MONGODB ===\n');
  
  try {
    // Connexion MongoDB
    await connectMongoDB();
    console.log('✅ MongoDB connecté\n');
    
    // Test des connexions
    console.log('📡 Test des connexions...');
    const connections = await TrajetService.testDatabaseConnections();
    console.log('MySQL:', connections.mysql ? '✅' : '❌');
    console.log('MongoDB:', connections.mongodb ? '✅' : '❌');
    
    if (connections.errors.length > 0) {
      console.log('Erreurs:', connections.errors);
      return;
    }
    
    console.log('\n🔄 Vérification de l\'intégrité...');
    const integrity = await TrajetService.checkDataIntegrity();
    
    // Affichage des statistiques
    console.log('\n📊 === STATISTIQUES ===');
    console.log(`Trajets actifs: ${integrity.stats.total_trajets_actifs}`);
    console.log(`Utilisateurs actifs: ${integrity.stats.total_utilisateurs_actifs}`);
    console.log(`Conducteurs uniques: ${integrity.stats.conducteurs_uniques}`);
    
    // Affichage des problèmes
    if (integrity.orphanedTrajets.length > 0) {
      console.log('\n⚠️  === TRAJETS ORPHELINS DÉTECTÉS ===');
      integrity.orphanedTrajets.forEach(trajet => {
        console.log(`- Trajet ${trajet.trajet_id} (conducteur inexistant: ${trajet.conducteur_id})`);
        console.log(`  ${trajet.depart} → ${trajet.destination} le ${trajet.date_depart}`);
      });
      
      console.log(`\n🧹 Pour nettoyer: node scripts/clean-orphaned.js`);
    } else {
      console.log('\n✅ Aucune donnée orpheline détectée');
    }
    
    console.log('\n🎉 Vérification terminée avec succès');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
  } finally {
    process.exit(0);
  }
}

// Exécution du script
runIntegrityCheck();

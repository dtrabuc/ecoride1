const app = require('./app');
const dotenv = require('dotenv');
const connectMongoDB = require('./config/mongodb');
const mysqlPool = require('./config/mysql'); // Import du pool MySQL
dotenv.config();

const PORT = process.env.PORT || 5000;

// Fonction de démarrage avec vérification des connexions
const startServer = async () => {
  try {
    // 1. Connexion MongoDB
    await connectMongoDB();
    console.log('MongoDB connecte');
    
    // 2. Test connexion MySQL
    mysqlPool.getConnection((err, connection) => {
      if (err) {
        console.error('Erreur connexion MySQL:', err);
        process.exit(1);
      } else {
        console.log('MySQL connecte');
        connection.release(); // Libérer la connexion test
        
        // 3. Démarrer le serveur seulement si les 2 BD sont OK
        app.listen(PORT, () => {
          console.log(`Serveur lancé sur http://localhost:${PORT}`);
        });
      }
    });
    
  } catch (error) {
    console.error('Erreur de demarrage du serveur:', error);
    process.exit(1);
  }
};

startServer();
const app = require('./app');
const dotenv = require('dotenv');
const connectMongoDB = require('./config/mongodb');
const connectMySQL = require('./config/mysql');
dotenv.config();

const PORT = process.env.PORT || 5000;

/* Connect to MongoDB and MySQL
connectMongoDB();
connectMySQL();
*/
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
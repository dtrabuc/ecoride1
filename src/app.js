const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const userRoutes = require('./routes/user.routes');
const trajetRoutes = require('./routes/trajet.routes');
const adminRoutes = require('./routes/admin.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.use('/users', userRoutes);
app.use('/trajets', trajetRoutes);
app.use('/admin', adminRoutes); // Routes de maintenance

module.exports = app;
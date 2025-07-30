const express = require('express');
const router = express.Router();
const { 
  getAll, 
  getOne, 
  create, 
  update, 
  delete: deleteTrajet,
  search,
  getByConducteur 
} = require('../controllers/trajet.controller');

// Routes principales
router.get('/', getAll);
router.get('/search', search); // Route de recherche avant /:id
router.get('/conducteur/:conducteurId', getByConducteur);
router.get('/:id', getOne);
router.post('/', create);
router.put('/:id', update);
router.delete('/:id', deleteTrajet);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getProfile, getAllUsers, updateUser, deleteUser } = require('../controllers/user.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.get('/me', authMiddleware, getProfile);
router.get('/', getAllUsers);
router.put('/:id', authMiddleware, updateUser);
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
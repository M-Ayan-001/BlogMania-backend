const express = require('express');
const router = express.Router();

const { register, login, logout, authenticate, getUser } = require('../controllers/user-controller.js');

router.post('/register', register);
router.post('/login', login);
router.get('/authenticate', authenticate);
router.get('/getuser', getUser)
router.get('/logout', logout);


module.exports = router;
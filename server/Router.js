const express = require('express');
const router = express.Router();

const UserController = require('./Controller.js');

router.post('/register', UserController.create);
router.post('/login', UserController.login);
router.get('/login_jwt', UserController.loginJWT);
router.delete('/delete', UserController.delete);
router.put('/update_username', UserController.updateUsername);

module.exports = router;
const express = require('express');
const router = express.Router();

const UserController = require('./Controller.js');
const authenticateAndValidateUser = require('./Middleware.js');

router.post('/register', UserController.create);
router.post('/login', UserController.login);

router.get('/login_jwt', UserController.loginJWT);
router.delete('/delete', UserController.delete);

router.put('/update_username', authenticateAndValidateUser, UserController.updateUsername);
router.put('/update_email', authenticateAndValidateUser, UserController.updateEmail);

module.exports = router;
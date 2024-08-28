const express = require('express');
const router = express.Router();

const UserController = require('./Controller.js');

router.post('/register', UserController.create);
router.post('/login', UserController.login);
router.get('/login_jwt', UserController.loginJWT);
router.delete('/delete', UserController.delete);
// router.put('/:user_id', UserController.update);

module.exports = router;
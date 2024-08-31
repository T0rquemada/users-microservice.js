const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const db = require('./database'); 
const User = require('./UserSchema.js'); 

async function authenticateAndValidateUser(req, res, next) {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT); 

        if (!decoded.user_id) {
            return res.status(400).json({ success: false, message: 'Invalid token: user_id not provided' });
        }

        if (!decoded.password) {
            return res.status(400).json({ success: false, message: 'Invalid userdata: password not provided' });
        }

        const user = await db.findById(User, decoded.user_id);
        if (!user) {
            return res.status(400).json({ success: false, message: 'User not found!' });
        }

        const isMatch = await bcrypt.compare(decoded.password, user.password);
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Password does not match' });
        }

        req.user = user; // Attach the user object to the request
        next(); // Proceed to the next middleware or controller function
    } catch (err) {
        console.error('Authentication and validation failed:', err);
        return res.status(500).json({ success: false, message: 'Server error' });
    }
}

module.exports = authenticateAndValidateUser;

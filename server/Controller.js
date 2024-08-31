const User = require('./UserSchema.js'); 
const db = require('./database.js');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT;
const jwtExpire = process.env.JWT_EXPIRE;

function generateJWT(user) {
    let { user_id, email, password } = user;

    console.log('Generating token for user_id:', user_id);

    const userInToken = { user_id: user_id, email: email, password: password };
    return jwt.sign(userInToken, jwtSecret, { expiresIn: jwtExpire });
}

function parseJWT(token) {
    try {
        const decoded = jwt.verify(token, jwtSecret);
        return decoded; 
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            console.error('JWT expired: ', err);
        } else {
            console.error('Error while parseJWT(): ', err);
        }
        
        return null; 
    }
}

class UserController {
    async create(req, res) {
        let {username, email, password} = req.body;

        if (!username) return res.status(400).json({ message: "Username is required!" });
        if (!email) return res.status(400).json({ message: "Email is required!" });
        if (!password) return res.status(400).json({ message: "Password is required!" });

        // Check userdata for containing spaces
        if (email.includes(' ')) return { code: 400, response: { message: "Email can't contain spaces!" } };
        if (password.includes(' ')) return { code: 400, response: { message: "Password can't contain spaces!" } };
        if (username.includes(' ')) return { code: 400, response: { message: "Username can't contain spaces!" } };

        if (username.length <= 3) return res.status(400).json({message: "Username can't be shorter than 3 characters!"});
        if (password.length <= 8) return res.status(400).json({message: "Password can't be shorter than 8 characters!"});
        if (!email.includes('@')) return res.status(400).json({message: "Email should contain '@'!"});

        const hashed_pass = await bcrypt.hash(password, 10);

        try {
            const createdUser = await db.create(User, { username: username, email: email, password: hashed_pass });
            
            let userId = createdUser._id;
            console.error('user_id2: ', userId);
            let token = generateJWT({ user_id: userId, email: email, password: password });

            return res.status(201).json({ message: "User created succesfully!", token: token || null });
        } catch (err) {
            console.error('Error registering user: ', err);
            return res.status(400).json({ message: "Error registering user: ", err });
        }
    }

    // Login depending on JWT
    async loginJWT(req, res) {
        const authHeader = req.headers['authorization'];

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'No token provided' });
        }
    
        const token = authHeader.split(' ')[1];

        try {
            const decoded = parseJWT(token);

            if (!decoded.user_id) {
                return res.status(400).json({ success: false, message: 'Invalid token: user_id not provided' });
            }

            if (!decoded.password || !decoded.email) {
                return res.status(400).json({ success: false, message: 'Invalid userdata: email or password not provided' });
            }

            let result = await db.findById(User, decoded.user_id);

            if (!result) {
                return res.status(400).json({ success: false, message: 'User not found!' });
            }

            if (result.email !== decoded.email) {
                return res.status(401).json({ success: false, message: 'Email does not match' });
            }

            let isMatch = await bcrypt.compare(decoded.password, result.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Password does not match' });
            }

            return res.status(200).json({ success: true, message: 'Login successful' });
        } catch (err) {
            console.error('Token verification failed: ', err);
            return res.status(401).json({ success: false, message: `Token verification failed: ${err.message}` });
        }
    }

    async login(req, res) {
        let { email, password } = req.body;

        if (!email) return res.status(400).json({ success: false, message: "Email is required!" });
        if (!password) return res.status(400).json({ success: false, message: "Password is required!" });

        try {
            const user = await db.find(User, { email: email });

            if (!user) return res.status(401).json({ success: false, message: 'User not found' });

            let isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ success: false, message: 'Password does not match' });
            }

            let token = generateJWT({ user_id: user._id, email: email, password: password});
            return res.status(200).json({ success: true, message: "Logged succesfully!", token: token });
        } catch (err) {
            console.error('Error while login: ', err);
            return res.status(500).json({ success: false, message: err.message });
        }
    }

    async delete(req, res) {
        const token = req.headers['authorization'].split(' ')[1];

        if (!token) {
            return res.status(400).json({ message: "JWT is required!" });
        }

        try {
            let decodedToken = parseJWT(token);
            if (decodedToken === null) return res.status(401).json({ message: "Unauthorized: JWT expired" });

            let userId = decodedToken.user_id;
            if (!userId) return res.status(500).json({ message: "User id from JWT not found" });

            await db.delete(User, userId);

            return res.status(200).json({ message: "User deleted!" });
        } catch (err) {
            console.error('Error while deleting user:', err);
            return res.status(500).json({ message: err });
        }
      }

    async updateUsername(req, res) {
        const new_username = req.body.new_username;

        if (!new_username) return res.status(400).json({ success: false, message: 'No new username provided!' });

        try {
            await db.updateUsername(User, req.user._id, new_username);
            return res.status(200).json({ success: true, message: 'Username updated successfully!' });
        } catch (err) {
            console.error('Error updating username: ', err);
            return res.status(500).json({ success: false, error_message: err });
        }
    }

    async updateEmail(req, res) {
        const new_email = req.body.new_email;

        if (!new_email) return res.status(400).json({ success: false, message: 'No new email provided!' });
        if (!new_email.includes('@')) return res.status(400).json({ success: false, message: "Email should contain '@'!"});

        try {
            await db.updateEmail(User, req.user._id, new_email);
            return res.status(200).json({ success: true, message: 'Email updated successfully!' });
        } catch (err) {
            console.error('Error updating email: ', err);
            return res.status(500).json({ success: false, error_message: err });
        }
    }
}

module.exports =  new UserController();
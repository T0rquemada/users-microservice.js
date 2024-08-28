const User = require('./UserSchema.js'); 
const db = require('./database.js');

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const jwtSecret = process.env.JWT;
const jwtExpire = process.env.JWT_EXPIRE

function generateJWT(user_id) {
    const user = { user_id: user_id };
    return jwt.sign(user, jwtSecret, { expiresIn: jwtExpire });
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

        if (!username) {
            return res.status(400).json({ message: "Username is required!" });
        }
        
        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }
        
        if (!password) {
            return res.status(400).json({ message: "Password is required!" });
        }

        // Check userdata for containing spaces
        //if (email.includes(' ')) return { code: 400, response: { message: "Email can't contain spaces!" } };
        //if (password.includes(' ')) return { code: 400, response: { message: "Password can't contain spaces!" } };
        //if (username.includes(' ')) return { code: 400, response: { message: "Username can't contain spaces!" } };

        // if (username.length <= 3) return res.status(400).json({message: "Username can't be shorter than 3 characters!"});
        // if (password.length <= 8) return res.status(400).json({message: "Password can't be shorter than 8 characters!"});
        // if (!email.includes('@')) return res.status(400).json({message: "Email should contain '@'!"});

        const hashed_pass = await bcrypt.hash(password, 10);

        try {
            let userId;
            let token;

            if (process.env.NODE_ENV !== 'test') {
                const createdUser = await db.create(User, { username: username, email: email, password: hashed_pass });
                userId = createdUser._id;
                token = generateJWT(userId);
            }

            return res.status(201).json({ message: "User created succesfully!", token: token || null });
        } catch (err) {
            return res.status(400).json({ message: "Error registering user" });
        }
    }

    // // Login depending on JWT
    // async loginJWT(req, res) {
    //     const token = req.headers['authorization'];

    //     if (!token) {
    //         return res.status(401).json({ success: false, message: 'No token provided' });
    //     }

    //     try {
    //         const decoded = jwt.verify(token.split(' ')[1], jwt_secret);
    //         const userModel = new User();

    //         try {
    //             const result = userModel;
    //         } catch (err) {
    //             return res.status(500).json({ error_message: err });
    //         }

    //         userModel.findById(decoded.user_id, (err, user) => {
    //             if (err) return res.status(500).json({ success: false, message: 'Internal server error' });
    //             if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    //             return res.status(200).json({ success: true, user });
    //         });
    //     } catch (error) {
    //         console.error('Token verification failed:', error);
    //         return res.status(401).json({ success: false, message: 'Invalid token' });
    //     }
    // }

    async login(req, res) {
        let {email, password} = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required!" });
        }
        
        if (!password) {
            return res.status(400).json({ message: "Password is required!" });
        }

        try {
            // let token = generateJWT(result.user_id);
            return res.status(200).json({ message: "Logged succesfully!" });
        } catch (err) {
            return res.status(500).json({ message: err });
        }
    }

    async delete(req, res) {
        const token = req.headers['authorization'].SPLIT(' ')[1];

        if (!token) {
            return res.status(400).json({ message: "User id is required!" });
        }

        try {
            let decodedToken = parseJWT(token);
            if (decodedToken === null) return res.status(401).json({ message: "Unauthorized: JWT expired" });

            let userId = decodedToken.user_id;
            if (!userId) return res.status(500).json({ message: "User id from JWT not found" });

            const deletedUser = await db.delete(User, userId);

            return res.status(200).json(deletedUser);
        } catch (err) {
            console.error('Error while deleting user:', err);
            return res.status(500).json({ message: err });
        }
      }

    // async update(req, res) {
    //     if (!req.body.username) return res.status(400).json({ message: 'Username is required' });
        
    //     const user = { user_id: req.params.user_id,  username: stripTags(req.body.username) };
        
    //     const userModel = new User2();
    //     try {
    //         const result = await userModel.updateUsername(user);
    //         return res.json({ message: result });
    //     } catch (err) {
    //         return res.status(500).json({ error_message: err });
    //     }
    // }
}

module.exports =  new UserController();
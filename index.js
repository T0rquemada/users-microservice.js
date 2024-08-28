const express = require('express');
const cors = require('cors');

const UsersRouter = require('./server/Router.js');

const corsOptions = {
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'], 
    allowedHeaders: ['Content-Type', 'Authorization'], 
};

const app = express();
const PORT = 3006;

app.use(cors(corsOptions));
app.use(express.json());

app.use('/users', UsersRouter);

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
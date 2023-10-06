const express = require('express');
const cors = require('cors');
const colors = require('colors');
const { errorHandler } = require('./backend/middleware/errorMiddleware');
const connectDB = require('./backend/config/db');

connectDB();

const app = express();
app.use(cors())

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/goals', require('./backend/routes/goalRoutes'));
app.use('/api/users', require('./backend/routes/userRoutes'));

app.get('/', (req, res) => res.send('Hello'));

app.use(errorHandler);

module.exports = app;
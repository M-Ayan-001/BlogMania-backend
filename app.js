const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const dotenv = require("dotenv");

dotenv.config();

const router = require('./routes/user-routes.js');
const blogrouter = require('./routes/blog-routes.js');

const app = express();

// ✅ Connect DB (runs at cold start, not per request)
if (!mongoose.connection.readyState) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log('✅ Database connected'))
        .catch((err) => console.error('❌ DB connection error:', err));
}

app.use(cors({
    origin: 'https://blogmania-ayan.vercel.app',
    credentials: true
}));

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/user', router);
app.use('/api/blog', blogrouter);

// ❌ NO app.listen() on Vercel
// ✅ Export app for Vercel
module.exports = app;

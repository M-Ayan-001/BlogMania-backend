const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const dotenv = require("dotenv");
dotenv.config();


const router = require('./routes/user-routes.js');
const blogrouter = require('./routes/blog-routes.js');

const app = express();

mongoose.connect(process.env.MONGO_URI).then(() => {
    console.log('Database is connected');
}).catch((err) => {
    console.log(err);
})

app.use(cors({
    origin: 'https://blogmania-ayan.vercel.app',
    credentials: true
}))

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/user', router);
app.use('/api/blog', blogrouter);

const PORT = process.env.PORT || 3000

app.listen(PORT, () => {
    console.log('Server is running')
})

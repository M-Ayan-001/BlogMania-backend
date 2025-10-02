const mongoose = require('mongoose');

const userSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    }],
    dislikes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'blog'
    }]
})

module.exports = mongoose.model('user', userSchema); 
const mongoose = require('mongoose')

const blogSchema = mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    image: {
        data: Buffer,
        contentType: String
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    likes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ],
    dislikes: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'user',
        }
    ]
})

module.exports = mongoose.model('blog', blogSchema)
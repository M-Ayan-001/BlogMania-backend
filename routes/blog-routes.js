const multer = require("multer");
const express = require('express');
const blogrouter = express.Router();
const { isLoggedIn } = require('../middlewares/isLoggedIn.js');
const { getBlogs, getMyBlogs, createBlog, updateBlog, viewBlog, deleteBlog, likeBlog, dislikeBlog, getMyLikdeBlogs, getMyDisLikedBlogs } = require('../controllers/blog-controller.js');

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


blogrouter.get('/allblogs', getBlogs);
blogrouter.get('/myblogs/:id', isLoggedIn, getMyBlogs);
blogrouter.post('/createblog', isLoggedIn, upload.single("image"), createBlog)
blogrouter.get('/viewblog/:id', viewBlog)
blogrouter.put('/updateblog/:id', isLoggedIn, upload.single("image"), updateBlog)
blogrouter.delete('/deleteblog/:id', isLoggedIn, deleteBlog)
blogrouter.put('/like/:id', isLoggedIn, likeBlog)
blogrouter.put('/dislike/:id', isLoggedIn, dislikeBlog)
blogrouter.get('/mylikedblogs/:id', isLoggedIn, getMyLikdeBlogs)
blogrouter.get('/mydislikedblogs/:id', isLoggedIn, getMyDisLikedBlogs )

module.exports = blogrouter
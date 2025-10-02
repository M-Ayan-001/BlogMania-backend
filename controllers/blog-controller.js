const jwt = require("jsonwebtoken")
const blogModel = require("../models/blog.js");
const userModel = require("../models/user.js");

const dotenv = require("dotenv");
dotenv.config();

const getBlogs = async (req, res) => {
    try {
        const blogs = await blogModel.find().populate('user').lean();

        blogs.forEach((blog) => {
            if (blog.image && blog.image.data) {
                blog.image.data = blog.image.data.toString('base64');
            }
        })

        res.status(200).json({ message: "Blogs fetched successfully", blogs: blogs });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const getMyBlogs = async (req, res) => {
    try {
        const { id } = req.params

        const blogs = await blogModel.find({ user: id }).populate('user').lean();

        blogs.forEach((blog) => {
            if (blog.image && blog.image.data) {
                blog.image.data = blog.image.data.toString('base64');
            }
        })

        res.status(200).json({ message: "Blogs fetched successfully", blogs: blogs });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const createBlog = async (req, res) => {
    try {
        const { title, description } = req.body
        const user = await userModel.findOne({ email: req.checkedUser.email })
        const newBlog = await blogModel.create({
            title,
            description,
            image: {
                data: req.file.buffer,
                contentType: req.file.mimetype
            },
            user: user._id
        })
        user.blogs.push(newBlog._id)
        await user.save()

        res.status(200).json({ message: "Blog created successfully", route: true })

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const updateBlog = async (req, res) => {
    try {
        const { title, description } = req.body
        const blog = await blogModel.findOne({ _id: req.params.id })

        if (blog) {
            if (req.file) {
                const requiredBlog = await blogModel.findOneAndUpdate({ _id: req.params.id }, {
                    title, description, image: {
                        data: req.file.buffer,
                        contentType: req.file.mimetype
                    }
                }, { new: true })
                return res.status(200).json({ message: "Blog updated successfully" })
            } else {
                const requiredBlog = await blogModel.findOneAndUpdate({ _id: req.params.id }, {
                    title, description
                }, { new: true })
                return res.status(200).json({ message: "Blog updated successfully" })
            }
        } else {
            return res.status(404).json({ message: "Blog not found" })
        }

    } catch (err) {
        res.status(403).json({ message: "Server error", error: err.message })
    }
}

const viewBlog = async (req, res) => {
    try {
        const blog = await blogModel.findOne({ _id: req.params.id })

        if (!blog) {
            return res.status(404).json({ message: "Blog not found", blog: null })
        }

        if (!req.cookies.token) {
            return res.status(200).json({ message: "Blog fetched successfully no login", blog: blog, owner: false })
        }
        const cookieData = jwt.verify(req.cookies.token, process.env.JWT_SECRET)

        const user = await userModel.findOne({ email: cookieData.email })

        if (blog.user.toString() === user._id.toString()) {
            return res.status(200).json({ message: "Blog fetched successfully with owner", blog: blog, owner: true })
        }

        res.status(200).json({ message: "Blog fetched successfully no owner", blog: blog, owner: false })

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const deleteBlog = async (req, res) => {
    try {
        const blog = await blogModel.findOne({ _id: req.params.id })

        if (blog) {
            const user = await userModel.findOne({ email: req.checkedUser.email })
            if (user) {
                await Promise.all([
                    userModel.updateOne({ _id: user._id }, { $pull: { blogs: blog._id } }),
                    blogModel.findOneAndDelete({ _id: req.params.id })
                ])
                res.status(200).json({ message: "Blog deleted successfully" })
            } else {
                return res.status(404).json({ message: "User not found" })
            }
        } else {
            return res.status(404).json({ message: "Blog not found" })
        }

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const likeBlog = async (req, res) => {
    try {

        const user = await userModel.findOne({ email: req.checkedUser.email })
        const blog = await blogModel.findOne({ _id: req.params.id })

        const userID = user._id
        const blogID = blog._id

        const alreadyLiked = blog.likes.some(id => id.toString() === userID.toString());
        const alreadyDisliked = blog.dislikes.some(id => id.toString() === userID.toString());

        if (alreadyLiked) {

            await Promise.all([
                blogModel.updateOne({ _id: blogID }, { $pull: { likes: userID } }),
                userModel.updateOne({ _id: userID }, { $pull: { likes: blogID } })
            ])
            return res.status(200).json({ message: "Blog like removed successfully", user: true })

        } else if (alreadyDisliked) {

            await Promise.all([
                blogModel.updateOne({ _id: blogID }, { $pull: { dislikes: userID }, $addToSet: { likes: userID } }),
                userModel.updateOne({ _id: userID }, { $pull: { dislikes: blogID }, $addToSet: { likes: blogID } })
            ])

            return res.status(200).json({ message: "Blog liked successfully", user: true })

        } else {

            await Promise.all([
                blogModel.updateOne({ _id: blogID }, { $addToSet: { likes: userID } }),
                userModel.updateOne({ _id: userID }, { $addToSet: { likes: blogID } })
            ])

            return res.status(200).json({ message: "Blog liked successfully", user: true })
        }


    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const dislikeBlog = async (req, res) => {
    try {

        const user = await userModel.findOne({ email: req.checkedUser.email })
        const blog = await blogModel.findOne({ _id: req.params.id })

        const userID = user._id
        const blogID = blog._id

        const alreadyLiked = blog.likes.some(id => id.toString() === userID.toString());
        const alreadyDisliked = blog.dislikes.some(id => id.toString() === userID.toString());

        if (alreadyDisliked) {

            await Promise.all([
                blogModel.updateOne({ _id: blogID }, { $pull: { dislikes: userID } }),
                userModel.updateOne({ _id: userID }, { $pull: { dislikes: blogID } })
            ])

            res.status(200).json({ message: "Blog dislike removed successfully", user: true })

        } else if (alreadyLiked) {

            await Promise.all([
                blogModel.updateOne({ _id: blogID }, { $pull: { likes: userID }, $addToSet: { dislikes: userID } }),
                userModel.updateOne({ _id: userID }, { $pull: { likes: blogID }, $addToSet: { dislikes: blogID } })
            ])

            res.status(200).json({ message: "Blog disliked successfully", user: true })

        } else {

            await Promise.all([
                blogModel.updateOne({ _id: blogID }, { $addToSet: { dislikes: userID } }),
                userModel.updateOne({ _id: userID }, { $addToSet: { dislikes: blogID } })
            ])

            res.status(200).json({ message: "Blog disliked successfully", user: true })
        }

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const getMyLikdeBlogs = async (req, res) => {
    try {
        const { id } = req.params

        const user = await userModel.findOne({ _id: id}).populate('likes').lean();
        const blogs = await blogModel.find({ _id: { $in: user.likes } }).populate('user').lean();

        blogs.forEach((blog) => {
            if (blog.image && blog.image.data) {
                blog.image.data = blog.image.data.toString('base64');
            }
        })

        res.status(200).json({ message: "Blogs fetched successfully", blogs: blogs });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const getMyDisLikedBlogs = async (req, res) => {
    try {
        const { id } = req.params

        const user = await userModel.findOne({ _id: id}).populate('dislikes').lean();
        const blogs = await blogModel.find({ _id: { $in: user.dislikes } }).populate('user').lean();

        blogs.forEach((blog) => {
            if (blog.image && blog.image.data) {
                blog.image.data = blog.image.data.toString('base64');
            }
        })

        res.status(200).json({ message: "Blogs fetched successfully", blogs: blogs });
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}



module.exports = { getBlogs, getMyBlogs, createBlog, updateBlog, viewBlog, deleteBlog, likeBlog, dislikeBlog, getMyLikdeBlogs, getMyDisLikedBlogs};
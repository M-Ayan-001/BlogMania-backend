const jwt = require('jsonwebtoken');

const dotenv = require("dotenv");
dotenv.config();

const isLoggedIn = (req, res, next) => {
    try {
        if (!req.cookies.token) {
            return res.status(200).json({ message: "Not Authenticated", user: false })
        }
        const cookieData = jwt.verify(req.cookies.token, process.env.JWT_SECRET)
        req.checkedUser = cookieData
        next()
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

module.exports = { isLoggedIn }
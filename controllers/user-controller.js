const jwt = require("jsonwebtoken")
const bcrypt = require("bcrypt");
const userModel = require("../models/user.js");

const dotenv = require("dotenv");
dotenv.config();

const register = async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const existingUser = await userModel.findOne({ email })

        if (existingUser) {
            return res.status(409).json({ message: "User already exists" })
        } else {
            const hashedPassword = await bcrypt.hash(password, 10)
            const newUser = await userModel.create({
                username,
                email,
                password: hashedPassword
            })

            const token = jwt.sign({ email: newUser.email }, process.env.JWT_SECRET)
            res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
            res.status(200).json({ message: "User Created", user: newUser })
        }
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body

        const existingUser = await userModel.findOne({ email })

        if (!existingUser) {
            return res.status(401).json({ message: "Invalid email or Password" })
        }

        const match = await bcrypt.compare(password, existingUser.password)
        if (!match) {
            return res.status(401).json({ message: "Invalid email or Password" })
        }

        const token = jwt.sign({ email: existingUser.email }, process.env.JWT_SECRET)
        res.cookie("token", token, { httpOnly: true, secure: true, sameSite: "none" })
        res.status(200).json({ message: "Logged in Successfully" })

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const logout = (req, res) => {
    try {
        res.cookie("token", "", { httpOnly: true, secure: true, sameSite: "none" })
        res.status(200).json({ message: "Logged out Successfully" })
    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const authenticate = (req, res) => {
    try {
        if (!req.cookies.token) {
            return res.status(200).json({ message: "Not Authenticated", user: false })
        }
        return res.status(200).json({ message: "Authenticated meow", user: true })

    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}

const getUser = async (req, res) => {
    try {

        if (!req.cookies.token) {
            return res.status(200).json({ message: "Not Authenticated", user: false })
        }
        const cookieData = jwt.verify(req.cookies.token, process.env.JWT_SECRET)

        const user = await userModel.findOne({ email: cookieData.email })

        if (!user) {
            return res.status(200).json({ message: "No User found", user: false })
        }

        res.status(200).json({ message: "Authenticated meow", user: user })


    } catch (err) {
        res.status(500).json({ message: "Server error", error: err.message })
    }
}




module.exports = { register, login, logout, authenticate, getUser };


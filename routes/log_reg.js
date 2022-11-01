const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String,
    cash: Number,
    token: {type: String},
    winCount: Number
})

const User = mongoose.model("User", userSchema)
router.route("/register").post(async (req, res, next) => {

    const {user} = await req.body

    console.log(user)

    if (!user.name || !user.password || !user.email) {
        return res.status(400).send("All input is required");
    }

    const userByEmail = await User.findOne({email: user.email})
    const userByName = await User.findOne({name: user.name})

    if (userByName || userByEmail) {
        return res.status(409).send("User Already Exist. Please Login");
    }

    let encryptedPassword = await bcrypt.hash(user.password, 10);


    const newUser = await new User({
        name: user.name,
        email: user.email,
        password: encryptedPassword,
        cash: 1000,
        winCount: 0
    })

    const email = user.email

    newUser.token = jwt.sign(
        {newUser_id: newUser._id, email},
        process.env.TOKEN_KEY,
        {
            expiresIn: "2h",
        }
    )
    await newUser.save()

    res.status(201).json({newUser});
    next()
})

router.route("/login").post(async (req, res, next) => {
    const {userToLogin} = req.body

    if (!(userToLogin.password && userToLogin.email)) {
        return res.status(400).send("All input is required");
    }

    const user = await User.findOne({email: userToLogin.email})

    const email = userToLogin.email

    if (user && (await bcrypt.compare(userToLogin.password, user.password))) {
        user.token = jwt.sign(
            {user_id: user._id, email},
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        )
    } else {
        return res.status(400).send("Invalid Credentials");
    }
    res.status(200).json({user})
    next()
})
module.exports = router
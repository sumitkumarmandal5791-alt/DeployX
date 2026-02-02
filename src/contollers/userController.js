const redisClient = require("../config/Reddis")
const User = require("../Schema/userSchema")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const { validate } = require("../utils/validator")



const Register = async (req, res) => {
    try {

        //validate the data
        validate(req.body)

        //ye email already exist to nahi karta
        const isEmailExist = await User.findOne({ email: req.body.email })
        if (isEmailExist)
            throw new Error("Email already exist")

        //password ko hash kar do
        req.body.password = await bcrypt.hash(req.body.password, 10)

        req.body.role = 'USER'

        //regsister the user in data base
        const person = await User.create(req.body)
        const reply = {
            name: person.name,
            email: person.email,
            _id: person._id,
            role: person.role
        }


        //user is verified so send him a jwt token sa he can take access of all the data

        //create Jwt token
        const token = jwt.sign({ _id: person._id, email: person.email, role: 'USER' }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })

        //send along with req.token inside the cookie
        res.cookie("token", token, { maxAge: 60 * 60 * 1000 })
        res.status(201).json({
            user: reply,
            message: "User is registered"
        })

    }

    catch (error) {
        res.status(400).send(error.message)
    }
}

const Login = async (req, res) => {

    try {
        //user send emailid and password for login
        const { email, password } = req.body

        if (!email || !password)
            throw new Error("All fields are mandatory")

        //find the user in databse by emailid

        const person = await User.findOne({ email: email }).select("+password")
        if (!person)
            throw new Error("User not found")


        //cpmpare password given from user and stored in databse
        const isPasswordMatched = await bcrypt.compare(password, person.password)
        if (!isPasswordMatched)
            throw new Error("Invalid credential")



        //create Jwt token
        const token = jwt.sign({ _id: person._id, email: person.email, role: person.role }, process.env.JWT_SECRET_KEY, { expiresIn: '1h' })

        const reply = {
            name: person.name,
            email: person.email,
            _id: person._id,
            role: person.role
        }
        //send along with req.token inside the cookie
        res.cookie("token", token, { maxAge: 60 * 60 * 1000 })
        res.status(201).json({
            user: reply,
        })

    }
    catch (error) {
        res.status(400).send(error.message)
    }
}

const Logout = async (req, res) => {
    try {
        //valide the token ki user logout hona chatah hai

        //Token Add kar dunga Reddis ke blockList me
        const { token } = req.cookies;

        const payload = jwt.decode(token)

        await redisClient.set(`token:${token}`, "Blocked")
        await redisClient.expireAt(`token:${token}`, payload.exp)

        //expire the cokkies ans sent to user
        res.cookie("token", null, { maxAge: new Date(Date.now()) });
        res.send("Logout successfully")
    }
    catch (error) {
        res.status(400).send(error.message)
    }
}

const getProfile = async (req, res) => {
    try {

        const user = req.user;
        res.status(200).json({
            user
        })
    }
    catch (error) {
        res.status(400).send(error.message)
    }
}

const deleteProfile = async (req, res) => {
    try {
        const user = req.user;
        await User.deleteOne({ _id: user._id });
        res.status(200).json({
            message: "Profile deleted successfully"
        })
    }
    catch (error) {
        res.status(400).send(error.message)
    }
}


module.exports = { Register, Login, Logout, getProfile, deleteProfile }

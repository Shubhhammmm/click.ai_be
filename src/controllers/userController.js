const User = require("../models/userSchema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");



const insertuser = async (req, res) => {
    const {password}=req.body
    const salt=bcrypt.genSaltSync(10)
    const securepassword=bcrypt.hashSync(password,salt);
    try {
        await User.create({...req.body,password:securepassword});
        res.status(200).send({ message: "success", data: {...req.body,password:securepassword} });
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
}

const loginuser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const userValid = await User.findOne({ email });
        if (userValid) {
            const isValidPassword = bcrypt.compareSync(password, userValid.password);
            if (isValidPassword) {
                const token = jwt.sign({
                    userId: userValid._id,
                    email: userValid.email
                }, process.env.SECRET_KEY, {
                    expiresIn: 60 * 60 * 24 
                });
                res.status(200).send({ message: "Logged in successfully", token: token, data: userValid });
            } else {
                res.status(404).send({ Status: "Fail", message: "Password is Wrong" }); 
            }
        } else {
            res.status(404).send({ Status: "Fail", message: "Not a valid user" });
        }
    } catch (err) {
        res.status(500).send({ message: err.message });
    }
};

const test = async (req, res) => {
    res.status(200).json({ test: "test completed" })
}


module.exports = { insertuser, loginuser, test };
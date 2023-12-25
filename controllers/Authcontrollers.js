const bcrypt = require("bcrypt");
const UserModel = require("../models/usermodel");
require("dotenv").config();
const Admin = require("../models/AdminModel");
const nodemailer = require("nodemailer");
const jwt = require ("jsonwebtoken")
const SellersModel = require('../models/SellersModel');
const AdminModel = require("../models/AdminModel");





function signup (req, res, next) {
    let data = req.body;

    bcrypt.hash(data.password, 10, (err, hash)=> {
        if(err) {
            res.status(500).json({error: "error hasing password", err})
        } 

        UserModel.create({
            name: data.name,
            password: hash,
            email: data.email
        })
        .then((done)=> {
            res.status(200).json({message: "Registration successful. Your data has been saved. Kindly proceed to login."})
        })
        .catch((err)=> {
            let msg = err;
            if (err.code === 11000) {
                msg = "Email already exist, please change your email address";
            }
    
            res.status(500).json({
                message: 'Registration was not successful',
                err: msg,
            });
        })
    })
    
    

}

 function RegisterAsAdmin  (req, res, next) {
    let data = req.body;
    bcrypt.hash(data.password, 13, (err, hash) =>{
        if(err) {
            res.status(500).json({error: "Error hashing password"})
        }

        const AdminData = {
            name: data.name,
            email: data.email,
            password: hash,
            company: data.company
        }

        const Admin = AdminModel.create(AdminData)
        .then((done) => {
            res.status(200).json({message: "Your account has been registerd successfully as an admin", Admin})
        })
        .catch((err)=> {
            res.status(500).json({message: "An error occured during registration. Please double-check your details again.", err})
        });
    
    })

}

const loginAsAdmin = async (req, res, next) => {
    let email = req.body.email
    let password = req.body.password

    const FindAdmin = await Admin.findOne({email})
        if(!FindAdmin) {
        res.status(401).json({message: "You have not registered as an admin."})
        } else {
        const VerifyPassword = await bcrypt.compare(password, FindAdmin.password) 
        if(VerifyPassword) {
            const token = jwt.sign(
                {id:FindAdmin.id, email:FindAdmin.email},
                process.env.JWT_SECRET,
                {expiresIn: "30mins"}
            )
            res.status(200).json({message: "Authentication Verified. Your token is valid for 30 minutes", token})
        } else {res.status(400).json({message: "Incorrect Password"})}
        }
}

const login =  (req, res, next) => {
    let email = req.body.email
    let password = req.body.password

    UserModel.findOne({email})
    .then(async(done) => {
        if(!done) {
           res.status(400).json({ message: "User not found. Please go to sign in page."})

        } else {
            let Verify = await bcrypt.compare(password, done.password);
            if(Verify) {
                done.password = "";
                res.status(200).json({message: "WELCOME", done})
            } else {res.status(400).json({message: "Your password is incorrect. Please re-enter. Otherwise click on forgot password."})}
        }
    })
    .catch((err) => {
        res.status(500).json({message: "Unknown error occurred.", err})
    })
}

function ChangePassword(req, res, next) {
    let email = req.body.email;
    let NewPassword = req.body.password;
    
    UserModel.updateOne({ email }, { password: NewPassword })
        .then((done) => {
            if (done.nModified === 0) {
                res.status(200).json({
                    message: "Update was successful, but no modification was made. Please enter a different password.",
                });
            } else {
                res.status(200).json({
                    message: "Password changed successfully"
                });
            }
        })
        .catch((err) => {
            res.status(500).json({
                message: "Unknown error occurred", err
            });
        });
}

async function forgotPassword(req, res, next) {
    try {
        let data = req.body
        let UserEmail = data.email;
        let NewPassword = data.password;

        const token = crypto.randomBytes(10).toString("hex");

        verifyemail = await UserModel.findOne({UserEmail})
        if (!verifyemail) {
            return res.status(500).json({
                message: "Email not found, please check your email and try again.",
            });
        }

        let transporter = nodemailer.createTransport({
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
                type: "OAuth2",
                user: process.env.USER,
                accessToken: process.env.PASS,
            },
        });

        const MailOptions = {
            from: "Backend Testing code ",
            to: UserEmail,
            subject: "Password Reset Request",
            text: `You have requested a password reset. Click on the following link to reset your password: http://localhost:2000/change-forgotpassword?token=${token}`,
        };

                      // SEND MAIL
        await transporter.sendMail(MailOptions, (err, info) => {
            if(err) {
                console.log(err)
            } else {
                console.log( info, "email was sent successfully.")
            }
        })
       

        // Update user password
        await UserModel.updateOne({ email: UserEmail }, { password: NewPassword });

        return res.status(200).json({
            message: "Password reset successfully",
            emailResponse,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Unknown error occurred",
            error: error.message,
        });
    }
}

function findbyid(req, res, next) {
    const id = req.params.id;

    UserModel.findById(id)
        .then((user) => {
            if (!user) {
                res.status(404).json({ message: "User not found" });
            } else {
                res.status(200).json({ Message: "Welcome your details are",  user });
            }
        })
        .catch((err) => {
            res.status(500).json({ message: "Unknown error occurred", err });
        });
}

function updateuserinfo(req, res, next) {
    let email = req.body.email;
    let newData = {};

    if (req.body.hasOwnProperty("name")) {
        newData.name = req.body.name;
    }

    if (req.body.hasOwnProperty("password")) {
        newData.password = req.body.password;
    }

    UserModel.updateOne({ email }, newData)
        .then((done) => {
            let message = "Update was successful";
            if (done.hasOwnProperty("modifiedCount") && done.modifiedCount == 0) {
                message = "Update was successful, but no modification was made. Please enter different data from the existing ones";
            }
            res.status(200).json({
                message,
                done,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Unknown error occurred",
            });
        });
};

function deleteuser(req,res,next){
    let  email = req.body;

    UserModel.deleteOne({ email })
        .then((done) => {
            res.status(200).json({
                message: "Deletion was successful",
                done,
            });
        })
        .catch((err) => {
            res.status(500).json({
                message: "Failed to delete user.",
            });
        });
};

const RegisterAsSeller = async (req, res, next) => {
    try {
        let data = req.body
        let email = data.email
        let password = data.password
        let company = data.company
        let location = data.location

        const Hash = await bcrypt.hash(password, 10);

        const sellersData = {
            email,
            password: Hash, 
            company,
            location,
        };

        const addedsellers = await SellersModel.create(sellersData);
        res.status(200).json({ message: "Added successfully as a seller", addedsellers });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error registering as a seller', error });
    }
};





module.exports = {
    signup,
    RegisterAsAdmin, 
    loginAsAdmin, 
    login,
    ChangePassword,
    forgotPassword,
    findbyid,
    updateuserinfo,
    deleteuser,
    RegisterAsSeller
};



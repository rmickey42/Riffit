import express from "express";
const router = express.Router();

import validation from "../validation.js"
import users from "../data/users.js"

router.route('/signup')
    .get(async (req, res) => {
        res.render("signup", {
            Title:"Sign Up"
        })
    })
    .post(async (req,res) => {
        let fields = ["username", "password", "confirmPassword"]
        let unclean_data = req.body
        let clean_data = {} // going to store the trimmed fields in here
        let not_found = []  // if any fields are missing from the request, will put them here

        // first, check that each field has been passed
        fields.forEach((field)=>{
            try {
                clean_data[field] = validation.checkString(unclean_data[field])
            } catch (e) {
                not_found.push(field)
            }
        })

        // next, validate that each field's data is valid
        try {
            if(not_found.length) throw `Must supply additional fields [${not_found.join(", ")}]`;
            validation.checkUserName(clean_data.username)
            validation.checkPassword(clean_data.password)
            if(clean_data.password != clean_data.confirmPassword) throw `Password and Password Confirmation must match`;
        } catch (e) {
            
            return res.status(400).render("signup", {
                Title: "Sign Up",
                error: `Bad Request - ${e}`
            })
        }

        // lastly, attempt to add the user to the database
        try {
            let db_result = await users.addUser(clean_data.username, clean_data.password)
            res.redirect("/login")
        } catch (e){
            console.log(e)
            return res.status(500).render("signup", {
                Title: "Sign Up",
                error: `Internal Server Error - ${e}`
            })
        }
    })


router.route('/login')
    .get(async (req, res) => {
        res.render("login", {
            Title: "Login"
        })
    })
    .post(async (req,res) => {
        let fields = ["username", "password"]
        let unclean_data = req.body
        let clean_data = {} // going to store the trimmed fields in here
        let not_found = []  // if any fields are missing from the request, will put them here

        // first, check that each field has been passed
        fields.forEach((field)=>{
            try {
                clean_data[field] = validation.checkString(unclean_data[field])
            } catch {
                not_found.push(field)
            }
        });
        try {
            if(not_found.length) throw `Must supply additional fields [${not_found.join(", ")}]`;
            validation.checkUserName(clean_data.username)
            validation.checkPassword(clean_data.password)
            let signInAttempt = await users.signInUser(clean_data.username, clean_data.password)

            req.session.user = signInAttempt

            return res.redirect("/user/me")

        } catch (e) {
            return res.status(400).render("login", {
                Title: "Login",
                error: `Bad Request - ${e}`
            })
        }

    })


router.route('/signout')
    .get(async (req, res) => {
        req.session.destroy()
        res.render("signedout",{
            Title: "Signed Out",
            status: "Successfully signed out"
          })
    })

export {router};

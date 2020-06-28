const User = require('../models/model')
const bcrypt = require('bcryptjs')
const mailjet = require ('node-mailjet')
.connect(process.env.MAILJET_API_KEY, process.env.MAILJET_SECRET_KEY)
const nanoid = require('nanoid').nanoid

module.exports = {
    getLoginPg: (req, res) => {
        return res.render('main/login')
    },

    getSignUpPg: (req, res) => {
        return res.render('main/signup')
    },

    signUp: (req, res) => {
        const temp = nanoid()
        const request = mailjet
        .post("send", {'version': 'v3.1'})
        .request({
            "Messages":[
                {
                    "From": {
                        "Email": "michael.passade@codeimmersives.com",
                        "Name": "Email Sign-Up Team"
                    },
                    "To": [
                        {
                            "Email": req.body.email,
                            "Name": req.body.name
                        }
                    ],
                    "Subject": "Welcome to the Email Sign-Up App!",
                    "TextPart": "Sign-up Email",
                    "HTMLPart": `<p>Hi ${req.body.name},</p><p>Please click the below link and use the following temporary password to set a new password and complete your registration.</p><p>Temporary Password: ${temp}</p><a href='http://localhost:3000/api/v1/email-signup/set-password/${req.body.username}'>Complete Registration</a>`,
                    "CustomID": "AppGettingStartedTest"
                }
            ]
        })

        const newUser = new User()
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(temp, salt)

        newUser.name = req.body.name
        newUser.email = req.body.email
        newUser.username = req.body.username
        newUser.address.street = req.body.street
        newUser.address.city = req.body.city
        newUser.address.state = req.body.state
        newUser.address.zipCode = req.body.zipCode
        newUser.tempPassword = true
        newUser.password = hash

        newUser.save().then(user => {
            return res.redirect('/api/v1/email-signup/signedUp')
        }).catch(() => {
            return res.status(400).send('Server Error: Failed to save user to database')
        })
    },

    signedUp: (req, res) => {
        return res.render('main/signedUp')
    },

    registered: (req, res) => {
        return res.render('main/registered')
    },

    getSetPasswordPg: (req, res) => {
        User.findOne({username: req.params.username})
        .then(user => {
            if (user){
                return res.render('main/set-password', {user})
            }
            return res.render('main/page-not-found')
        }).catch(() => {
            return res.status(400).send('Server Error: Failed to search for user in database')
        })
    },

    setPassword: (req, res) => {
        User.findOne({username: req.params.username})
        .then(user => {
            const salt = bcrypt.genSaltSync(10)
            const hash = bcrypt.hashSync(req.body.newPass, salt)
            user.password = hash
            user.tempPassword = false
            user.save().then(() => {
                return res.redirect('/api/v1/email-signup/registered')
            }).catch(() => {
                return res.status(400).send('Server Error: Failed to save user to database')
            })
        }).catch(() => {
            return res.status(400).send('Server Error: Failed to search for user in database')
        })
    },

    logged: (req, res) => {
        if(req.isAuthenticated()){
            return res.render('main/logged')
        }
        res.redirect('/api/v1/email-signup/login')
    },

    logout: (req, res) => {
        req.logout();
        res.redirect('/api/v1/email-signup/login');
    }
}
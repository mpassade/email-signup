const User = require('../models/model')
const bcrypt = require('bcryptjs')
const {check, validationResult} = require('express-validator')

module.exports = {
    checkSignUpFields: (req, res, next) => {
        const {
            name, username, email, street, city, state, zipCode
        } = req.body
        if (!name || !username || !email || !street || !city || !state || !zipCode){
            req.flash('errors', 'All fields are required')
            return res.redirect('/api/v1/email-signup/signup')
        }
        next()
    },

    validateLoginInput: (req, res, next) => {
        const {username, password} = req.body
        if (!username || !password){
            req.flash('errors', 'All fields are required')
            return res.redirect('/api/v1/email-signup/login')
        }
        
        next()
    },

    checkEmail: [
        check('email').isEmail()
    ],

    emailValidation: (req, res, next) => {
        const info = validationResult(req)
        if (!info.isEmpty()){
            req.flash('errors', 'Invalid Email Address')
            return res.redirect('/api/v1/email-signup/signup')
        }
        next()
    },

    checkZipCode: (req, res, next) => {
        if (req.body.zipCode.length !== 5){
            req.flash('errors', 'Invalid Zip Code')
            return res.redirect('/api/v1/email-signup/signup')
        }
        next()
    },

    duplicateAccountCheck: (req, res, next) => {
        const {email, username} = req.body
        User.findOne({email}).then(user => {
            if(user){
                req.flash('errors', 'An account with that email address already exists')
                return res.redirect('/api/v1/email-signup/signup')
            }
            User.findOne({username}).then(user => {
                if(user){
                    req.flash('errors', 'An account with that username already exists')
                    return res.redirect('/api/v1/email-signup/signup')
                }
                next()
            }).catch(() => res.status(400).send('Server Error: Failed to search for user in database'))
        }).catch(() => res.status(400).send('Server Error: Failed to search for user in database'))
    },

    checkPasswordFields: (req, res, next) => {
        const {
            tempPass, newPass, confirmNew
        } = req.body
        if (!tempPass || !newPass || !confirmNew){
            req.flash('errors', 'All fields are required')
            return res.redirect(`/api/v1/email-signup/set-password/${req.params.username}`)
        }
        next()
    },

    checkTemp: (req, res, next) => {
        User.findOne({username: req.params.username})
        .then(user => {
            bcrypt.compare(req.body.tempPass, user.password)
            .then(result => {
                if (result && user.tempPassword===true){
                    return next()
                }
                req.flash('errors', 'Invalid Temporary Password')
                return res.redirect(`/api/v1/email-signup/set-password/${req.params.username}`)
            }).catch(() => res.status(400).send('Server Error: Failed to validate temp password'))
        }).catch(() => res.status(400).send('Server Error: Failed to search for user in database'))
    },

    checkNewPass: (req, res, next) => {
        if (req.body.newPass !== req.body.confirmNew){
            req.flash('errors', "New passwords don't match")
            return res.redirect(`/api/v1/email-signup/set-password/${req.params.username}`)
        }
        if (req.body.newPass.length<3){
            req.flash('errors', 'Password must be at least 3 characters')
            return res.redirect(`/api/v1/email-signup/set-password/${req.params.username}`)
        }
        next()
    }
}
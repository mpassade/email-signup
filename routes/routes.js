const express = require('express')
const router = express.Router()
const passport = require('passport')
const {
    checkSignUpFields, validateLoginInput,
    checkEmail, emailValidation,
    checkZipCode, duplicateAccountCheck,
    checkPasswordFields, checkTemp, checkNewPass
} = require('./middleware/middleware')
const {
    getLoginPg, getSignUpPg, signUp, registered, signedUp,
    getSetPasswordPg, setPassword, logged, logout
} = require('./controllers/controller')

router.get('/login', getLoginPg)
router.post(
    '/login',
    validateLoginInput,
    passport.authenticate('local-login', {
        successRedirect: '/api/v1/email-signup/logged',
        failureRedirect: '/api/v1/email-signup/login',
        failureFlash: true
    }))
router.get('/signup', getSignUpPg)
router.post(
    '/signup',
    checkSignUpFields,
    checkEmail,
    emailValidation,
    checkZipCode,
    duplicateAccountCheck,
    signUp
)
router.get('/signedup', signedUp)
router.get('/registered', registered)
router.get('/set-password/:username', getSetPasswordPg)
router.post(
    '/set-password/:username',
    checkPasswordFields,
    checkTemp,
    checkNewPass,
    setPassword
)
router.get('/logged', logged)
router.get('/logout', logout)


module.exports = router
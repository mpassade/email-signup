const User = require('./models/model')
const bcrypt = require('bcryptjs')

module.exports = {
    getLoginPg: (req, res) => {
        return res.render('main/login')
    },

    getSignUpPg: (req, res) => {
        return res.render('main/signup')
    },

    signup: (req, res) => {
        const newUser = new User()
        const salt = bcrypt.genSaltSync(10)
        const hash = bcrypt.hashSync(req.body.password, salt)

        newUser.name = req.body.name
        newUser.email = req.body.email
        newUser.username = req.body.username
        newUser.password = hash

        if (req.body.adminSecret === process.env.ADMIN_SECRET){
            newUser.admin = true
        }

        newUser.save().then(user => {
            req.login(user, (err) => {
                if (err){
                    return res.status(400).send('Server Error')
                }
                if(user.admin){
                    return res.redirect('/api/v1/vg-app/admin/home')
                }
                return res.redirect('/api/v1/vg-app/user/home')
            })
        }).catch(() => {
            return res.status(400).send('Server Error')
        })
    }
}
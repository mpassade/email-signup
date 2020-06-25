const express = require('express')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const flash = require('connect-flash')
const session = require('express-session')
const passport = require('passport')
const MongoStore = require('connect-mongo')(session)

require('dotenv').config()

const router = require('./routes/routes')

const port = process.env.PORT || 8000

app.set('views', path.join(__dirname, 'views'))
app.set('view engine', 'ejs')

app.use(morgan('dev'))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(express.static(path.join(__dirname, 'public')))

app.use(
    session({
        resave: false,
        saveUninitialized: false,
        secret: process.env.SESSION_SECRET,
        store: new MongoStore({
            url: process.env.MONGODB_URI,
            mongooseConnection: mongoose.connection,
            autoReconnect: true
        }),
        cookie: {
            secure: false,
            maxAge: 1000 * 60 * 60 * 24
        }
    })
)

app.use(flash())
app.use(passport.initialize())
app.use(passport.session())

app.use((req, res, next) => {
    res.locals.user = req.user
    res.locals.errors = req.flash('errors')
    next()
})

app.use('/email-signup', router)

mongoose.connect(process.env.MONGODB_URI, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected')
}).catch(err => {
    console.log(`MongoDB Error: ${err}`)
})

app.listen(port, () => {
    console.log(`Listening on port ${port}`)
})

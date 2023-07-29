import passport from "passport"
import local from 'passport-local'
import GitHubStrategy from 'passport-github2'
import UserModel from '../models/user.model.js'
import CartModel from '../models/cart.model.js'
import { createHash, isValidPassword } from '../utils.js'

const LocalStrategy = local.Strategy

const initializePassport = () => {

    passport.use('register', new LocalStrategy({
        passReqToCallback: true,
        usernameField: 'email'
    }, async(req, username, password, done) => {
        const { first_name, last_name, email, age } = req.body
        try {
            const user = await UserModel.findOne({ email: username })
            if (user) {
                console.log('User already exists')
                return done(null, false)
            }

            const cartForNewUser = await CartModel.create({})
            const newUser = {
                first_name, last_name, email, age, password: createHash(password), cart: cartForNewUser._id,
                role: (email === 'adminCoder@coder.com') ? 'admin' : 'user'
            }
            const result = await UserModel.create(newUser)
            return done(null, result)
        } catch(err) {
            return done('error al obtener el user')
        }
    }))

    passport.use('login', new LocalStrategy({
        usernameField: 'email'
    }, async(username, password, done) => {
        try {
            const user = await UserModel.findOne({ email: username })
            if (!user ) {
                return done(null, false)
            }

            if (!isValidPassword(user, password)) return done(null, false)
            return done(null, user)
        } catch(err) {

        }
    }))

    passport.use('github', new GitHubStrategy({
        clientID: "Iv1.b5a19d276bf01fc2",
        clientSecret: "bab1a07534bcf4542bf7f0ed7837fc1240f2a584",
        callbackURL: "http://localhost:8080/api/sessions/githubcallback"
    }, async(accessToken, refreshToken, profile, done) => {
        try {
            const user = await UserModel.findOne({ email: profile._json.email})
            if (user) {
                return done(null, user)
            }
            const cartForNewUser = await CartModel.create({})
            const newUser = await UserModel.create({
                first_name: profile._json.name,
                last_name: profile._json.name,
                age: 0,
                email: profile._json.email,
                password: " ",
                cart: cartForNewUser._id
            })
            return done(null, newUser)
        } catch(error) {
            return done(`Error to login with github: ${error.message}`)
        }

    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser(async (id, done) => {
        const user = await UserModel.findById(id)
        done(null, user)
    })

}

export default initializePassport
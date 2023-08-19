import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';

import userModel from '../models/user.model.js';
import loggers from './loggers.config.js';
import customError from '../services/errors/log.error.js';

passport.use(
  'signup',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const existingUser = await userModel.findOne({ email: email });
        const existingUserPhone = await userModel.findOne({ phone: req.body.phone });

        if (existingUser) {
          return done(null, false, { message: 'Email already exists.' });
        }
        if (existingUserPhone) {
          return done(null, false, { message: 'Phone already exists.' });
        }

        const hash = bcrypt.hashSync(password, bcrypt.genSaltSync(10));
        const newUser = new userModel({
          first_name: req.body.first_name,
          last_name: req.body.last_name,
          email: email,
          phone: req.body.phone,
          age: req.body.age,
          role: req.body.role,
          password: hash,
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        customError(error);
        loggers.error('Error to signup');
        return done(err);
      }
    }
  )
);

const initializePassport = () => {
  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });

  return passport.initialize();
};

export default initializePassport;
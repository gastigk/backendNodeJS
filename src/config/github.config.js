import passport from 'passport';
import GitHubStrategy from 'passport-github2';
import jwt from 'jsonwebtoken';

import userModel from '../models/user.model.js';
import config from './config.js';
import loggers from './loggers.config.js';
import customError from '../services/errors/log.error.js';

const initializePassportGH = () => {
  passport.use(
    'github',
    new GitHubStrategy(
      {
        clientID: config.github.clientId,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackUri,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          const user = await userModel.findOne({ email: profile._json.email });
          if (user) return done(null, user);

          const newUser = await userModel.create({
            first_name: profile._json.name,
            email: profile._json.email,
            role: 'user',
          });
          const token = jwt.sign(
            { userId: newUser._id },
            config.jwt.privateKey
          );
          res.cookie(config.jwt.cookieName, token, {
            httpOnly: true,
            secure: true,
          });
          return done(null, newUser);
        } catch (error) {
          customError(error);
          loggers.error('Error to login with GitHub');
          return done('Error to login with GitHub');
        }
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id, done) => {
    const user = await userModel.findById(id);
    done(null, user);
  });
};

export default initializePassportGH;
import express from 'express';
import { validPhoneNumber, validateErrors, verifyOtp, verifySignUp } from './RequestValidations';
import { AuthServiceController } from '../controller';
import passport from '../strategies/passport-strategy';
import { isBlocked, tokenBlacklist } from '../middlewares';
import { UserService } from 'lib/services/User';

const router = express.Router();


function getRouter() {
  router.get('/hello', (req, res) => {
    res.send({ message: 'Hello=world' });
  });

  // @ts-ignore
  router.post('/api/auth/otp/generate', [validPhoneNumber(), validateErrors, AuthServiceController.generateOtp]);

  // @ts-ignore
  router.post('/api/auth/otp/verify', [verifyOtp(), validateErrors, AuthServiceController.verifyOtp]);

  router.get('/api/auth/user/logout', [passport.authenticate('jwt-access', { session: false }), isBlocked, tokenBlacklist, AuthServiceController.logoutUser]);

  // TODO signup API POST - access token should be valid, user is not blocked, token in not in blacklist, user is not already signed-up - create a hook in user schema - to update signedUp to true when user signup is completed
  // signup api = /api/auth/user/signup
  router.post('/api/auth/user/signup', [passport.authenticate('jwt-access', { session: false }), isBlocked, tokenBlacklist, verifySignUp(), validateErrors, AuthServiceController.signedUpUser]);

  // TODO currentUser API  = GET API = access token should be valid, user is not blocked, token in not in blacklist , call userService to get user by ID and return user - Important -  Make sure not refresh token is not sent
  // currentUser GET API /api/auth/user
  router.get('/api/auth', [passport.authenticate('jwt-access', { session: false }), isBlocked, tokenBlacklist, AuthServiceController.CurrentUser]);


  return router;
}

export const routes = getRouter();
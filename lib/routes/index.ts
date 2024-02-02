import express from 'express';
import {
  validPhoneNumber,
  validateErrors,
  verifyOtp,
  verifySignUp,
  verifyUpdateUser,
  verifyUpdateLocation
} from './RequestValidations';
import { AuthServiceController } from '../controller';
import passport from '../strategies/passport-strategy';
import { isBlocked, tokenBlacklist } from '../middlewares';

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

  // signup api = /api/auth/user/signup
  router.post('/api/auth/user/signup', [passport.authenticate('jwt-access', { session: false }), isBlocked, tokenBlacklist, verifySignUp(), validateErrors, AuthServiceController.signUpUser]);

  // currentUser GET API /api/auth/user
  router.get('/api/auth/user', [passport.authenticate('jwt-access', { session: false }), isBlocked, tokenBlacklist, AuthServiceController.CurrentUser]);
  // Update user
  router.put('/api/auth/user', [passport.authenticate('jwt-access', { session: false }), isBlocked, tokenBlacklist, verifyUpdateUser(), validateErrors, AuthServiceController.updateUser]);

  router.get('/api/auth/token/refresh', [passport.authenticate('jwt-refresh', { session: false }), isBlocked, AuthServiceController.refreshTokens]);

  router.patch('/api/auth/user/location', [passport.authenticate('jwt-access', { session: false }), isBlocked, tokenBlacklist, verifyUpdateLocation(), validateErrors, AuthServiceController.updateLocation]);
  return router;
}

export const routes = getRouter();
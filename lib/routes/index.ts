import type { Request, Response } from 'express';
import express from 'express';
import { validPhoneNumber, validateErrors, verifyOtp } from './RequestValidations';
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


  return router;
}

export const routes = getRouter();
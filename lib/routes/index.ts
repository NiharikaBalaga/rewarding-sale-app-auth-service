import express from 'express';
import {validPhoneNumber, validateErrors, verifyOtp} from './RequestValidations';
import { AuthServiceController } from '../controller';


const router = express.Router();

function getRouter() {
  router.get('/hello', (req, res) => {
    res.send({ message: 'Hello=world' });
  });

  // @ts-ignore
  router.post('/api/auth/otp/generate', [validPhoneNumber(), validateErrors, AuthServiceController.generateOtp]);

  // @ts-ignore
  router.post('/api/auth/otp/verify', [verifyOtp(), validateErrors, AuthServiceController.verifyOtp]);


  return router;
}

export const routes = getRouter();
import express from 'express';
import { requestOtp, validateErrors } from './RequestValidations';
import { AuthServiceController } from '../controller';


const router = express.Router();

function getRouter() {
  router.get('/hello', (req, res) => {
    res.send({ message: 'Hello=world' });
  });

  // @ts-ignore
  router.post('/api/auth/otp/generate', [requestOtp(), validateErrors, AuthServiceController.generateOtp]);


  return router;
}

export const routes = getRouter();
import type { Request, Response } from 'express';
import { OtpService } from '../services/Otp';

class AuthServiceController {
  public static generateOtp(req: Request, res: Response) {
    const { matchedData: { phoneNumber } } = req.body;
    return OtpService.sendOtp(phoneNumber, res);
  }
}

export  {
  AuthServiceController
};
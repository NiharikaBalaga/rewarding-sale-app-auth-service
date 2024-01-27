import type { Request, Response } from 'express';
import { OtpService } from '../services/Otp';

class AuthServiceController {
  public static generateOtp(req: Request, res: Response) {
    const { matchedData: { phoneNumber } } = req.body;
    return OtpService.sendOtp(phoneNumber, res);
  }  public static verifyOtp(req: Request, res: Response) {
    const { matchedData: { phoneNumber, otp } } = req.body;
    return OtpService.verifyOTP(phoneNumber, otp, res);
  }
}

export  {
  AuthServiceController
};
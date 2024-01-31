import type { Request, Response } from 'express';
import { OtpService } from '../services/Otp';
import { UserService } from '../services/User';


interface RequestValidatedByPassport extends Request {
  user: {
    userId: string;
    accessToken: string;
    phoneNumber: string,
    iat: number,
    exp: number,
    refreshToken: string
  }
}
class AuthServiceController {
  public static generateOtp(req: Request, res: Response) {
    const { matchedData: { phoneNumber } } = req.body;
    return OtpService.sendOtp(phoneNumber, res);
  }

  public static verifyOtp(req: Request, res: Response) {
    const { matchedData: { phoneNumber, otp } } = req.body;
    return OtpService.verifyOTP(phoneNumber, otp, res);
  }

  public static logoutUser(req: RequestValidatedByPassport, res: Response) {
    const { userId, accessToken } = req.user;
    return UserService.logout(userId, accessToken, res);
  }

  public static signedUpUser(req: RequestValidatedByPassport, res: Response) {
    const { userId } = req.user;
    const userInfo = req.body;
    return UserService.checkSignUpUser(userId, userInfo, res);
  }
}

export {
  AuthServiceController
};
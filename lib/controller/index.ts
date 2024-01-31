import type { Request, Response } from 'express';
import { OtpService } from '../services/Otp';
import { UserService } from '../services/User';
import type { IUser } from '../DB/Models/User';
import { httpCodes } from '../constants/http-status-code';


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

interface RequestInterferedByIsBlocked extends RequestValidatedByPassport {
  currentUser: IUser
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

  public static logoutUser(req: RequestInterferedByIsBlocked, res: Response) {
    const { userId, accessToken } = req.user;
    return UserService.logout(userId, accessToken, res);
  }

  public static signedUpUser(req: RequestInterferedByIsBlocked, res: Response) {
    const { signedUp } = req.currentUser;
    if (signedUp) return res.status(httpCodes.conflict).send('User already exists, please log in.');
    const { userId } = req.user;
    const userInfo = req.body;
    return UserService.signUpUser(userId, userInfo, res);
  }

  public static CurrentUser(req: RequestInterferedByIsBlocked, res: Response) {
    const { userId } = req.user;
    return UserService.getCurrentUserById(userId,res);
  }
}

export {
  AuthServiceController
};
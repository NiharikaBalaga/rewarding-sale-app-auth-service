import type { Request, Response } from 'express';
import { OtpService } from '../services/Otp';
import { UserService } from '../services/User';
import type { IUser } from '../DB/Models/User';
import { httpCodes } from '../constants/http-status-code';
import { UserDto } from './dtos/User.dto';
import { Serialize } from './serialise-response';


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
    // we already fetch user details in middleware, and it's available in req.currentUser - check isBlocked Middleware
    return res.send(Serialize(UserDto, req.currentUser));
  }

  public static updateUser(req: RequestInterferedByIsBlocked, res: Response) {
    const { id } = req.currentUser;
    const userInfo = req.body;
    return UserService.updateUser(id, userInfo, res);
  }

}

export {
  AuthServiceController
};
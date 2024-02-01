import type { Request, Response } from 'express';
import { OtpService } from '../services/Otp';
import { UserService } from '../services/User';
import type { IUser } from '../DB/Models/User';
import { httpCodes } from '../constants/http-status-code';
import { UserDto } from './dtos/User.dto';
import { Serialize } from './serialise-response';
import { TokenService } from '../services/Token';


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
    const { signedUp, id } = req.currentUser;
    if (signedUp) return res.status(httpCodes.conflict).send('User already exists, please log in.');
    const { matchedData  } = req.body;
    return UserService.signUpUser(id, matchedData, res);
  }

  public static CurrentUser(req: RequestInterferedByIsBlocked, res: Response) {
    // we already fetch user details in middleware, and it's available in req.currentUser - check isBlocked Middleware
    return res.send(Serialize(UserDto, req.currentUser));
  }

  public static updateUser(req: RequestInterferedByIsBlocked, res: Response) {
    const { id } = req.currentUser;
    const { matchedData  } = req.body;
    return UserService.updateUser(id, matchedData, res);
  }

  public static refreshTokens(req: RequestInterferedByIsBlocked, res: Response){
    const { refreshToken } = req.user;
    return TokenService.refreshTokens(req.currentUser, refreshToken, res);
  }
  public static updateLocation(req: RequestInterferedByIsBlocked, res: Response){
    const { id } = req.currentUser;
    const { matchedData  } = req.body;

    // No need to wait till location gets updated, this happens in async
    UserService.updateUserLocation(id, matchedData);

    return res.send('Success');
  }


}

export {
  AuthServiceController
};
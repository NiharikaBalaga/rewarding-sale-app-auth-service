import type { IUser } from '../DB/Models/User';
import UserModel from '../DB/Models/User';
import UserTokenBlacklistModel from '../DB/Models/User-Token-Blacklist';
import type { Response } from 'express';
import { httpCodes } from '../constants/http-status-code';

class UserService {
  public static async getUserByPhone(phoneNumber: string){
    const user = await UserModel.findOne({
      phoneNumber,
    });
    return user;
  }
  public static createUserByPhone(phoneNumber: string){
    const newUser = new UserModel({
      phoneNumber,
    });
    return newUser.save();
  }

  public static findById(id: string) {
    return UserModel.findById(id);
  }

  public static update(id: string, updateUserObject: Partial<IUser>) {
    return UserModel.findByIdAndUpdate(id, updateUserObject, { new: true }).exec();
  }

  public static async tokenInBlackList(accessToken: string) {
    return UserTokenBlacklistModel.findOne({
      token: accessToken
    });
  }

  public static async logout(userId: string, accessToken: string, res: Response) {
    try {
      // make refresh token null in user collection
      await this.update(userId, { refreshToken: null });

      // add current access token into blacklist collection, so we won't allow this token anymore - check tokenBlacklist middleware
      const blackListToken = new UserTokenBlacklistModel({
        token: accessToken
      });

      await blackListToken.save();

      return res.send('Logout Success');
    } catch (logoutError){
      console.error('logout-UserService', logoutError);
      return  res.sendStatus(httpCodes.serverError);
    }
  }

}

export {
  UserService
};
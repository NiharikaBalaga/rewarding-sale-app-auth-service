import type { IUser } from '../DB/Models/User';
import UserModel from '../DB/Models/User';
import UserTokenBlacklistModel from '../DB/Models/User-Token-Blacklist';
import type { Response } from 'express';
import { httpCodes } from '../constants/http-status-code';
import mongoose, { Schema } from 'mongoose';

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

  public static async signUpUser(userId: string, userObject: Partial<IUser>, res: Response) {
    try {
      // Updates user data and set signedUp to true
      await this.update(userId, {
        firstName: userObject.firstName,
        lastName: userObject.lastName,
        email: userObject.email,
        signedUp: true
      });

      return res.send('Sign Up Success');
    } catch (logoutError){
      console.error('signUp-UserService', logoutError);
      return  res.sendStatus(httpCodes.serverError);
    }
  }

  static async getCurrentUserById(userId: string, res: Response) {
    try {
      // Find user by ID
      const user = await UserModel.findById(userId);

      // Check if the user exists
      if (!user) {
        return res.status(httpCodes.notFound).json({ message: 'User not found' });
      }

      // Return user information without sensitive data
      const userWithoutSensitiveData = this.filterSensitiveUserData(user);
      return res.json({ user: userWithoutSensitiveData });
    } catch (error) {
      console.error('getCurrentUserById - UserService', error);
      return res.status(httpCodes.serverError).json({ message: 'Internal Server Error' });
    }
  }

  static filterSensitiveUserData(user: mongoose.Document<unknown, {}, IUser> & IUser & { _id: mongoose.Types.ObjectId; }) {
    if (!user) {
      return null;
    }
  
    const { refreshToken, ...userWithoutSensitiveData } = user.toObject();
    return userWithoutSensitiveData;
  }
}

export {
  UserService
};
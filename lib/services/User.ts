import type { IUser, Location } from '../DB/Models/User';
import UserModel, { GeoJSONType } from '../DB/Models/User';
import UserTokenBlacklistModel from '../DB/Models/User-Token-Blacklist';
import type { Response } from 'express';
import { httpCodes } from '../constants/http-status-code';
import { Serialize } from '../controller/serialise-response';
import { UserDto } from '../controller/dtos/User.dto';
import { Aws } from './Aws';

class UserService {
  public static async getUserByPhone(phoneNumber: string){
    const user = await UserModel.findOne({
      phoneNumber,
    });
    return user;
  }
  public static async createUserByPhone(phoneNumber: string){
    const newUser = new UserModel({
      phoneNumber,
    });
    await newUser.save();

    // new user is created by phoneNumber


    // no need of await since we don't need to wait for events to publish
    // SNS Event
    Aws.userCreatedByPhoneEvent(newUser);
    return newUser;
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

      // SNS event
      Aws.tokenBlackListEvent(accessToken);

      return res.send('Logout Success');
    } catch (logoutError){
      console.error('logout-UserService', logoutError);
      return  res.sendStatus(httpCodes.serverError);
    }
  }

  public static async signUpUser(userId: string, userObject: Partial<IUser>, res: Response) {
    try {
      // Updates user data and set signedUp to true
      const updatedUser = await this.update(userId, {
        firstName: userObject.firstName,
        lastName: userObject.lastName,
        email: userObject.email,
        signedUp: true
      });

      // SNS event
      if (updatedUser)
        Aws.userUpdatedEvent(updatedUser);

      // send updated serialised user in response
      return res.send(Serialize(UserDto, updatedUser));
    } catch (logoutError){
      console.error('signUp-UserService', logoutError);
      return  res.sendStatus(httpCodes.serverError);
    }
  }

  public static async updateUser(userId: string, userObject: Partial<IUser>, res: Response) {
    try {
      // Updates user data
      const updatedUser = await this.update(userId, {
        ...userObject
      });

      // SNS event
      if (updatedUser)
        Aws.userUpdatedEvent(updatedUser);

      // send updated serialised user in response
      return res.send(Serialize(UserDto, updatedUser));
    } catch (logoutError){
      console.error('updateUser-UserService', logoutError);
      return  res.sendStatus(httpCodes.serverError);
    }
  }

  static async updateUserLocation(userid: string, location: any){
    const lastLocationDto: Location = {
      type: GeoJSONType.Point,
      coordinates: [location.longitude, location.latitude]
    };
    const updatedUser = await this.update(userid, {
      lastLocation: lastLocationDto
    });

    // SNS event
    if (updatedUser)
      Aws.userUpdatedEvent(updatedUser);
    return updatedUser;
  }

  public static async updateUserAdminSNS(user: Partial<IUser>, userId: string) {
    try {
      // Updates user data
      const updatedUser = await this.update(userId, {
        ...user
      });

      // SNS event
      if (updatedUser)
        Aws.userUpdatedEvent(updatedUser);

      // send updated serialised user in response
      return updatedUser;
    } catch (logoutError){
      console.error('updateUser-UserService', logoutError);
      throw logoutError;
    }
  }

}

export {
  UserService
};
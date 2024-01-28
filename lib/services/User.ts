import type { IUser } from '../DB/Models/User';
import UserModel from '../DB/Models/User';

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

  public static update(id: string, updateUserObject: Partial<IUser>) {
    return UserModel.findByIdAndUpdate(id, updateUserObject, { new: true }).exec();
  }

}

export {
  UserService
};
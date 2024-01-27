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

}

export {
  UserService
};
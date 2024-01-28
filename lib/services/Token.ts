import type { Secret } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { UserService } from './User';


class TokenService {

  public static async getTokens(userId: string, phoneNumber: string) {
    const jwtAccessSecretKey: Secret = process.env.JWT_ACCESS_TOKEN || '';
    const jwtRefreshSecretKey: Secret = process.env.JWT_REFRESH_TOKEN || '';
    const [accessToken, refreshToken] = await Promise.all([jwt.sign({
      sub: userId, phoneNumber
    }, jwtAccessSecretKey, {
      expiresIn: '30d',
    }), jwt.sign({
      sub: userId, phoneNumber
    }, jwtRefreshSecretKey, {
      expiresIn: '150d',
    })]);
    return {
      accessToken,
      refreshToken
    };
  }

  private static _hashData(data: string){
    return argon2.hash(data);
  }
  public static async updateRefreshToken(userid: string, refreshToken: string){
    const hashedToken = await this._hashData(refreshToken);
    return UserService.update(userid, { refreshToken: hashedToken });
  }

}


export {
  TokenService
};
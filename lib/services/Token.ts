import type { Secret } from 'jsonwebtoken';
import jwt from 'jsonwebtoken';
import * as argon2 from 'argon2';
import { UserService } from './User';
import type { Response } from 'express';
import { httpCodes } from '../constants/http-status-code';


class TokenService {

  public static async getTokens(userId: string, phoneNumber: string) {
    const jwtAccessSecretKey: Secret = process.env.JWT_ACCESS_SECRET || '';
    const jwtRefreshSecretKey: Secret = process.env.JWT_REFRESH_SECRET || '';
    const [accessToken, refreshToken] = await Promise.all([jwt.sign({
      userId, phoneNumber
    }, jwtAccessSecretKey, {
      expiresIn: '30d',
    }), jwt.sign({
      userId, phoneNumber
    }, jwtRefreshSecretKey, {
      expiresIn: '150d',
    })]);
    return {
      accessToken,
      refreshToken
    };
  }

  private static async _hashData(data: string){
    return argon2.hash(data);
  }
  public static async updateRefreshToken(userid: string, refreshToken: string){
    const hashedToken = await this._hashData(refreshToken);
    return UserService.update(userid, { refreshToken: hashedToken });
  }

  static async refreshTokens(user: any, requestUserToken: string, res: Response){
    try {
      const refreshTokenMatches = await argon2.verify(
        user.refreshToken,
        requestUserToken
      );

      if (!refreshTokenMatches)
        return res.status(httpCodes.forbidden).send('Access Denied');

      const tokens = await this.getTokens(user.id, user.phoneNumber);
      await this.updateRefreshToken(user.id, tokens.refreshToken);
      return res.send(tokens);
    } catch (error) {
      console.error('refreshTokens-error', error);
      return res.status(httpCodes.serverError).send();
    }
  }

}


export {
  TokenService
};
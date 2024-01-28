
import { randomBytes } from 'crypto';
import { Aws } from './Aws';
import type { Response } from 'express';
import { httpCodes } from '../constants/http-status-code';
import OtpModel from '../DB/Models/Otp';
import { UserService } from './User';
import { TokenService } from './Token';

class OtpService {
  private static async _OTPExists(phoneNumber: string) {
    const otpObject = await OtpModel.findOne({
      phoneNumber
    });
    return {
      optExists: otpObject ?  true : false,
      otpObject,
    };
  }

  private static _generateOTP(length: number = 6): string {
    const characters = '0123456789';
    const charactersLength = characters.length;

    let otp = '';
    const randomBytesBuffer = randomBytes(length);

    for (let i = 0; i < length; i++) {
      const randomIndex = randomBytesBuffer.readUInt8(i) % charactersLength;
      otp += characters.charAt(randomIndex);
    }

    return otp;
  }

  private static _deleteOTP(phoneNumber: string) {
    return OtpModel.deleteOne({ phoneNumber });
  }
  public static async sendOtp(phoneNumber: string, res: Response) {
    try {
      // Check if OTP exists
      const { optExists } = await this._OTPExists(phoneNumber);

      // OTP is not expired
      if (optExists)
        return res.status(httpCodes.unprocessable_entity).send('Otp Already Generated'); // TODO format error message

      const sixDigitOTP = this._generateOTP(6);

      const otpDocument  = new OtpModel({
        phoneNumber,
        otp: sixDigitOTP
      });
      await Promise.all([otpDocument.save(), Aws.sendOtpToPhone(phoneNumber, sixDigitOTP)]);
      return res.status(httpCodes.ok).send({ success: true, message: 'OTP sent successfully' });
    } catch (sendOtpError){

      // if anything goes  wrong delete the OTP if it was saved in database
      await this._deleteOTP(phoneNumber);
      console.log('sendOtpError', sendOtpError);
      return res.status(httpCodes.serverError).send('Otp Not sent');
    }
  }

  public static async verifyOTP(phoneNumber: string, userOtp: string, res: Response) {
    try {
      // Check if OTP exists
      const { optExists, otpObject } = await this._OTPExists(phoneNumber);

      if (!optExists)
        return res.status(httpCodes.unprocessable_entity).send('Otp not generated'); // TODO format error message

      // Check Otp matching
      if (otpObject?.otp !== userOtp)
        return res.status(httpCodes.badRequest).send('Verification Failed/ Wrong OTP');

      // OTP Matches

      // Delete OTP
      await this._deleteOTP(phoneNumber);

      // check user existence in User collection
      // find user is signedUp or not and send the isSignedUp in response
      let user = await UserService.getUserByPhone(phoneNumber);
      let isSignedUp = false;
      if (user && user.signedUp)
        isSignedUp = true;
      else if (!user)
        user = await UserService.createUserByPhone(phoneNumber);


      //  Generate Auth tokens also refresh token
      const { accessToken, refreshToken } = await TokenService.getTokens(user._id, user.phoneNumber);

      // update refresh token into user document
      await TokenService.updateRefreshToken(user._id, refreshToken);

      return res.status(httpCodes.ok).send({
        message: 'OTP Verified successfully',
        isSignedUp: isSignedUp,
        accessToken,
        refreshToken,
      });

    } catch (verifyOTPError) {
      console.error('verifyOTPError', verifyOTPError);
      return res.status(httpCodes.serverError).send('Verification Failed/ Wrong OTP, please try later');
    }
  }

}

export {
  OtpService
};
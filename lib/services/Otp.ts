import OtpModel from '../DB/Model';
import { randomBytes } from 'crypto';
import { Aws } from './Aws';
import type { Response } from 'express';
import { httpCodes } from '../constants/http-status-code';

class OtpService {
  private static async _OTPExists(phoneNumber: string) {
    const optExists = await OtpModel.findOne({
      phoneNumber
    });
    if (optExists) return true;
    return false;
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
  public static async sendOtp(phoneNumber: string, res: Response) {
    try {
      // Check if OTP exists
      const optExists = await this._OTPExists(phoneNumber);

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
      console.log('sendOtpError', sendOtpError);
      return res.send(httpCodes.serverError);
    }
  }
}

export {
  OtpService
};
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import type { IUser } from '../DB/Models/User';
import { Events } from './events.enum';
import type { Twilio } from 'twilio';
import twilio from 'twilio';

class Aws {
  private static readonly SNS: SNSClient = new SNSClient({
    apiVersion: 'version',
    region: process.env.aws_region,
    credentials: {
      accessKeyId: process.env.aws_sns_access_key_id || '',
      secretAccessKey: process.env.aws_sns_secret_access_key || '',
    },
  });

  private static readonly twilio: Twilio = twilio(
    process.env.TWILIO_SID,
    process.env.TWILIO_SECRET,
    {
      autoRetry: true,
      maxRetries: 3,
      region: 'US1',
      edge: 'ashburn',
      accountSid: process.env.TWILIO_ACCOUNT_SID,
    },
  );

  public static async sendOtpToPhone(phoneNumber: string, OTP: string) {
    const MESSAGE = `Your verification code is ${OTP}, expires in 5 Minutes - Sale Spotter App`;
    // const smsParams = {
    //   Message: MESSAGE,
    //   PhoneNumber: `+1${phoneNumber}`,
    //   MessageAttributes: {
    //     'AWS.SNS.SMS.SenderID': {
    //       DataType: 'String',
    //       StringValue: 'SaleSpotter',
    //     },
    //     'AWS.SNS.SMS.SMSType': {
    //       DataType: 'String',
    //       StringValue: 'Transactional',
    //     },
    //   },
    // };
    try {

      const response = await this.twilio.messages.create({
        body: MESSAGE,
        from: process.env.TWILIO_NUMBER,
        to: `+1${phoneNumber}`
      });
      console.log(
        'Otp Sent Successfully Message ID - ',
        response.sid,
        response.status,
      );
      // const { MessageId } =  await this.SNS.send(new PublishCommand(smsParams));
      // console.log('Otp Sent Successfully Message-ID', MessageId);
    } catch (sendOtpToPhoneError) {
      console.error('sendOtpToPhoneError', sendOtpToPhoneError);
      throw new Error('sendOtpToPhoneError');
    }
  }

  private static async _publishToAuthTopicARN(Message: string) {
    try {
      const messageParams = {
        Message,
        TopicArn: process.env.AUTH_TOPIC_SNS_ARN,
      };

      const { MessageId } = await this.SNS.send(
        new PublishCommand(messageParams),
      );
      console.log('publishToAuthTopicSNS-success', MessageId);
    } catch (_publishToAuthTopicARNError) {
      console.error(
        'publishToAuthTopicSNSError',
        _publishToAuthTopicARNError,
      );
    }
  }

  static async userCreatedByPhoneEvent(
    user: IUser
  ) {
    const EVENT_TYPE = Events.userCreatedByPhone;
    const snsMessage = Object.assign({ user }, { EVENT_TYPE, userId: user.id });
    return this._publishToAuthTopicARN(JSON.stringify(snsMessage));
  }

  static async userUpdatedEvent(updatedUser: IUser) {
    const EVENT_TYPE = Events.userUpdate;
    const snsMessage = Object.assign({ updatedUser }, { EVENT_TYPE, userId: updatedUser.id });
    return this._publishToAuthTopicARN(JSON.stringify(snsMessage));
  }

  static async tokenBlackListEvent(token: string) {
    const EVENT_TYPE = Events.tokenBlackList;
    return this._publishToAuthTopicARN(JSON.stringify({ token, EVENT_TYPE }));
  }
}

export {
  Aws
};
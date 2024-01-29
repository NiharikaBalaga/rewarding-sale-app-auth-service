import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
class Aws{
  private static readonly SNS: SNSClient = new SNSClient({
    apiVersion: 'version',
    region: 'ca-central-1',
    credentials: {
      accessKeyId: process.env.aws_sns_access_key_id || '',
      secretAccessKey: process.env.aws_sns_secret_access_key || '',
    },
  });
  public static async sendOtpToPhone(phoneNumber: string, OTP: string){
    const MESSAGE = `Your verification code is ${OTP}, expires in 5 Minutes - Sale Spotter App`;
    const smsParams = {
      Message: MESSAGE,
      PhoneNumber: `+1${phoneNumber}`,
      MessageAttributes: {
        'AWS.SNS.SMS.SenderID': {
          DataType: 'String',
          StringValue: 'SaleSpotter',
        },
        'AWS.SNS.SMS.SMSType': {
          DataType: 'String',
          StringValue: 'Transactional',
        },
      },
    };
    try {
      const { MessageId } =  await this.SNS.send(new PublishCommand(smsParams));
      console.log('Otp Sent Successfully Message-ID', MessageId);
    } catch (sendOtpToPhoneError) {
      console.error('sendOtpToPhoneError', sendOtpToPhoneError);
      throw new Error('sendOtpToPhoneError');
    }
  }
}

export {
  Aws
};
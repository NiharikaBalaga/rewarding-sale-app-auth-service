import { Events } from './events.enum';
import { UserService } from './User';
import type { IUser } from '../DB/Models/User';


class SQSProcessorService {
  static async ProcessSqsMessage(messages: any[]) {

    try {
      await Promise.all(
        messages.map(({ Body }) => {
          try {
            const parsedBody = JSON.parse(Body);
            if (parsedBody.Message) {
              // Message sent by SNS
              const parsedMessage = JSON.parse(parsedBody.Message);
              if (parsedMessage['EVENT_TYPE'])
                return this._handleMessageEventsSentBySNS(parsedMessage);

            } else {
              // Message sent by Queue itself
            }
          } catch (error) {
            console.error('Error processing SQS message:', error);
            throw error;
          }
        }),
      );
    } catch (error) {
      console.error('Error processing SQS messages:', error);
      throw error;
    }
  }


  private static async _handleMessageEventsSentBySNS(parsedMessage: any) {
    const {
      EVENT_TYPE, user, userId
    } = parsedMessage;
    console.log(EVENT_TYPE, user, userId);
    switch (EVENT_TYPE) {
      case Events.userUpdated:
        return this._handleUserUpdate(user, userId);
      case Events.tokenBlackList:
      default:
        console.warn(`Unhandled event type: ${EVENT_TYPE}`);
        break;
    }
  }

  private static async _handleUserUpdate(user: IUser, userId: string) {
    try {
      await UserService.updateUserAdminSNS(user, userId);
    } catch (error) {
      console.error('_handleUserCreationByPhone-error', error);
      throw error;
    }
  }
}

export {
  SQSProcessorService
};
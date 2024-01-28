import mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

export interface IUser extends Document {
  phoneNumber: string,
  email: string,
  firstName: string,
  lastName: string,
  signedUp: boolean,
  isBlocked: boolean,
  refreshToken: string,
}

const UserSchema: mongoose.Schema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    match: /^\d{3}-\d{3}-\d{4}$/,
    unique: true,
    index: true,
  },

  email: {
    type: String,
    unique: true,
  },
  firstName: {
    type: String,
  },
  lastName: {
    type: String,
  },

  signedUp: {
    type: Boolean,
    default: false
  },

  isBlocked: {
    type: Boolean,
    default: false
  },

  refreshToken: {
    type: String
  }
}, {
  collection: 'Users'
});

const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
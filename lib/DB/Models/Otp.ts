import mongoose from 'mongoose';
import type { Document, Model } from 'mongoose';

interface IOtp extends Document {
  phoneNumber: string,
  otp: string,
  createdAt: Date
}

const OTPSchema: mongoose.Schema = new mongoose.Schema({
  phoneNumber: {
    type: String,
    required: true,
    match: /^\d{3}-\d{3}-\d{4}$/,
    unique: true,
    index: true,
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 30, // TODO update into required expiry time
  }
}, {
  collection: 'Otp',
  timestamps: true,
  id: true,
});

const OtpModel: Model<IOtp> = mongoose.model<IOtp>('Otp', OTPSchema);

export default OtpModel;
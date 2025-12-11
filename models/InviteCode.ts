import mongoose, { Schema, model, models } from 'mongoose';

const InviteCodeSchema = new Schema({
  code: {
    type: String,
    required: true,
    unique: true,
  },
  isUsed: {
    type: Boolean,
    default: false,
  },
  usedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const InviteCode = models.InviteCode || model('InviteCode', InviteCodeSchema);

export default InviteCode;

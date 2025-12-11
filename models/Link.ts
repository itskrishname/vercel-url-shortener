import mongoose, { Schema, model, models } from 'mongoose';

const LinkSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  originalUrl: {
    type: String,
    required: true,
  },
  // The token for our intermediate redirect (e.g., /go/xyz)
  localToken: {
    type: String,
    required: true,
    unique: true,
  },
  // The final short URL provided by the external service
  externalShortUrl: {
    type: String,
    required: true,
  },
  visits: {
    type: Number,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Link = models.Link || model('Link', LinkSchema);

export default Link;

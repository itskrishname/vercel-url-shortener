import mongoose, { Schema, model, models } from 'mongoose';

const LinkSchema = new Schema({
  originalUrl: {
    type: String,
    required: true,
  },
  externalShortUrl: {
    type: String,
    required: true,
  },
  token: {
    type: String,
    required: true,
    unique: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Link = models.Link || model('Link', LinkSchema);

export default Link;

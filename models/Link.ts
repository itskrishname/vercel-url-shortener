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
  // We use localToken for our app logic
  localToken: {
    type: String,
    required: true,
    unique: true,
  },
  // We also explicitly define 'token' because the existing DB has a unique index on 'token'.
  // If we don't define it and populate it, it might default to null, causing collision.
  token: {
    type: String,
    required: false, // Not strictly required by logic, but required by DB index to be unique
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
}, { strict: false }); // Allow other fields just in case

const Link = models.Link || model('Link', LinkSchema);

export default Link;

import mongoose, { Schema, model, models } from 'mongoose';

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  // This is the API key the user uses to authenticate with OUR app
  app_api_key: {
    type: String,
    unique: true,
    required: true,
  },
  // Settings for the user's external shortener (e.g., GPLinks)
  external_api_token: {
    type: String,
    default: '',
  },
  external_domain: {
    type: String,
    default: '', // e.g., 'gplinks.com'
  },
  // Suspension Logic
  isSuspended: {
    type: Boolean,
    default: false,
  },
  suspendedAt: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const User = models.User || model('User', UserSchema);

export default User;

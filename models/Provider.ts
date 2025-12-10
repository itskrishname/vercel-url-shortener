import mongoose from 'mongoose';

const ProviderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name for this provider'],
    unique: true,
  },
  apiUrl: {
    type: String,
    required: [true, 'Please provide the API URL'],
  },
  apiToken: {
    type: String,
    required: [true, 'Please provide the API Token'],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.models.Provider || mongoose.model('Provider', ProviderSchema);

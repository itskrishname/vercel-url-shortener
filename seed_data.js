const mongoose = require('mongoose');

const MONGODB_URI = "mongodb+srv://musicbhaikon9910:krishna@cluster0.cwvegmt.mongodb.net/";

const LinkSchema = new mongoose.Schema({
  originalUrl: { type: String, required: true },
  externalShortUrl: { type: String, required: true },
  token: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

const Link = mongoose.models.Link || mongoose.model('Link', LinkSchema);

async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB");

    const existing = await Link.findOne({ token: 'verify-ui' });
    if (existing) {
        console.log("Token already exists");
        process.exit(0);
    }

    await Link.create({
      originalUrl: 'https://google.com',
      externalShortUrl: 'https://example.com/dest',
      token: 'verify-ui'
    });
    console.log("Link created");
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

seed();

import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoMemoryServer = null;

export const connectDB = async () => {
  let mongoUri = process.env.MONGODB_URI;

  // 1. If explicit MONGODB_URI is provided, connect directly
  if (mongoUri && mongoUri.trim() !== '') {
    try {
      const conn = await mongoose.connect(mongoUri, { autoIndex: true });
      console.log(`🌱 MongoDB Connected: ${conn.connection.host}`);
      return conn;
    } catch (err) {
      console.error(`❌ MONGODB_URI connection error: ${err.message}`);
    }
  }

  // 2. Try standard local MongoDB daemon first (fastest)
  const localUri = 'mongodb://127.0.0.1:27017/edupulse';
  try {
    const conn = await mongoose.connect(localUri, {
      serverSelectionTimeoutMS: 3000,
      autoIndex: true,
    });
    console.log(`🌱 Connected to local MongoDB daemon at ${localUri}`);
    return conn;
  } catch (localErr) {
    console.log('⚡ Local MongoDB daemon not running. Launching in-memory MongoDB database...');
  }

  // 3. Fallback to in-memory MongoDB server
  try {
    mongoMemoryServer = await MongoMemoryServer.create();
    mongoUri = mongoMemoryServer.getUri();
    const conn = await mongoose.connect(mongoUri, { autoIndex: true });
    console.log(`✅ In-memory MongoDB running at ${mongoUri}`);
    return conn;
  } catch (memErr) {
    console.error(`❌ In-memory MongoDB Error: ${memErr.message}`);
    process.exit(1);
  }
};

export const closeDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServer) {
    await mongoMemoryServer.stop();
  }
};

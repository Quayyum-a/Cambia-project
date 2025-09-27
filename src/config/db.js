const mongoose = require('mongoose');
const { mongodbUri, testDbUri, useSupabase } = require('./env');

let memory;

const connectDB = async () => {
  if (useSupabase) {
    console.log('USE_SUPABASE=true: skipping MongoDB connection');
    return;
  }
  const tryUri = process.env.NODE_ENV === 'test' ? testDbUri : mongodbUri;
  if (tryUri) {
    try {
      await mongoose.connect(tryUri, { useNewUrlParser: true, useUnifiedTopology: true });
      console.log('MongoDB connected');
      return;
    } catch (e) {
      console.warn('Mongo connect failed, falling back to in-memory:', e.message);
    }
  }
  try {
    const { MongoMemoryServer } = require('mongodb-memory-server');
    memory = await MongoMemoryServer.create();
    const uri = memory.getUri();
    await mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true });
    console.log('MongoMemoryServer started');
  } catch (e) {
    console.error('Failed to start in-memory Mongo:', e.message);
    process.exit(1);
  }
};

module.exports = connectDB;

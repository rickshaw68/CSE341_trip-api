const { MongoClient } = require('mongodb');

let db; // cached database connection

async function connectToDb() {
  const uri = process.env.MONGODB_URI;
  const dbName = process.env.DB_NAME || 'tripPlanner';

  if (!uri) {
    throw new Error('Missing MONGODB_URI in environment variables');
  }

  if (db) {
    // Reuse existing connection
    return db;
  }

  const client = await MongoClient.connect(uri);
  db = client.db(dbName);
  console.log(`Connected to database: ${dbName}`);
  return db;
}

function getDb() {
  if (!db) {
    throw new Error('Database has not been initialized. Call connectToDb() first.');
  }
  return db;
}

module.exports = {
  connectToDb,
  getDb
};

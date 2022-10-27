/* jshint esversion: 9 */

const { MongoClient, ServerApiVersion } = require("mongodb");

// The database to use
let database = "test";

async function startDatabase() {
  const uri = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@${process.env.MONGODB_URI}/?retryWrites=true&w=majority`;

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverApi: ServerApiVersion.v1,
  });

  // The database to use
  const dbName = "test";
  await client.connect();
  console.log("Connected correctly to server");
  database = client.db(dbName);
}

async function getDatabase() {
  if (!database) await startDatabase();
  return database;
}

module.exports = {
  getDatabase,
  startDatabase,
};

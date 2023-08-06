import mongoose from 'mongoose';
import config from '../../config/config.js';
import loggers from '../../config/loggers.config.js';

const mongoConnection = config.db.mongo_connection;
const mongoDatabase = config.db.mongo_database;

// connected to the ODM (Object Document Mapping): mongoose
export default class MongoClient {
  constructor() {
    this.connected = true;
    this.client = mongoose;
  }

  connect = async () => {
    try {
      await this.client.connect(mongoConnection);
      loggers.info(
        `Successful connection to the DB "${mongoDatabase}" at MongoDB Atlas`
      );
    } catch (err) {
      loggers.error('Cannot connect to DB');
    }
  };
}

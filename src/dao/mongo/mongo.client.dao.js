import mongoose from 'mongoose';
import config from '../../config/config.js';
import loggers from '../../config/logger.config.js';

const mongoConnection = config.db.mongo_connection;
const mongoDatabase = config.db.mongo_database;

export default class MongoClient {
  constructor() {
    this.connected = true;
    this.client = mongoose;
  }

  connect = async () => {
    try {
      await this.client.connect(mongoConnection);
      loggers.info(
        `Successful connection to the database "${mongoDatabase}" at MongoDB Atlas`
      );
    } catch (err) {
      loggers.error('Cannot connect to database');
    }
  };
}

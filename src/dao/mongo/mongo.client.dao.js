import mongoose from 'mongoose';

import config from '../../config/config.js';
import loggers from '../../config/loggers.config.js';

// connected to the ODM (Object Document Mapping): mongoose
export default class MongoClient {
  constructor() {
    this.connected = true;
    this.client = mongoose;
  }

  connect = async () => {
    try {
      await this.client.connect(config.mongo.uri);
      loggers.info(
        `Successful connection to the DB "${config.mongo.dbname}" at Mongo Atlas`
      );
    } catch (err) {
      loggers.error('Cannot connect to DB');
    }
  };
}

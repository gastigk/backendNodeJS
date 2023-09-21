import mongoose from 'mongoose';

import config from '../../config/config.js';
import loggers from '../../config/loggers.config.js';
import customError from '../../services/errors/log.error.js';

// connected to the ODM (Object Document Mapping): mongoose
export default class MongoClient {
  constructor() {
    this.connected = true;
    this.client = mongoose;
  }

  connect = async () => {
    try {
      await this.client.connect(config.mongo.uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      loggers.info(
        `Successful connection to "${config.mongo.dbname}" DB`
      );
    } catch (error) {
      customError(error);
      loggers.fatal('Cannot connect to DB');
    }
  };
}
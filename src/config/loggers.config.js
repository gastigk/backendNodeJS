import winston from 'winston';

import config from './config.js';

const customWinstonOptions = {
  levels: {
    debug: 0,
    http: 1,
    info: 2,
    notice: 3,
    warning: 4,
    error: 5,
    alert: 6,
  },
  colors: {
    debug: 'white',
    http: 'grey',
    notice: 'blue',
    info: 'cyan',
    warning: 'yellowBG',
    error: 'red',
    alert: 'redBG',
  },
};

winston.addColors(customWinstonOptions.colors);

const prod = config.app.environment === 'PROD';

const createLogger = () => {
  if (prod) {
    return winston.createLogger({
      levels: customWinstonOptions.levels,
      level: 'alert',
      transports: [
        new winston.transports.File({
          filename: './errors.log',
          format: winston.format.simple(),
        }),
      ],
    });
  } else {
    return winston.createLogger({
      levels: customWinstonOptions.levels,
      level: 'alert',
      transports: [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple()
          ),
        }),
      ],
    });
  }
};

const loggers = createLogger(config.app.environment);

export default loggers;

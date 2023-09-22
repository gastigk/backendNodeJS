import loggers from '../src/config/loggers.js';
import chai from 'chai';
import winston from 'winston';

const expect = chai.expect;

const errorLevels = [
  'debug',
  'http',
  'info',
  'notice',
  'warning',
  'error',
  'alert',
];

describe('Logger test', () => {
  it('Must return a logger for each error levelmethod', () => {
    const logger = loggers;
    expect(logger).to.be.an.instanceOf(winston.Logger);
  });

  it('Must return a logger with the indicated error level', () => {
    errorLevels.forEach((level) => {
      const logger = loggers;
      expect(logger.levels[level]).to.be.equal(logger.levels[level]);
    });
  });
});

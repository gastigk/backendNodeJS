import twilio from 'twilio';

import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import customError from '../services/errors/log.error.js';

const twilioClient = twilio(config.twilio.accountSid, config.twilio.authToken);

export const sendSMS = async (userPhone) => {
  try {
    const message = `The user with the mobile number: ${userPhone} has just made a purchase.`;

    await twilioClient.messages.create({
      body: message,
      from: config.twilio.numberPhone,
      to: config.twilio.myPhone,
    });
  } catch (err) {
    customError(err);
    loggers.error('Error sending SMS');
  }
};
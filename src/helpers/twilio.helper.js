import twilio from 'twilio';
import config from '../config/config.js';
import loggers from '../config/logger.config.js';
import customError from '../services/error.log.js';

const twilioNumberPhone = config.twilio.numberPhone;
const twilioAccountSid = config.twilio.accountSid;
const twilioAuthToken = config.twilio.authToken;

const twilioClient = twilio(twilioAccountSid, twilioAuthToken);

export const sendSMS = async (userPhone) => {
  try {
    const message = `The user with the mobile number: ${userPhone} has just made a purchase.`;

    await twilioClient.messages.create({
      body: message,
      from: twilioNumberPhone,
      to: config.twilio.myPhone,
    });
  } catch (err) {
    customError(err);
    loggers.error('Error sending SMS');
  }
};

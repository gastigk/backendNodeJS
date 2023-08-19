import dotenv from 'dotenv';

dotenv.config();

export default {
  app: {
    persistence: process.env.PERSISTENCE,
    environment: process.env.ENVIRONMENT,
  },
  apiserver: {
    prodPort: process.env.PROD_PORT,
    devPort: process.env.DEV_PORT,
    urlLocal: process.env.URL_LOCAL,
    urlProd: process.env.URL_PROD,
  },
  local: {
    uri: process.env.LOCAL_URI,
    dbname: process.env.LOCAL_DB,
  },
  mongo: {
    uri: process.env.MONGO_URI,
    dbname: process.env.MONGO_DB,
    secret: process.env.SECRET,
  },
  jwt: {
    privateKey: process.env.PRIVATE_KEY,
    cookieName: process.env.JWT_COOKIE_NAME,
  },
  nodemailer: {
    user: process.env.MAILER_USER,
    pass: process.env.MAILER_PASS,
  },
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    numberPhone: process.env.TWILIO_NUMBER_PHONE,
    myPhone: process.env.MY_PHONE_NUMBER,
  },
  github: {
    clientId: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackUri: process.env.GITHUB_CALLBACK_URL,
    appId: process.env.GITHUB_APP_ID,
  },
};

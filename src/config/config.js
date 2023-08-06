import dotenv from 'dotenv';

dotenv.config();

export default {
  app: {
    persistence: process.env.PERSISTENCE,
    environment: process.env.ENVIRONMENT,
  },
  ports: {
    prodPort: process.env.PROD_PORT,
    devPort: process.env.DEV_PORT,
  },
  db: {
    local_connection: process.env.LOCAL_URI,
    local_database: process.env.LOCAL_DB,
    mongo_connection: process.env.MONGO_URI,
    mongo_database: process.env.MONGO_DB,
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
    client_Id: process.env.GITHUB_CLIENT_ID,
    client_Secret: process.env.GITHUB_CLIENT_SECRET,
    callback_URL: process.env.GITHUB_CALLBACK_URL,
    appId: process.env.GITHUB_APP_ID,
  },
  urls: {
    urlLocal: process.env.URL_LOCAL,
    urlProd: process.env.URL_PROD,
  },
};

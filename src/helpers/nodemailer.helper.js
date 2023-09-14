import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';

import config from '../config/config.js';
import loggers from '../config/loggers.config.js';
import { ProductService } from '../repositories/index.js';
import customError from '../services/errors/log.error.js';

// trasnporter configuration
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.nodemailer.user,
    pass: config.nodemailer.pass,
  },
  tls: { rejectUnauthorized: false },
});

// purchase notification
export const sendPurchaseConfirmationEmail = async (userEmail, cart, user) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Los Siete Rayos',
        link: {
          href: 'https://www.lossieterayos.com/',
          image: 'cid:logo@lossieterayos.com',
          width: 60,
          alt: 'Los Siete Rayos Logo',
        },
      },
    });

    const isPremium =
      user && (user.premium || (user.user && user.user.premium));

    const discountMultiplier = isPremium ? 0.8 : 1;

    const subTotal = cart.items.reduce(
      (total, item) => total + item.producto.price * item.cantidad,
      0
    );
    const totalPrice = (subTotal * discountMultiplier).toFixed(2);

    const emailContent = {
      body: {
        greeting: `Hi ${user.email || user.user.email}`,
        intro: [
          `${isPremium ? 'You are a PREMIUM user' : ''}`,
          `${isPremium ? 'You have a 20% discount on your purchase!' : ''}`,
          `Your purchase at Los Siete Rayos has been completed successfully. Below are the details of the same:`,
        ],
        table: {
          data: cart.items.map((item) => ({
            Imagen: `<img src="cid:${item.producto.thumbnail}@lossieterayos.com" alt="${item.producto.title}" width="60">`,
            Name: item.producto.title,
            Quatity: item.cantidad,
            Subtotal: `$ ${item.producto.price}.-`,
          })),
          columns: {
            Imagen: 'Img',
            Name: 'Name',
            Quatity: 'Quatity',
            Subtotal: 'Price',
          },
        },

        outro: [
          `Total price: $ ${totalPrice}.- ${
            isPremium ? '(20% discount applied)' : ''
          }`,
          `Purchase code: ${cart.code}`,
          `Date and time of purchase: ${cart.purchase_datetime}`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Los Siete Rayos <tickets@lossieterayos.com>',
      to: userEmail,
      subject: 'Confirmation of purchase at Los Siete Rayos',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);

    // stock reduction after mailing
    for (const item of cart.items) {
      try {
        const product = await ProductService.getById(item.producto._id);
        if (!product) {
          loggers.warning(`Product not found with id: ${item.producto._id}`);
          continue;
        }

        const newStock = product.stock - item.cantidad;
        if (newStock < 0) {
          loggers.warning(
            `There is not enough stock for the product: ${product.title}`
          );
          continue;
        }

        product.stock = newStock;
        await product.save();
      } catch (err) {
        customError(err);
        loggers.error('Error updating stock');
      }
    }
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email');
  }
};

// welcome notification
export const sendWelcomeUser = async (usermail) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Los Siete Rayos',
        link: {
          href: 'https://www.lossieterayos.com/',
          image: 'cid:logo@lossieterayos.com',
          width: 60,
          alt: 'Los Siete Rayos Logo',
        },
      },
    });

    const emailContent = {
      body: {
        greeting: `¡Welcome  ${usermail} toLos Siete Rayos!`,
        intro:
          'Thank you for joining our community. At Los Siete Rayos you will find a wide variety of products and special offers. We hope you enjoy your shopping experience with us!',
        outro: [
          'If you have any questions or need help, feel free to contact us.',
          `Contact email: hi@lossieterayos.com`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Los Siete Rayos <tickets@lossieterayos.com>',
      to: usermail,
      subject: '¡Welcome to Los Siete Rayos!',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email', err);
  }
};

// Notify account closed
export const sendCloseAccountEmail = async (usermail) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Los Siete Rayos',
        link: {
          href: 'https://www.lossieterayos.com/',
          image: 'cid:logo@lossieterayos.com',
          width: 60,
          alt: 'Los Siete Rayos Logo',
        },
      },
    });

    const emailContent = {
      body: {
        greeting: `Hi ${user.email || user.user.email}`,
        intro:
          'We are sorry to inform you that your Los Siete Rayos account has been closed.',
        outro: [
          'If you think this was a mistake or need more information, please contact us.',
          `Contact email: hi@lossieterayos.com`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Los Siete Rayos <tickets@lossieterayos.com>',
      to: usermail,
      subject: 'Account closure at Los Siete Rayos',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email', err);
  }
};

// notify account was closed due to inactivity
export const sendCloseInactivitiAccountEmail = async (usermail) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Los Siete Rayos',
        link: {
          href: 'https://www.lonneopen.com/',
          image: 'cid:logo@lossieterayos.com',
          width: 60,
          alt: 'Los Siete Rayos Logo',
        },
      },
    });

    const emailContent = {
      body: {
        greeting: `Hi ${user.email || user.user.email}`,
        intro:
          'We are sorry to inform you that your Los Siete Rayos account has been closed due to inactivity.',
        outro: [
          'If you think this was a mistake or need more information, please contact us.',
          `Contact email: hi@lossieterayos.com`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Los Siete Rayos <tickets@lossieterayos.com>',
      to: usermail,
      subject: 'Account closure at Los Siete Rayos',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email', err);
  }
};

// Cierre voluntario de la cuenta
export const sendCloseAccountForUserEmail = async (usermail) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Los Siete Rayos',
        link: {
          href: 'https://www.lonneopen.com/',
          image: 'cid:logo@lonneopen.com',
          width: 60,
          alt: 'Los Siete Rayos Logo',
        },
      },
    });

    const emailContent = {
      body: {
        greeting: `Hi ${user.email || user.user.email}`,
        intro:
          'We are sorry to inform you that your Los Siete Rayos account has been closed.',
        outro: [
          'If you think this was a mistake or need more information, please contact us.',
          `Contact email: hi@lossieterayos.com`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Los Siete Rayos <tickets@lossieterayos.com>',
      to: usermail,
      subject: 'Account closure at Los Siete Rayos',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email', err);
  }
};

export const sendResetPasswordEmail = async (usermail, token) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Los Siete Rayos',
        link: {
          href: 'https://www.lossieterayos.com/',
          image: 'cid:logo@lossieterayos.com',
          width: 60,
          alt: 'Los Siete Rayos Logo',
        },
      },
    });

    const resetLink = `${config.apiserver.urlLocal}reset-password/${token}`;

    const emailContent = {
      body: {
        greeting: `Hi ${user.email || user.user.email}`,
        intro:
          'We received a request to reset your account password at Los Siete Rayos. If you did not make this request, you can ignore this email.',
        action: {
          instructions:
            'If you want to reset your password, click the following button:',
          button: {
            text: 'Restore password',
            link: resetLink,
          },
        },

        outro: [
          'If you need help or have any questions, feel free to contact us.',
          `Contact email: hi@lossieterayos.com`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Los Siete Rayos <tickets@lossieterayos.com>',
      to: usermail,
      subject: 'Reset password at Los Siete Rayos',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email', err);
  }
};

// password reset notification
export const sendPasswordChangedEmail = async (usermail) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Los Siete Rayos',
        link: {
          href: 'https://www.lossieterayos.com/',
          image: 'cid:logo@lossieterayos.com',
          width: 60,
          alt: 'Los Siete Rayos Logo',
        },
      },
    });

    const emailContent = {
      body: {
        greeting: `Hi ${user.email || user.user.email}`,
        intro:
          'We inform you that your password has been successfully reset at Los Siete Rayos.',

        outro: [
          'If you did not take this action or need more information, please contact us.',
          `Contact email: hi@lossieterayos.com`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Los Siete Rayos <tickets@lossieterayos.com>',
      to: usermail,
      subject: 'Password reset at Los Siete Rayos',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email');
  }
};

export const sendPremiumUpgradeUser = async (usermail) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'Los Siete Rayos',
        link: {
          href: 'https://www.lossieterayos.com/',
          image: 'cid:logo@lossieterayos.com',
          width: 60,
          alt: 'Los Siete Rayos Logo',
        },
      },
    });

    const emailContent = {
      body: {
        greeting: `Hi ${user.email || user.user.email}`,
        intro: [
          'You are now a Premium User!',
          'You will be able to access important discounts and benefits',
        ],

        outro: [
          'If you did not take this action or need more information, please contact us.',
          `Contact email: hi@lossieterayos.com`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'Los Siete Rayos <tickets@lossieterayos.com>',
      to: usermail,
      subject: 'Hi again to Los Siete Rayos',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);
  } catch (err) {
    customError(err);
    loggers.error('Failed to send email', err);
  }
};

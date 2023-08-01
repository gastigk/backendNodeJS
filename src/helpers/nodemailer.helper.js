import config from '../config/config.js';
import loggers from '../config/logger.config.js';
import nodemailer from 'nodemailer';
import Mailgen from 'mailgen';
import Producto from '../models/product.model.js';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: config.gmail.user,
    pass: config.gmail.pass,
  },
  tls: { rejectUnauthorized: false },
});

export const sendPurchaseConfirmationEmail = async (userEmail, cart, user) => {
  try {
    const mailGenerator = new Mailgen({
      theme: 'default',
      product: {
        name: 'El Séptimo Rayo',
        link: {
          href: 'https://www.elseptimorayo.com/',
          image: 'cid:logo@elseptimorayo.com',
          width: 60,
          alt: 'El Séptimo Rayo Logo',
        },
      },
    });

    const totalPrice = cart.items.reduce(
      (total, item) => total + item.producto.price * item.cantidad,
      0
    );

    const emailContent = {
      body: {
        greeting: `Hi ${user.email || user.user.email}`,
        intro:
          'Your purchase at El Séptimo Rayo has been completed successfully. Below are the details of it:',
        table: {
          data: cart.items.map((item) => ({
            // Img: `<img src="cid:${item.producto.thumbnail}@elseptimorayo.com" alt="${item.producto.title}" width="60">`,
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
          `Total price: $ ${totalPrice}.-`,
          `Purchase code: ${cart.code}`,
          `Date and time of purchase: ${cart.purchase_datetime}`,
          // `<img src="cid:logo@elseptimorayo.com" alt="El Séptimo Rayo" width="60">`,
        ],
      },
    };

    const emailBody = mailGenerator.generate(emailContent);

    const mailOptions = {
      from: 'El Séptimo Rayo <tickets@elseptimorayo.com>',
      to: userEmail,
      subject: 'Confirmation of purchase at El Séptimo Rayo',
      html: emailBody,
    };

    await transporter.sendMail(mailOptions);

    // stock reduction after mailing
    for (const item of cart.items) {
      try {
        const product = await Producto.findById(item.producto._id);
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

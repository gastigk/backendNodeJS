import chatModel from '../models/message.model.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';
import customError from '../services/errors/log.error.js';

// no DAO applied
export const getChatsController = async (req, res) => {
  try {
    let user = getUserFromToken(req);
    const messages = await chatModel.find();

    res.render('chat', { messages, user });
  } catch (error) {
    customError(error);
    loggers.error('Error getting messages');
    res.status(500).render('error/error500', { user });
  }
};

// no DAO applied
export const sendChatController = async (req, res) => {
  try {
    let user = '';

    if (req.body.user) {
      user = req.body.user.toString();
    } else {
      const userData = getUserFromToken(req);
      user = userData.email.toString();
    }

    const message = req.body.message;
    const newMessage = new Chat({ user, message });
    await newMessage.save();
    res.redirect('/chat');
  } catch (error) {
    customError(error);
    loggers.error('Error saving message');
    res.status(500).render('error/error500', { user });
  }
};
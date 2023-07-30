import Chat from '../models/message.model.js';
import { getUserFromToken } from '../middlewares/user.middleware.js';

// no DAO applied
export const getChatsController = async (req, res) => {
  try {
    let user = getUserFromToken(req);
    const messages = await Chat.find();

    res.render('chat', { messages, user });
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error getting messages');
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
  } catch (err) {
    loggers.error(err);
    res.status(500).send('Error saving message');
  }
};

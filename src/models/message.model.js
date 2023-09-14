import mongoose from 'mongoose';

const messageCollection = 'messages';

const messagesSchema = new mongoose.Schema({
  user: {
    type: String,
    index: true,
  },
  message: [
    {
      type: String,
    },
  ],
});

const messageModel = mongoose.model(messageCollection, messagesSchema);

export default messageModel;
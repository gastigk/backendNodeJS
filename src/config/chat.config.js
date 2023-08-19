import loggers from './loggers.config.js';

import messageModel from '../models/message.model.js';

// client sends his message
const chatApp = (socketServer) => {
  let log = [];
  let newproduct = [];

  socketServer.on('connection', (socketClient) => {
    let queryUser = socketClient.handshake.query.user;
    loggers.notice(`New client "${queryUser}" connected...`);

    socketClient.on('message', (data) => {
      loggers.notice(`${data.user} sey: ${data.message}`);
      log.push(data);
      socketClient.emit('history', log);
      socketClient.broadcast.emit('history', log);

      messageModel.findOneAndUpdate(
        { user: data.user },
        { $push: { message: data.message } },
        { upsert: true }
      )
        .then(() => {
          loggers.notice(`${data.user}'s message was saved in the model`);
        })
        .catch((err) => {
          loggers.error('Eerror saving message in model:', err);
        });
    });

    socketClient.on('product', (dataProd) => {
      newproduct.push(dataProd);
      socketClient.emit('product-list', newproduct);
      socketClient.broadcast.emit('product-list', newproduct);
    });

    socketClient.broadcast.emit('newUser', queryUser);
  });
};
export default chatApp;

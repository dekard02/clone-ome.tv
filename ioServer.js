const socketio = require('socket.io');

const io = socketio();

const users = {};
let userInQueue;

io.on('connect', socket => {
  io.emit('user-count', io.engine.clientsCount);

  socket.on('disconnect', () => {
    io.emit('user-count', io.engine.clientsCount);
    if (users[socket.id]) {
      if (users[socket.id].connectTo) {
        const userConnectTo = users[socket.id].connectTo;
        socket.to(userConnectTo).emit('user-disconnect');
      }

      delete users[socket.id];
    }
  });

  socket.on('peerId', id => {
    users[socket.id] = {
      socketId: socket.id,
      peerId: id,
    };
  });

  socket.on('start', callback => {
    if (!userInQueue) {
      userInQueue = users[socket.id];
      callback({
        status: 'in-queue',
        peerId: null,
      });
      return;
    }

    users[socket.id].connectTo = userInQueue.socketId;
    users[userInQueue.socketId].connectTo = socket.id;

    callback({
      status: 'found',
      peerId: userInQueue.peerId,
    });

    userInQueue = undefined;
  });

  socket.on('send-msg', msg => {
    if (!users[socket.id].connectTo) return;
    socket.to(users[socket.id].connectTo).emit('receive-msg', msg);
  });

  socket.on('stop', () => {
    if (userInQueue)
      userInQueue =
        userInQueue.socketId === socket.id ? undefined : userInQueue;

    if (users[socket.id].connectTo) {
      const userConnectTo = users[socket.id].connectTo;
      socket.to(userConnectTo).emit('user-disconnect');
    }
  });
});

module.exports = io;

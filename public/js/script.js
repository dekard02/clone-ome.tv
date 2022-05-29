import { addVideo, toogleButton, appendMsg } from './utils.js';

const socket = io();
const peer = new Peer(undefined, {
  host: '/',
  port: location.port,
  path: '/peerjs',
});

socket.on('user-count', data => {
  const userCount = document.getElementById('user-count');
  userCount.textContent = data;
});

peer.on('open', id => {
  socket.emit('peerId', id);
});

const connectToOther = (peerId, stream) => {
  const mediaConnection = peer.call(peerId, stream);

  const video = document.querySelector('.other-video');
  mediaConnection.on('stream', stream => {
    addVideo(video, stream);
  });

  mediaConnection.on('close', () => {
    video.srcObject = undefined;
  });

  return mediaConnection;
};

(async () => {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });

  const video = document.querySelector('.my-video');
  video.muted = true;
  const otherVideo = document.querySelector('.other-video');

  addVideo(video, stream);

  const startBtn = document.querySelector('.start-button');
  const stopBtn = document.querySelector('.stop-button');
  const sendMsgBtn = document.getElementById('send-msg');

  startBtn.addEventListener('click', e => {
    e.preventDefault();
    toogleButton(stopBtn, e.target);
    sendMsgBtn.disabled = false;

    socket.emit('start', respone => {
      if (respone.peerId === null) {
        return;
      }

      const mediaConnection = connectToOther(respone.peerId, stream);
      stopBtn.addEventListener('click', e => {
        e.preventDefault();
        toogleButton(startBtn, e.target);
        sendMsgBtn.disabled = true;
        mediaConnection.close();
        socket.emit('stop');
      });

      socket.on('user-disconnect', () => {
        mediaConnection.close();
        toogleButton(startBtn, stopBtn);
        sendMsgBtn.disabled = true;
      });
    });
  });

  peer.on('call', mediaConnection => {
    mediaConnection.answer(stream);
    mediaConnection.on('stream', otherStream => {
      addVideo(otherVideo, otherStream);
    });

    mediaConnection.on('close', () => {
      otherVideo.srcObject = undefined;
    });

    const startBtn = document.querySelector('.start-button');
    const stopBtn = document.querySelector('.stop-button');
    stopBtn.addEventListener('click', e => {
      e.preventDefault();
      toogleButton(startBtn, e.target);
      sendMsgBtn.disabled = true;
      mediaConnection.close();
      socket.emit('stop');
    });

    socket.on('user-disconnect', () => {
      mediaConnection.close();
      toogleButton(startBtn, stopBtn);
      sendMsgBtn.disabled = true;
    });
  });
})();

const msgForm = document.querySelector('.msg-form');
msgForm.addEventListener('submit', e => {
  e.preventDefault();
  const msgContent = document.getElementById('msg').value;
  socket.emit('send-msg', msgContent);
  document.getElementById('msg').value = '';
  const msgList = document.querySelector('.msg-list');

  appendMsg(msgContent, msgList, 'right');
});

socket.on('receive-msg', msg => {
  const msgList = document.querySelector('.msg-list');

  appendMsg(msg, msgList);
});

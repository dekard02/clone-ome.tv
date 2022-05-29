export const addVideo = (video, stream) => {
  video.srcObject = stream;
  video.onloadedmetadata = () => {
    video.play();
  };
};

export const toogleButton = (enabledButton, disabledButton) => {
  enabledButton.disabled = false;
  disabledButton.disabled = true;
};
export const appendMsg = (msgContent, msgList, side) => {
  const msg = document.createElement('li');
  msg.textContent = msgContent;
  if (side) {
    msg.style.textAlign = side;
  }
  msgList.appendChild(msg);
};

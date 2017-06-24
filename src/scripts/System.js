let doubleBuffering = false;
let backBufferContext2D = null;
let backBuffer = null;
let gameWidthZoom = 0;
let gameHeightZoom = 0;
let context2D = null;

export function initFrameBuffer(wrapperId, gameWidth, gameHeight, doubleBuffer, zoomFactor) {
  doubleBuffering = doubleBuffer;
  zoomFactor = doubleBuffer ? zoomFactor : 1;
  gameWidthZoom = gameWidth * zoomFactor;
  gameHeightZoom = gameHeight * zoomFactor;

  const canvas = document.createElement('canvas');
  canvas.setAttribute('width', gameWidthZoom + 'px');
  canvas.setAttribute('height', gameHeightZoom + 'px');
  canvas.setAttribute('border', 1 + 'px solid black');
  canvas.setAttribute('style', 1 + 'background: #fff');
  document.getElementById(wrapperId).appendChild(canvas);
  context2D = canvas.getContext('2d');

  if (doubleBuffer) {
    backBuffer = document.createElement('canvas');
    backBuffer.width = gameWidth;
    backBuffer.height = gameHeight;
    backBufferContext2D = backBuffer.getContext('2d');
  }
  return doubleBuffering ? backBufferContext2D : context2D;
}

export function drawFrameBuffer() {
  if (doubleBuffering) {
    context2D.drawImage(backBuffer,
      0, 0, backBuffer.width, backBuffer.height,
      0, 0, gameWidthZoom, gameHeightZoom);
  }
}

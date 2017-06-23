export const System = {
  canvas: null,
  context2D: null,
  backBuffer: null,
  backBufferContext2D: null,
  wrapper: null,
  doubleBuffering: false,
  zoomFactor: 1,
  gameWidth: 0,
  gameHeight: 0,
  gameWidthZoom: 0,
  gameHeightZoom: 0,

  initVideo(wrapperId, gameWidth, gameHeight, doubleBuffering, zoomFactor) {
    this.gameWidth = gameWidth;
    this.gameHeight = gameHeight;
    this.doubleBuffering = doubleBuffering;
    this.zoomFactor = this.doubleBuffering ? zoomFactor : 1;
    this.gameWidthZoom = this.gameWidth * this.zoomFactor;
    this.gameHeightZoom = this.gameHeight * this.zoomFactor;
    this.wrapper = document.getElementById(wrapperId);
    this.canvas = document.createElement('canvas');
    this.canvas.setAttribute('width', (this.gameWidthZoom) + 'px');
    this.canvas.setAttribute('height', (this.gameHeightZoom) + 'px');
    this.canvas.setAttribute('border', 1 + 'px solid black');
    this.canvas.setAttribute('style', 1 + 'background: #fff');
    this.wrapper.appendChild(this.canvas);
    this.context2D = this.canvas.getContext('2d');

    if (this.doubleBuffering) {
      this.backBuffer = document.createElement('canvas');
      this.backBuffer.width = this.gameWidth;
      this.backBuffer.height = this.gameHeight;
      this.backBufferContext2D = this.backBuffer.getContext('2d');
    }
  },

  getFrameBuffer() {
    return this.doubleBuffering ? this.backBufferContext2D : this.context2D;
  },

  drawFrameBuffer() {
    if (this.doubleBuffering) {
      this.context2D.drawImage(this.backBuffer,
        0, 0, this.backBuffer.width, this.backBuffer.height,
        0, 0, this.gameWidthZoom, this.gameHeightZoom);
    }
  },

  random(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
};

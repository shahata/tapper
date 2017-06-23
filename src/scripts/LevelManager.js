import {SoundManager} from './SoundManager';
import {ResourceManager} from './ResourceManager';
import {Customers} from './Customers';
import {STATE_PLAY, currentGameState} from './Main';

export const LevelManager = {
  NUM_LEVEL: 1,
  MAX_LIFE: 3,
  rowLBound: [null, 120, 88, 56, 24],
  rowRBound: [null, 304, 334, 368, 400],
  rowYPos: [null, 80, 176, 272, 368],
  imageLevel: [1 + 1],
  currentLevel: 1,
  score: 0,
  life: 0,
  difficulty: 1,
  wave: 1,
  lastRow: -1,
  timeCounter: 0,
  timeStep: 3,
  TIME_COUNTER_MAX: 60,
  fontImage: null,
  miscImage: null,
  gameTitleImage: null,
  readyToPlayImage: null,
  gameTitleLogoWidth: 416,
  gameTitleLogoHeight: 160,
  copyright1: 'Based on the Original Tapper Game',
  copyright2: '(c) 1983 Bally Midway MFG',
  gameOver: 'GAME OVER !',
  LIFE_ICON_OFF: 0,
  ICON_SIZE: 16,
  FONT_Y_OFF: 0,
  FONT_NUM_OFF: 0,
  FONT_SIZE: 16,
  SCORE_X_POS: 100,
  SCORE_Y_POS: 8,
  LIFE_Y_POS: 24,
  DIFF_X_POS: 376,
  SCORE_BONUS: 1500,
  SCORE_EMPTY_BEER: 100,
  SCORE_CUSTOMER: 50,

  init() {
    this.gameTitleImage = ResourceManager.getImageResource('game_title');
    this.readyToPlayImage = ResourceManager.getImageResource('pregame');
    this.imageLevel[1] = ResourceManager.getImageResource('level-1');
    this.fontImage = ResourceManager.getImageResource('font');
    this.miscImage = ResourceManager.getImageResource('misc');
    this.currentLevel = 1;
    this.score = 0;
    this.life = this.MAX_LIFE;
    this.difficulty = 1;
    this.wave = 1;
    this.timeCounter = 0;
  },

  addCustomer() {
    if (currentGameState === STATE_PLAY) {
      if (Customers.isAnyCustomer() < 2) {
        if (this.wave++ === (this.difficulty * 2)) {
          this.difficulty++;
        }

        for (let i = 1; i <= this.difficulty; i++) {
          Customers.add(1, i, Customers.CUSTOMER_GREEN_HAT_COWBOY);
          Customers.add(2, i, Customers.CUSTOMER_WOMAN);
          Customers.add(3, i, Customers.CUSTOMER_BLACK_GUY);
          Customers.add(4, i, Customers.CUSTOMER_GRAY_HAT_COWBOY);
          SoundManager.play(SoundManager.POP_OUT, false);
        }
      } else {
        const randomRow = Math.floor(Math.random() * 5);
        if ((randomRow !== 0) && (randomRow !== this.lastRow)) {
          const randomCustomerType = Math.floor(Math.random() * (Customers.MAX_CUSTOMER_TYPE));
          Customers.add(randomRow, 1, randomCustomerType);
          SoundManager.play(SoundManager.POP_OUT, false);
          this.lastRow = randomRow;
        }
      }
      setTimeout(() => LevelManager.addCustomer(), (this.timeStep * 1000));
    }
  },

  addScore(points) {
    this.score += points;
  },

  lifeLost() {
    this.life -= 1;
  },

  displayScore(context) {
    const scoreText = '' + this.score;
    let xPos = this.SCORE_X_POS;
    let offset;
    for (let i = scoreText.length; i--;) {
      offset = (scoreText.charAt(i) * this.FONT_SIZE) + this.FONT_NUM_OFF;
      context.drawImage(this.fontImage,
        offset, this.FONT_Y_OFF,
        this.FONT_SIZE, this.FONT_SIZE,
        xPos, this.SCORE_Y_POS,
        this.FONT_SIZE, this.FONT_SIZE);
      xPos -= this.FONT_SIZE;
    }
  },

  displayDifficulty(context) {
    const diffText = '' + this.difficulty;
    let xPos = this.DIFF_X_POS;
    let offset;
    for (let i = diffText.length; i--;) {
      offset = (diffText.charAt(i) * this.FONT_SIZE) + this.FONT_NUM_OFF;
      context.drawImage(this.fontImage,
   offset, this.FONT_Y_OFF,
   this.FONT_SIZE, this.FONT_SIZE,
   xPos, this.SCORE_Y_POS,
   this.FONT_SIZE, this.FONT_SIZE);
      xPos -= this.FONT_SIZE;
    }
  },

  displayLife(context) {
    let xPos = this.SCORE_X_POS;
    if (this.life <= 0) {
      return;
    }

    for (let i = this.life; i--;) {
      context.drawImage(this.miscImage,
   this.LIFE_ICON_OFF, 0,
   this.ICON_SIZE, this.ICON_SIZE,
   xPos, this.LIFE_Y_POS,
   this.ICON_SIZE, this.ICON_SIZE);
      xPos -= this.FONT_SIZE;
    }
  },

  displayGameTitle(context) {
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fill();
    context.drawImage(this.gameTitleImage,
      (context.canvas.width - this.gameTitleLogoWidth) / 2,
      (280 - this.gameTitleLogoHeight));
    context.fillStyle = 'rgb(255,255,255)';
    context.font = 'bold 14px Courier';
    context.textBaseline = 'top';
    context.fillText(this.copyright1, 122, 290);
    context.fillText(this.copyright2, 154, 310);
    context.fillText('Press [ENTER] to play', 172, 400);
  },

  displayReadyToPlay(context) {
    context.drawImage(this.readyToPlayImage, 0, 0);
  },

  displayGameOver(context) {
    context.fillStyle = 'rgb(0,0,0)';
    context.fillRect((context.canvas.width - 180) / 2, (context.canvas.height - 32) / 2, 180, 32);
    context.fill();
    context.fillStyle = 'rgb(255,255,255)';
    context.font = 'bold 14px Courier';
    context.textBaseline = 'top';
    context.fillText(this.gameOver, ((context.canvas.width - 180) / 2) + 48, ((context.canvas.height - 32) / 2) + 8);
  },

  reset() {
    for (let i = 1; i <= this.difficulty; i++) {
      Customers.add(1, i, Customers.CUSTOMER_GREEN_HAT_COWBOY);
      Customers.add(2, i, Customers.CUSTOMER_WOMAN);
      Customers.add(3, i, Customers.CUSTOMER_BLACK_GUY);
      Customers.add(4, i, Customers.CUSTOMER_GRAY_HAT_COWBOY);
    }

    this.lastRow = -1;
    setTimeout(() => LevelManager.addCustomer(), (this.timeStep * 1000));
  },

  newGame() {
    this.currentLevel = 1;
    this.score = 0;
    this.life = this.MAX_LIFE;
    this.difficulty = 1;
    this.wave = 1;
    this.timeCounter = 0;
    this.lastRow = -1;
  },

  drawGameHUD(context) {
    LevelManager.displayScore(context);
    LevelManager.displayLife(context);
    LevelManager.displayDifficulty(context);
  },

  drawLevelBackground(context) {
    const bgImage = this.imageLevel[this.currentLevel];
    context.drawImage(bgImage, 0, 0);
  }
};

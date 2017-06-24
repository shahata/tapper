import {getImageResource, BARMAN_ZIP_UP, BARMAN_ZIP_DOWN, MUG_FILL1, MUG_FILL2, FULL_MUG, THROW_MUG, BARMAN} from './ResourceManager';
import {playSound} from './SoundManager';
import {addBeerGlass} from './BeerGlass';
import {Customers} from './Customers';

export const Player = {
  STEP: 16,
  LEFT: 0,
  RIGHT: 1,
  UP: 2,
  DOWN: 3,
  FIRE: 4,
  NONE: 6,
  STAND_L1: 0,
  STAND_L2: 1,
  STAND_R1: 8,
  STAND_R2: 9,
  RUN_UP_L1: 12,
  RUN_UP_R1: 13,
  RUN_DOWN_1: 14,
  RUN_DOWN_2: 16,
  RUN_DOWN_3: 18,
  RUN_DOWN_4: 20,
  RUN_DOWN_RIGHT_OFF: 8,
  TAPPER_1: 30,
  TAPPER_2: 31,
  TAPPER_3: 32,
  SERVE_UP_1_1: 33,
  SERVE_UP_1_2: 34,
  SERVE_DOWN_1: 35,
  SERVE_UP_2_1: 36,
  SERVE_UP_2_2: 37,
  SERVE_DOWN_2: 38,
  BEER_FILL: [null, 39, 40, 41, 42],
  SERVING_MAX: 4,
  LOST_1: 43,
  LOST_2: 44,
  GO1: 4,
  GO2: 5,
  GO3: 6,
  GO4: 7,
  spriteWidth: 32,
  spriteHeight: 32,
  spriteImage: null,
  goState: 0,
  legState: 0,
  tapperState: 0,
  servingCounter: 0,
  rowXPos: [null, 336, 368, 400, 432],
  rowYPos: [null, 96, 192, 288, 384],
  rowLBound: [null, 128, 96, 64, 32],
  rowRBound: [null, 336, 368, 400, 432],
  playerAction: null,
  gamePlay: false,
  currentRow: 2,
  lastRow: 0,
  lastPlayerXPos: null,
  playerGoLeft: true,
  playerRunning: false,
  tapperServing: false,
  playerXPos: 336,
  playerYPos: 192,
  fpsCount: 0,
  legAnimationTiming: 20,

  init() {
    this.spriteImage = getImageResource(BARMAN);
  },

  reset() {
    this.currentRow = 2;
    this.lastRow = 0;
    this.playerXPos = 336;
    this.playerYPos = 192;
    this.playerAction = 0;
    this.goState = this.GO1;
    this.legState = this.RUN_DOWN_1 - 2;
    this.tapperState = this.TAPPER_1;
    this.lastRow = 0;
    this.playerGoLeft = true;
    this.playerRunning = false;
    this.gamePlay = true;
    this.tapperServing = false;
  },

  lost() {
    this.playerRunning = false;
    this.tapperServing = false;
    this.gamePlay = false;
    this.playerAction = this.LOST_1;
  },

  setAnimation() {
    if ((this.fpsCount++ > this.legAnimationTiming) && (this.gamePlay)) {
      if (this.playerGoLeft) {
        this.playerAction = (this.playerAction === this.STAND_L1) ? this.STAND_L2 : this.STAND_L1;
      } else {
        this.playerAction = (this.playerAction === this.STAND_R1) ? this.STAND_R2 : this.STAND_R1;
      }
      this.fpsCount = 0;
    }
  },

  drawTapper(context) {
    for (let rowNum = 1; rowNum < 5; rowNum++) {
      if ((this.currentRow !== rowNum) || (!this.tapperServing) || (this.goState !== 0)) {
        context.drawImage(this.spriteImage,
          this.TAPPER_1 * 32, 0, this.spriteWidth, this.spriteHeight,
          this.rowRBound[rowNum] + 12, this.rowYPos[rowNum] - 24, this.spriteWidth, this.spriteHeight);
      } else {
        context.drawImage(this.spriteImage,
          this.tapperState * 32, 0, this.spriteWidth, this.spriteHeight,
          this.rowRBound[rowNum] + 12, this.rowYPos[rowNum] - 30, this.spriteWidth, this.spriteHeight);
      }
    }
  },

  drawServing(context) {
    for (let i = 1, count = this.servingCounter + 1; i < count; i++) {
      context.drawImage(this.spriteImage,
        this.BEER_FILL[i] * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos + 12, this.playerYPos + 2, this.spriteWidth, this.spriteHeight);
    }
    if (this.tapperState === this.TAPPER_2) {
      context.drawImage(this.spriteImage,
        this.SERVE_UP_1_1 * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos - 20, this.playerYPos + 2, this.spriteWidth, this.spriteHeight);
      context.drawImage(this.spriteImage,
        this.SERVE_UP_1_2 * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos + 12, this.playerYPos + 2, this.spriteWidth, this.spriteHeight);
      context.drawImage(this.spriteImage,
        this.SERVE_DOWN_1 * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos - 20, this.playerYPos + this.spriteHeight + 2, this.spriteWidth, this.spriteHeight);
    } else {
      context.drawImage(this.spriteImage,
        this.SERVE_UP_2_1 * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos - 20, this.playerYPos + 2, this.spriteWidth, this.spriteHeight);
      context.drawImage(this.spriteImage,
        this.SERVE_UP_2_2 * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos + 12, this.playerYPos + 2, this.spriteWidth, this.spriteHeight);
      context.drawImage(this.spriteImage,
        this.SERVE_DOWN_2 * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos - 20, this.playerYPos + this.spriteHeight + 2, this.spriteWidth, this.spriteHeight);
    }
  },

  draw(context) {
    Player.drawTapper(context);
    if (this.lastRow !== 0) {
      context.drawImage(this.spriteImage,
        this.goState * 32, 0, this.spriteWidth, this.spriteHeight,
        this.lastPlayerXPos, this.rowYPos[this.lastRow], this.spriteWidth, this.spriteHeight);
      this.goState += 1;

      if (this.goState > this.GO4) {
        this.goState = 0;
        this.lastRow = 0;
        return true;
      }
      return false;
    }

    if (this.tapperServing) {
      Player.drawServing(context);
      return true;
    }

    context.drawImage(this.spriteImage,
      this.playerAction * 32, 0, this.spriteWidth, this.spriteHeight,
      this.playerXPos, this.playerYPos, this.spriteWidth, this.spriteHeight);

    if (!this.playerRunning) {
      Player.setAnimation();
      context.drawImage(this.spriteImage,
        (2 + this.playerAction) * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos, this.playerYPos + this.spriteHeight, this.spriteWidth, this.spriteHeight);
    } else if (this.playerGoLeft) {
      context.drawImage(this.spriteImage,
        this.legState * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos, this.playerYPos + this.spriteHeight, this.spriteWidth, this.spriteHeight);
      context.drawImage(this.spriteImage,
        (this.legState + 1) * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos + this.spriteHeight, this.playerYPos + this.spriteHeight, this.spriteWidth, this.spriteHeight);
    } else {
      context.drawImage(this.spriteImage,
        (this.legState + this.RUN_DOWN_RIGHT_OFF) * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos, this.playerYPos + this.spriteHeight, this.spriteWidth, this.spriteHeight);
      context.drawImage(this.spriteImage,
        (this.legState + 1 + this.RUN_DOWN_RIGHT_OFF) * 32, 0, this.spriteWidth, this.spriteHeight,
        this.playerXPos - this.spriteHeight, this.playerYPos + this.spriteHeight, this.spriteWidth, this.spriteHeight);
    }
    return true;
  },

  move(direction) {
    this.playerRunning = false;
    switch (direction) {
      case this.UP:
        this.tapperServing = false;
        this.lastRow = this.currentRow;
        this.currentRow -= 1;
        if (this.currentRow === 0) {
          this.currentRow = 4;
        }
        this.goState = this.GO1;
        this.lastPlayerXPos = this.playerXPos;
        this.playerXPos = this.rowXPos[this.currentRow];
        this.playerYPos = this.rowYPos[this.currentRow];
        playSound(BARMAN_ZIP_UP);
        break;
      case this.DOWN:
        this.tapperServing = false;
        this.lastRow = this.currentRow;
        this.currentRow += 1;
        if (this.currentRow === 5) {
          this.currentRow = 1;
        }
        this.goState = this.GO1;
        this.lastPlayerXPos = this.playerXPos;
        this.playerXPos = this.rowXPos[this.currentRow];
        this.playerYPos = this.rowYPos[this.currentRow];
        playSound(BARMAN_ZIP_DOWN);
        break;
      case this.LEFT:
        this.tapperServing = false;
        if ((this.playerGoLeft) && (this.playerXPos > (this.rowLBound[this.currentRow]))) {
          this.playerXPos -= this.STEP;
          this.playerRunning = true;
          this.playerAction = this.RUN_UP_L1;
          this.legState += 2;
          if (this.legState > this.RUN_DOWN_4) {
            this.legState = this.RUN_DOWN_1;
          }
          Customers.checkBonusCollision(this.currentRow, this.playerXPos);
        }
        this.playerGoLeft = true;
        break;
      case this.RIGHT:
        this.tapperServing = false;
        if ((!this.playerGoLeft) && (this.playerXPos < (this.rowRBound[this.currentRow]))) {
          this.playerXPos += this.STEP;
          this.playerRunning = true;
          this.playerAction = this.RUN_UP_R1;
          this.legState += 2;
          if (this.legState > this.RUN_DOWN_4) {
            this.legState = this.RUN_DOWN_1;
          }
        }
        this.playerGoLeft = false;
        break;
      case this.FIRE:
        if (this.playerXPos !== this.rowRBound[this.currentRow]) {
          this.lastRow = this.currentRow;
          this.goState = this.GO1;
          this.lastPlayerXPos = this.playerXPos;
          this.playerXPos = this.rowXPos[this.currentRow];
        }
        if (this.tapperServing === false) {
          this.servingCounter = 0;
        }
        this.tapperServing = true;
        this.tapperState = this.TAPPER_3;
        if (this.servingCounter < this.SERVING_MAX) {
          this.servingCounter += 1;
          switch (this.servingCounter) {
            case 1 :
              playSound(MUG_FILL1);
              break;
            case 2 :
            case 3 :
              playSound(MUG_FILL2);
              break;
            case this.SERVING_MAX :
              playSound(FULL_MUG);
              break;
            default:
              break;
          }
        }
        break;
      case this.NONE:
        if (this.tapperServing) {
          this.tapperState = this.TAPPER_2;
          if (this.servingCounter === this.SERVING_MAX) {
            this.servingCounter = 0;
            addBeerGlass(this.currentRow, this.playerXPos - this.spriteWidth, true);
            this.tapperServing = false;
            this.playerGoLeft = false;
            this.playerAction = this.STAND_R1;
            playSound(THROW_MUG);
          }
        } else {
          if (this.playerGoLeft) {
            this.playerAction = this.STAND_L1;
          } else {
            this.playerAction = this.STAND_R1;
          }
          this.legState = this.RUN_DOWN_1 - 2;
        }
        break;
      default:
        break;
    }
  }
};

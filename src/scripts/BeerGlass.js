import {getImageResource, BEER_GLASS, GRAB_MUG} from './ResourceManager';
import {STATE_PLAY, FPS, currentGameState} from './Main';
import {LevelManager} from './LevelManager';
import {playSound} from './SoundManager';
import {Customers} from './Customers';
import {Player} from './Player';

export const BeerGlass = {
  SPRITE_FULL_1: 0,
  SPRITE_FULL_2: 32,
  SPRITE_EMPTY_1: 64,
  SPRITE_FALLING: 96,
  SPRITE_BROKEN: 128,
  STEP: 4,
  FULL_MUG: 0,
  EMPTY_MUG: 1,
  spriteWidth: 32,
  spriteHeight: 32,
  isOneFullGlassBroken: false,
  isOneEmptyGlassBroken: false,
  glassesFull: [],
  glassesEmpty: [],
  spriteImage: null,

  init() {
    this.spriteImage = getImageResource(BEER_GLASS);
  },

  reset() {
    for (let count = 1; count < 5; count++) {
      this.glassesFull[count] = [];
      this.glassesEmpty[count] = [];
    }
    this.isOneFullGlassBroken = false;
    this.isOneEmptyGlassBroken = false;
  },

  add(row, xPos, type) {
    const glass = new Glass(row, xPos, LevelManager.rowYPos[row] + 8, type);
    if (type === BeerGlass.FULL_MUG) {
      this.glassesFull[row].push(glass);
    } else {
      this.glassesEmpty[row].push(glass);
    }
  },

  stop() {

  },

  checkCustomerCollision(glass, row) {
    const customerPos = Customers.getFirstCustomerPos(row) + 24;
    if (glass.xPos <= customerPos) {
      return Customers.beerCollisionDetected(row);
    }
    return false;
  },

  checkPlayerCollision(glass, row) {
    if ((Player.currentRow === row) && (glass.xPos + this.spriteWidth >= Player.playerXPos)) {
      playSound(GRAB_MUG);
      LevelManager.addScore(LevelManager.SCORE_EMPTY_BEER);
      return true;
    }
    return false;
  },

  draw(context) {
    let ret = 0;
    ret += BeerGlass.drawFullMug(context, 1);
    ret += BeerGlass.drawEmptyMug(context, 1);
    ret += BeerGlass.drawFullMug(context, 2);
    ret += BeerGlass.drawEmptyMug(context, 2);
    ret += BeerGlass.drawFullMug(context, 3);
    ret += BeerGlass.drawEmptyMug(context, 3);
    ret += BeerGlass.drawFullMug(context, 4);
    ret += BeerGlass.drawEmptyMug(context, 4);
    return ret;
  },

  drawFullMug(context, rowCount) {
    let glass;
    let ret = 0;
    let collision = false;
    const glassArrayCopy = this.glassesFull[rowCount].slice();
    for (let i = this.glassesFull[rowCount].length; i--;) {
      glass = this.glassesFull[rowCount][i];
      if ((!this.isOneFullGlassBroken) && (currentGameState === STATE_PLAY)) {
        glass.update();
        if (glass.broken) {
          if (!this.isOneFullGlassBroken) {
            this.isOneFullGlassBroken = true;
            LevelManager.lifeLost();
            ret = rowCount;
          }
        } else {
          collision = BeerGlass.checkCustomerCollision(glass, rowCount);
        }
      }
      if (collision) {
        glassArrayCopy.splice(i, 1);
      } else {
        context.drawImage(this.spriteImage,
          glass.sprite, 0, this.spriteWidth, this.spriteHeight,
          glass.xPos, glass.yPos, this.spriteWidth, this.spriteHeight);
      }
    }

    if (collision) {
      this.glassesFull[rowCount] = glassArrayCopy.slice();
    }

    return ret;
  },

  drawEmptyMug(context, rowCount) {
    let glass;
    let ret = 0;
    let collision = false;
    const glassArrayCopy = this.glassesEmpty[rowCount].slice();

    for (let i = this.glassesEmpty[rowCount].length; i--;) {
      glass = this.glassesEmpty[rowCount][i];
      if ((!this.isOneEmptyGlassBroken) && (currentGameState === STATE_PLAY)) {
        glass.update();
        if (glass.broken) {
          if (!this.isOneEmptyGlassBroken) {
            this.isOneEmptyGlassBroken = true;
            LevelManager.lifeLost();
            ret = rowCount;
          }
        } else {
          collision = BeerGlass.checkPlayerCollision(glass, rowCount);
        }
      }

      if (collision) {
        glassArrayCopy.splice(i, 1);
      } else {
        context.drawImage(this.spriteImage,
          glass.sprite, 0, this.spriteWidth, this.spriteHeight,
          glass.xPos, glass.yPos, this.spriteWidth, this.spriteHeight);
      }
    }

    if (collision) {
      this.glassesEmpty[rowCount] = glassArrayCopy.slice();
    }

    return ret;
  }
};

function Glass(row, defaultXPos, defaultYPos, type) {
  return {
    sprite: BeerGlass.SPRITE_FULL_1,
    xPos: defaultXPos,
    yPos: defaultYPos,
    row,
    type,
    leftBound: LevelManager.rowLBound[row] - 4,
    rightBound: LevelManager.rowRBound[row] + 16,
    fpsCount: 0,
    fpsMax: FPS / 2,
    broken: false,

    update() {
      if (type === BeerGlass.FULL_MUG) {
        if (this.fpsCount++ > this.fpsMax) {
          this.sprite = (this.sprite === BeerGlass.SPRITE_FULL_1) ? BeerGlass.SPRITE_FULL_2 : BeerGlass.SPRITE_FULL_1;
          this.fpsCount = 0;
        }

        if (this.xPos > this.leftBound) {
          this.xPos -= BeerGlass.STEP;
        } else {
          this.broken = true;
          this.sprite = BeerGlass.SPRITE_BROKEN;
        }
      } else {
        this.sprite = BeerGlass.SPRITE_EMPTY_1;
        if (this.xPos < this.rightBound) {
          this.xPos += Customers.STEP;
        } else {
          this.broken = true;
          this.sprite = BeerGlass.SPRITE_FALLING;
          this.xPos += 16;
          this.yPos += BeerGlass.spriteHeight;
        }
      }
    }
  };
}

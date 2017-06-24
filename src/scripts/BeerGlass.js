import {getImageResource, BEER_GLASS, GRAB_MUG} from './ResourceManager';
import {STATE_PLAY, currentGameState} from './Main';
import {LevelManager} from './LevelManager';
import {playSound} from './SoundManager';
import {Customers} from './Customers';
import {Player} from './Player';

const spriteWidth = 32;
const spriteHeight = 32;
const glassesFull = [];
const glassesEmpty = [];

let isOneFullGlassBroken = false;
let isOneEmptyGlassBroken = false;
let spriteImage = null;

export function initBeerGlass() {
  spriteImage = getImageResource(BEER_GLASS);
}

export function resetBeerGlass() {
  for (let count = 1; count < 5; count++) {
    glassesFull[count] = [];
    glassesEmpty[count] = [];
  }
  isOneFullGlassBroken = false;
  isOneEmptyGlassBroken = false;
}

export function addBeerGlass(row, xPos, full) {
  const glass = new Glass(row, xPos, LevelManager.rowYPos[row] + 8, full);
  if (full) {
    glassesFull[row].push(glass);
  } else {
    glassesEmpty[row].push(glass);
  }
}

export function drawBeerGlass(context) {
  let ret = 0;
  ret += drawFullMug(context, 1);
  ret += drawEmptyMug(context, 1);
  ret += drawFullMug(context, 2);
  ret += drawEmptyMug(context, 2);
  ret += drawFullMug(context, 3);
  ret += drawEmptyMug(context, 3);
  ret += drawFullMug(context, 4);
  ret += drawEmptyMug(context, 4);
  return ret;
}

function checkCustomerCollision(glass, row) {
  const customerPos = Customers.getFirstCustomerPos(row) + 24;
  if (glass.xPos <= customerPos) {
    return Customers.beerCollisionDetected(row);
  }
  return false;
}

function checkPlayerCollision(glass, row) {
  if ((Player.currentRow === row) && (glass.xPos + spriteWidth >= Player.playerXPos)) {
    playSound(GRAB_MUG);
    LevelManager.addScore(LevelManager.SCORE_EMPTY_BEER);
    return true;
  }
  return false;
}

function drawFullMug(context, rowCount) {
  let glass;
  let ret = 0;
  let collision = false;
  const glassArrayCopy = glassesFull[rowCount].slice();
  for (let i = glassesFull[rowCount].length; i--;) {
    glass = glassesFull[rowCount][i];
    if ((!isOneFullGlassBroken) && (currentGameState === STATE_PLAY)) {
      glass.update();
      if (glass.broken) {
        if (!isOneFullGlassBroken) {
          isOneFullGlassBroken = true;
          LevelManager.lifeLost();
          ret = rowCount;
        }
      } else {
        collision = checkCustomerCollision(glass, rowCount);
      }
    }
    if (collision) {
      glassArrayCopy.splice(i, 1);
    } else {
      context.drawImage(spriteImage,
        glass.sprite, 0, spriteWidth, spriteHeight,
        glass.xPos, glass.yPos, spriteWidth, spriteHeight);
    }
  }

  if (collision) {
    glassesFull[rowCount] = glassArrayCopy.slice();
  }

  return ret;
}

function drawEmptyMug(context, rowCount) {
  let glass;
  let ret = 0;
  let collision = false;
  const glassArrayCopy = glassesEmpty[rowCount].slice();

  for (let i = glassesEmpty[rowCount].length; i--;) {
    glass = glassesEmpty[rowCount][i];
    if ((!isOneEmptyGlassBroken) && (currentGameState === STATE_PLAY)) {
      glass.update();
      if (glass.broken) {
        if (!isOneEmptyGlassBroken) {
          isOneEmptyGlassBroken = true;
          LevelManager.lifeLost();
          ret = rowCount;
        }
      } else {
        collision = checkPlayerCollision(glass, rowCount);
      }
    }

    if (collision) {
      glassArrayCopy.splice(i, 1);
    } else {
      context.drawImage(spriteImage,
        glass.sprite, 0, spriteWidth, spriteHeight,
        glass.xPos, glass.yPos, spriteWidth, spriteHeight);
    }
  }

  if (collision) {
    glassesEmpty[rowCount] = glassArrayCopy.slice();
  }

  return ret;
}

const SPRITE_FULL_1 = 0;
const SPRITE_FULL_2 = 32;
const SPRITE_EMPTY_1 = 64;
const SPRITE_FALLING = 96;
const SPRITE_BROKEN = 128;
const STEP = 4;

function Glass(row, defaultXPos, defaultYPos, full) {
  return {
    sprite: SPRITE_FULL_1,
    xPos: defaultXPos,
    yPos: defaultYPos,
    leftBound: LevelManager.rowLBound[row] - 4,
    rightBound: LevelManager.rowRBound[row] + 16,
    fpsCount: 0,
    fpsMax: 60 / 2,
    broken: false,

    update() {
      if (full) {
        if (this.fpsCount++ > this.fpsMax) {
          this.sprite = this.sprite === SPRITE_FULL_1 ? SPRITE_FULL_2 : SPRITE_FULL_1;
          this.fpsCount = 0;
        }

        if (this.xPos > this.leftBound) {
          this.xPos -= STEP;
        } else {
          this.broken = true;
          this.sprite = SPRITE_BROKEN;
        }
      } else {
        this.sprite = SPRITE_EMPTY_1;
        if (this.xPos < this.rightBound) {
          this.xPos += Customers.STEP;
        } else {
          this.broken = true;
          this.sprite = SPRITE_FALLING;
          this.xPos += 16;
          this.yPos += spriteHeight;
        }
      }
    }
  };
}

import {getImageResource, BEER_GLASS, GRAB_MUG} from './ResourceManager';
import {addScore, rowYPos, rowLBound, rowRBound, SCORE_EMPTY_BEER} from './LevelManager';
import {playSound} from './SoundManager';
import {beerCollisionDetected, CUSTOMER_STEP} from './Customers';
import {currentRow, playerXPos} from './Player';

let glasses;
let spriteImage;

export function initBeerGlasses() {
  spriteImage = getImageResource(BEER_GLASS);
}

export function resetBeerGlasses() {
  glasses = [];
}

export function addBeerGlass(row, xPos, full) {
  glasses.push(new Glass(row, xPos, full));
}

export function updateBeerGlasses() {
  glasses.forEach(glass => glass.update());
  glasses = glasses.filter(glass => !glass.checkCollision());
  return glasses.some(glass => glass.broken);
}

export function drawBeerGlasses(context) {
  glasses.forEach(glass => glass.draw(context));
}

const spriteWidth = 32;
const spriteHeight = 32;
const SPRITE_FULL_1 = 0;
const SPRITE_FULL_2 = 32;
const SPRITE_EMPTY_1 = 64;
const SPRITE_FALLING = 96;
const SPRITE_BROKEN = 128;
const FPS_MAX = 30;
const STEP = 4;

function checkCustomerCollision(glass, row) {
  return beerCollisionDetected(row, glass.xPos - 24);
}

function checkPlayerCollision(glass, row) {
  if (currentRow === row && glass.xPos + spriteWidth >= playerXPos) {
    playSound(GRAB_MUG);
    addScore(SCORE_EMPTY_BEER);
    return true;
  }
  return false;
}

function Glass(row, defaultXPos, full) {
  return {
    sprite: SPRITE_FULL_1,
    xPos: defaultXPos,
    yPos: rowYPos[row] + 8,
    leftBound: rowLBound[row] - STEP,
    rightBound: rowRBound[row] + (spriteWidth / 2),
    fpsCount: 0,
    broken: false,

    update() {
      if (full) {
        if (this.fpsCount++ > FPS_MAX) {
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
          this.xPos += CUSTOMER_STEP;
        } else {
          this.broken = true;
          this.sprite = SPRITE_FALLING;
          this.xPos += spriteWidth / 2;
          this.yPos += spriteHeight;
        }
      }
    },

    checkCollision() {
      return full ? checkCustomerCollision(this, row) : checkPlayerCollision(this, row);
    },

    draw(context) {
      context.drawImage(spriteImage,
        this.sprite, 0, spriteWidth, spriteHeight,
        this.xPos, this.yPos, spriteWidth, spriteHeight);
    }
  };
}

import {getImageResource, BEER_GLASS, GRAB_MUG} from './ResourceManager';
import {LevelManager} from './LevelManager';
import {playSound} from './SoundManager';
import {Customers} from './Customers';
import {Player} from './Player';

let glasses = new Array(5).fill().map(() => []);
let spriteImage = null;

export function initBeerGlasses() {
  spriteImage = getImageResource(BEER_GLASS);
}

export function resetBeerGlasses() {
  glasses = glasses.map(() => []);
}

export function addBeerGlass(row, xPos, full) {
  glasses[row].push(new Glass(row, xPos, LevelManager.rowYPos[row] + 8, full));
}

export function updateBeerGlasses() {
  glasses = glasses.map(row => {
    row.forEach(glass => glass.update());
    return row.filter(glass => !glass.checkCollision());
  });
  return glasses.some(row => row.some(glass => glass.broken));
}

export function drawBeerGlasses(context) {
  glasses.forEach(row => row.forEach(glass => glass.draw(context)));
}

const spriteWidth = 32;
const spriteHeight = 32;
const SPRITE_FULL_1 = 0;
const SPRITE_FULL_2 = 32;
const SPRITE_EMPTY_1 = 64;
const SPRITE_FALLING = 96;
const SPRITE_BROKEN = 128;
const STEP = 4;

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

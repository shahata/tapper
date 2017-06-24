import {getImageResource, TIP_APPEAR, COLLECT_TIP, OUT_DOOR, CUSTOMERS, BEER_GLASS} from './ResourceManager';
import {LevelManager} from './LevelManager';
import {playSound} from './SoundManager';
import {addBeerGlass} from './BeerGlass';

export const CUSTOMER_STEP = 1;
export const CUSTOMER_GREEN_HAT_COWBOY = 0;
export const CUSTOMER_WOMAN = 1;
export const CUSTOMER_BLACK_GUY = 2;
export const CUSTOMER_GRAY_HAT_COWBOY = 3;
export const MAX_CUSTOMER_TYPE = 4;
const HOLDING_BEER_1 = 4;
const HOLDING_BEER_2 = 7;
const DRINKING_BEER_1 = 5;
const DRINKING_BEER_2 = 8;
const BONUS_OFF = 5;
const CUSTOMER_Y_OFFSET = [0, 32, 64, 96];
const movingPatternArray = [null,
  [0, 1, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
  [0, 1, 0, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
  [0, 1, 0, 2, 3, 2, 3, 2, 3],
  [0, 1, 0, 1, 2, 3, 2, 3]
];
let customers = [];
let spriteImage = null;
let miscImage = null;
const spriteWidth = 32;
const spriteHeight = 32;
const bonus = {
  visible: false,
  timeout: 10 * 1000,
  timeoutReached: true,
  row: 1,
  xPos: 100
};

export function initCustomers() {
  spriteImage = getImageResource(CUSTOMERS);
  miscImage = getImageResource(BEER_GLASS);
}

export function resetCustomers() {
  customers = [];
  bonus.visible = false;
}

export function addCustomer(row, pos, type) {
  const customer = new OneCustomer(row, type);
  customer.xPos += (pos - 1) * spriteWidth;
  customers.push(customer);
}

function checkBonus(row, xPos) {
  if ((!bonus.visible) && (bonus.timeoutReached)) {
    if (xPos < (LevelManager.rowLBound[row] + ((LevelManager.rowRBound[row] - LevelManager.rowLBound[row]) / 3))) {
      const randomRow = Math.floor(Math.random() * 6);
      if (randomRow === row) {
        bonus.visible = true;
        bonus.row = row;
        bonus.xPos = xPos;
        bonus.yPos = LevelManager.rowYPos[row] + 16;
        bonus.timeoutReached = false;
        setTimeout(() => {
          bonus.visible = false;
          bonus.timeoutReached = true;
        }, bonus.timeout);
        playSound(TIP_APPEAR);
      }
    }
  }
}

export function checkBonusCollision(row, xPos) {
  if ((bonus.visible) && (bonus.row === row) && (xPos <= bonus.xPos + spriteWidth)) {
    bonus.visible = false;
    LevelManager.addScore(LevelManager.SCORE_BONUS);
    playSound(COLLECT_TIP);
  }
}

function drawBonus(context) {
  if (bonus.visible) {
    context.drawImage(miscImage,
      BONUS_OFF * 32, 0, spriteWidth, spriteHeight,
      bonus.xPos, bonus.yPos, spriteWidth, spriteHeight);
  }
}

export function beerCollisionDetected(row, beerPos) {
  const firstCustomer = customers
    .filter(customer => customer.state === customer.STATE_WAIT && customer.row === row)
    .reduce((prev, customer) => prev.xPos > customer.xPos ? prev : customer, {xPos: undefined});
  if (beerPos <= firstCustomer.xPos) {
    firstCustomer.catchBeer();
    return true;
  }
}

export function isAnyCustomer() {
  return customers.length;
}

export function updateCustomers() {
  customers.forEach(customer => {
    customer.update();
    if (customer.isOut) {
      playSound(OUT_DOOR);
      LevelManager.addScore(LevelManager.SCORE_CUSTOMER);
    }
  });
  customers = customers.filter(customer => !customer.isOut);
  return customers.some(customer => customer.endOfRow);
}


export function drawCustomers(context) {
  customers.forEach(customer => customer.draw(context));
  drawBonus(context);
}

function OneCustomer(row, type) {
  return {
    STATE_WAIT: 0,
    STATE_CATCH: 1,
    STATE_DRINK: 2,
    STEP: CUSTOMER_STEP,
    state: 0,
    type,
    sprite: 0,
    sprite2: 0,
    movingPattern: movingPatternArray[row],
    animationCounter: -1,
    xPos: LevelManager.rowLBound[row],
    yPos: LevelManager.rowYPos[row],
    yPos2: LevelManager.rowYPos[row],
    row,
    leftBound: LevelManager.rowLBound[row],
    rightBound: LevelManager.rowRBound[row],
    fpsCount: 0,
    fpsMax: 60 / 8,
    newXPos: 0,
    endOfRow: false,
    isOut: false,

    update() {
      switch (this.state) {
        case this.STATE_WAIT:
          if (this.fpsCount++ > this.fpsMax) {
            this.animationCounter++;
            this.sprite = this.movingPattern[this.animationCounter] * 32;
            if (this.animationCounter === this.movingPattern.length - 1) {
              this.animationCounter = -1;
            }
            this.fpsCount = 0;
          }
          if (this.movingPattern[this.animationCounter] < 2) {
            if (this.xPos < this.rightBound) {
              this.xPos += this.STEP;
            } else {
              this.endOfRow = true;
            }
          }
          break;
        case this.STATE_CATCH:
          this.xPos -= (this.STEP * 2);
          if (this.xPos < this.leftBound) {
            this.isOut = true;
          } else if (this.xPos < this.newXPos) {
            this.fpsCount = 0;
            this.animationCounter = 0;
            this.state = this.STATE_DRINK;
            this.sprite = DRINKING_BEER_1 * 32;
            this.sprite2 = DRINKING_BEER_2 * 32;
            this.yPos2 = this.yPos;
          }
          break;
        case this.STATE_DRINK:
          if (this.fpsCount++ > this.fpsMax) {
            this.animationCounter++;
            this.fpsCount = 0;
          }
          if (this.animationCounter === 3) {
            this.state = this.STATE_WAIT;
            this.animationCounter = -1;
            this.fpsCount = 0;
            this.sprite = this.movingPattern[0] * 32;
            addBeerGlass(this.row, this.xPos + spriteWidth, false);
            checkBonus(this.row, this.xPos);
          }
          break;
        default:
          break;
      }
    },

    catchBeer() {
      this.newXPos = this.xPos - (((this.rightBound - this.leftBound) / 5) * 2);
      this.state = this.STATE_CATCH;
      this.sprite = HOLDING_BEER_1 * 32;
      this.sprite2 = HOLDING_BEER_2 * 32;
      this.yPos2 = this.yPos + 8;
    },

    draw(context) {
      context.drawImage(spriteImage,
        this.sprite, CUSTOMER_Y_OFFSET[this.type], spriteWidth, spriteHeight,
        this.xPos, this.yPos, spriteWidth, spriteHeight);
      if (this.state !== this.STATE_WAIT) {
        context.drawImage(spriteImage,
          this.sprite2, CUSTOMER_Y_OFFSET[this.type], spriteWidth, spriteHeight,
          this.xPos + 32, this.yPos2, spriteWidth, spriteHeight);
      }
    }
  };
}

import {getImageResource, TIP_APPEAR, COLLECT_TIP, OUT_DOOR, CUSTOMERS, BEER_GLASS} from './ResourceManager';
import {STATE_PLAY, currentGameState} from './Main';
import {LevelManager} from './LevelManager';
import {playSound} from './SoundManager';
import {addBeerGlass} from './BeerGlass';

export const CUSTOMER_STEP = 1;
export const CUSTOMER_GREEN_HAT_COWBOY = 0;
export const CUSTOMER_WOMAN = 1;
export const CUSTOMER_BLACK_GUY = 2;
export const CUSTOMER_GRAY_HAT_COWBOY = 3;
export const MAX_CUSTOMER_TYPE = 4;
// const REGULAR_1 = 0;
// const REGULAR_2 = 1;
// const ANGRY_1 = 2;
// const ANGRY_2 = 3;
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
let customerXPos = [5];
let maxPos = [5];
const customersList = [];
let spriteImage = null;
let miscImage = null;
let oneReachEndOfRow = false;
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
  for (let count = 1; count < 5; count++) {
    customersList[count] = [];
    customerXPos[count] = -1;
  }
  oneReachEndOfRow = false;
  bonus.visible = false;
}

export function addCustomer(row, pos, type) {
  const customer = new OneCustomer(row, LevelManager.rowLBound[row], movingPatternArray[row], type);
  customer.xPos += (pos - 1) * spriteWidth;
  customersList[row].push(customer);
}

function checkBonus(row, customerXPos) {
  if ((!bonus.visible) && (bonus.timeoutReached)) {
    if (customerXPos < (LevelManager.rowLBound[row] + ((LevelManager.rowRBound[row] - LevelManager.rowLBound[row]) / 3))) {
      const randomRow = Math.floor(Math.random() * 6);
      if (randomRow === row) {
        bonus.visible = true;
        bonus.row = row;
        bonus.xPos = customerXPos;
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

export function getFirstCustomerPos(row) {
  if ((customerXPos[row] !== -1) && (customersList[row][customerXPos[row]])) {
    return customersList[row][customerXPos[row]].xPos;
  }
}

export function beerCollisionDetected(row) {
  if (customersList[row][customerXPos[row]].state === 0) {
    customersList[row][customerXPos[row]].catchBeer();
    return true;
  } else {
    return false;
  }
}

export function isAnyCustomer() {
  return (customersList[1].length + customersList[2].length + customersList[3].length + customersList[4].length);
}

export function drawCustomers(context) {
  let customer;
  let ret = 0;
  let customerArrayCopy = null;
  let copyFlag = false;

  customerXPos = [-1, -1, -1, -1, -1];
  maxPos = [0, 0, 0, 0, 0];

  for (let rowCount = 1; rowCount < 5; rowCount++) {
    customerArrayCopy = customersList[rowCount].slice();

    for (let i = customersList[rowCount].length; i--;) {
      customer = customersList[rowCount][i];

      if ((!oneReachEndOfRow) && (currentGameState === STATE_PLAY)) {
        customer.update();

        if (customer.isOut) {
          customerArrayCopy.splice(i, 1);
          copyFlag = true;
          playSound(OUT_DOOR);
          LevelManager.addScore(LevelManager.SCORE_CUSTOMER);
          continue;
        } else if ((customer.xPos > maxPos[rowCount]) && (customer.state === customer.STATE_WAIT)) {
          customerXPos[rowCount] = i;
          maxPos[rowCount] = customer.xPos;
        }
      }
      if ((customer.EndOfRow) && (oneReachEndOfRow === false)) {
        oneReachEndOfRow = true;
        ret = rowCount;
      }
      context.drawImage(spriteImage,
        customer.sprite, CUSTOMER_Y_OFFSET[customer.type], spriteWidth, spriteHeight,
        customer.xPos, customer.yPos, spriteWidth, spriteHeight);

      if (customer.state !== customer.STATE_WAIT) {
        context.drawImage(spriteImage,
          customer.sprite2, CUSTOMER_Y_OFFSET[customer.type], spriteWidth, spriteHeight,
          customer.xPos + 32, customer.yPos2, spriteWidth, spriteHeight);
      }
    }

    if (copyFlag) {
      customersList[rowCount] = customerArrayCopy.slice();
    }
  }
  drawBonus(context);

  return ret;
}

function OneCustomer(row, defaultXPos, movingPattern, type) {
  return {
    STATE_WAIT: 0,
    STATE_CATCH: 1,
    STATE_DRINK: 2,
    STEP: CUSTOMER_STEP,
    state: 0,
    type,
    sprite: 0,
    sprite2: 0,
    movingPattern,
    animationCounter: -1,
    xPos: defaultXPos,
    yPos: LevelManager.rowYPos[row],
    yPos2: LevelManager.rowYPos[row],
    row,
    leftBound: LevelManager.rowLBound[row],
    rightBound: LevelManager.rowRBound[row],
    fpsCount: 0,
    fpsMax: 60 / 8,
    newXPos: 0,
    EndOfRow: false,
    isOut: false,

    update() {
      switch (this.state) {
        case this.STATE_WAIT:
          if (this.fpsCount++ > this.fpsMax) {
            this.animationCounter++;
            this.sprite = this.movingPattern[this.animationCounter] * 32;
            if (this.animationCounter === this.movingPattern.length) {
              this.animationCounter = -1;
            }
            this.fpsCount = 0;
          }
          if (this.movingPattern[this.animationCounter] < 2) {
            if (this.xPos < this.rightBound) {
              this.xPos += this.STEP;
            } else {
              this.EndOfRow = true;
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
    }
  };
}

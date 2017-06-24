import {getImageResource, TIP_APPEAR, COLLECT_TIP, OUT_DOOR, CUSTOMERS, BEER_GLASS} from './ResourceManager';
import {STATE_PLAY, currentGameState} from './Main';
import {LevelManager} from './LevelManager';
import {playSound} from './SoundManager';
import {addBeerGlass} from './BeerGlass';

export const Customers = {
  STEP: 1,
  CUSTOMER_GREEN_HAT_COWBOY: 0,
  CUSTOMER_WOMAN: 1,
  CUSTOMER_BLACK_GUY: 2,
  CUSTOMER_GRAY_HAT_COWBOY: 3,
  MAX_CUSTOMER_TYPE: 4,
  REGULAR_1: 0,
  REGULAR_2: 1,
  ANGRY_1: 2,
  ANGRY_2: 3,
  HOLDING_BEER_1: 4,
  HOLDING_BEER_2: 7,
  DRINKING_BEER_1: 5,
  DRINKING_BEER_2: 8,
  BONUS_OFF: 5,
  CUSTOMER_Y_OFFSET: [0, 32, 64, 96],
  movingPatternArray: [null,
    [0, 1, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
    [0, 1, 0, 2, 3, 2, 3, 2, 3, 2, 3, 2, 3],
    [0, 1, 0, 2, 3, 2, 3, 2, 3],
    [0, 1, 0, 1, 2, 3, 2, 3]
  ],
  customerXPos: [5],
  maxPos: [5],
  customersList: [],
  endOfTheRowCustomer: null,
  spriteImage: null,
  miscImage: null,
  spriteWidth: 32,
  spriteHeight: 32,
  bonus: {
    visible: false,
    timeout: 10 * 1000,
    timeoutReached: true,
    row: 1,
    xPos: 100
  },

  init() {
    this.spriteImage = getImageResource(CUSTOMERS);
    this.miscImage = getImageResource(BEER_GLASS);
  },

  reset() {
    for (let count = 1; count < 5; count++) {
      this.customersList[count] = [];
      this.customerXPos[count] = -1;
    }
    this.oneReachEndOfRow = false;
    this.endOfTheRowCustomer = false;
    this.bonus.visible = false;
  },

  add(row, pos, type) {
    const customer = new OneCustomer(row, LevelManager.rowLBound[row], this.movingPatternArray[row], type);
    customer.xPos += (pos - 1) * this.spriteWidth;
    this.customersList[row].push(customer);
  },

  checkBonus(row, customerXPos) {
    if ((!this.bonus.visible) && (this.bonus.timeoutReached)) {
      if (customerXPos < (LevelManager.rowLBound[row] + ((LevelManager.rowRBound[row] - LevelManager.rowLBound[row]) / 3))) {
        const randomRow = Math.floor(Math.random() * 6);
        if (randomRow === row) {
          this.bonus.visible = true;
          this.bonus.row = row;
          this.bonus.xPos = customerXPos;
          this.bonus.yPos = LevelManager.rowYPos[row] + 16;
          this.bonus.timeoutReached = false;
          setTimeout(() => {
            Customers.bonus.visible = false;
            Customers.bonus.timeoutReached = true;
          }, this.bonus.timeout);
          playSound(TIP_APPEAR);
        }
      }
    }
  },

  checkBonusCollision(row, xPos) {
    if ((this.bonus.visible) && (this.bonus.row === row) && (xPos <= this.bonus.xPos + this.spriteWidth)) {
      this.bonus.visible = false;
      LevelManager.addScore(LevelManager.SCORE_BONUS);
      playSound(COLLECT_TIP);
    }
  },

  drawBonus(context) {
    if (this.bonus.visible) {
      context.drawImage(this.miscImage,
        this.BONUS_OFF * 32, 0, this.spriteWidth, this.spriteHeight,
        this.bonus.xPos, this.bonus.yPos, this.spriteWidth, this.spriteHeight);
    }
  },

  getFirstCustomerPos(row) {
    if ((this.customerXPos[row] !== -1) && (this.customersList[row][this.customerXPos[row]])) {
      return this.customersList[row][this.customerXPos[row]].xPos;
    }
  },

  beerCollisionDetected(row) {
    if (this.customersList[row][this.customerXPos[row]].state === 0) {
      this.customersList[row][this.customerXPos[row]].catchBeer();
      return true;
    } else {
      return false;
    }
  },

  isAnyCustomer() {
    return (this.customersList[1].length + this.customersList[2].length + this.customersList[3].length + this.customersList[4].length);
  },

  draw(context) {
    let customer;
    let ret = 0;
    let customerArrayCopy = null;
    let copyFlag = false;

    this.customerXPos = [-1, -1, -1, -1, -1];
    this.maxPos = [0, 0, 0, 0, 0];

    for (let rowCount = 1; rowCount < 5; rowCount++) {
      customerArrayCopy = this.customersList[rowCount].slice();

      for (let i = this.customersList[rowCount].length; i--;) {
        customer = this.customersList[rowCount][i];

        if ((!this.oneReachEndOfRow) && (currentGameState === STATE_PLAY)) {
          customer.update();

          if (customer.isOut) {
            customerArrayCopy.splice(i, 1);
            copyFlag = true;
            playSound(OUT_DOOR);
            LevelManager.addScore(LevelManager.SCORE_CUSTOMER);
            continue;
          } else if ((customer.xPos > this.maxPos[rowCount]) && (customer.state === customer.STATE_WAIT)) {
            this.customerXPos[rowCount] = i;
            this.maxPos[rowCount] = customer.xPos;
          }
        }
        if ((customer.EndOfRow) && (this.oneReachEndOfRow === false)) {
          this.oneReachEndOfRow = true;
          this.endOfTheRowCustomer = customer;
          LevelManager.lifeLost();
          ret = rowCount;
        }
        context.drawImage(this.spriteImage,
          customer.sprite, this.CUSTOMER_Y_OFFSET[customer.type], this.spriteWidth, this.spriteHeight,
          customer.xPos, customer.yPos, this.spriteWidth, this.spriteHeight);

        if (customer.state !== customer.STATE_WAIT) {
          context.drawImage(this.spriteImage,
            customer.sprite2, this.CUSTOMER_Y_OFFSET[customer.type], this.spriteWidth, this.spriteHeight,
            customer.xPos + 32, customer.yPos2, this.spriteWidth, this.spriteHeight);
        }
      }

      if (copyFlag) {
        this.customersList[rowCount] = customerArrayCopy.slice();
      }
    }
    this.drawBonus(context);

    return ret;
  }
};

function OneCustomer(row, defaultXPos, movingPattern, type) {
  return {
    STATE_WAIT: 0,
    STATE_CATCH: 1,
    STATE_DRINK: 2,
    STEP: Customers.STEP,
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
            this.sprite = Customers.DRINKING_BEER_1 * 32;
            this.sprite2 = Customers.DRINKING_BEER_2 * 32;
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
            addBeerGlass(this.row, this.xPos + Customers.spriteWidth, false);
            Customers.checkBonus(this.row, this.xPos);
          }
          break;
        default:
          break;
      }
    },

    catchBeer() {
      this.newXPos = this.xPos - (((this.rightBound - this.leftBound) / 5) * 2);
      this.state = this.STATE_CATCH;
      this.sprite = Customers.HOLDING_BEER_1 * 32;
      this.sprite2 = Customers.HOLDING_BEER_2 * 32;
      this.yPos2 = this.yPos + 8;
    }
  };
}

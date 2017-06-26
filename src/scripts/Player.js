import {getImageResource, BARMAN_ZIP_UP, BARMAN_ZIP_DOWN, MUG_FILL1, MUG_FILL2, FULL_MUG, THROW_MUG, BARMAN} from './ResourceManager';
import {playSound} from './SoundManager';
import {addBeerGlass} from './BeerGlass';
import {checkBonusCollision} from './Customers';

export const LEFT = 0;
export const RIGHT = 1;
export const UP = 2;
export const DOWN = 3;
export const FIRE = 4;
export const NONE = 6;
const STEP = 16;
const STAND_L1 = 0;
const STAND_L2 = 1;
const STAND_R1 = 8;
const STAND_R2 = 9;
const RUN_UP_L1 = 12;
const RUN_UP_R1 = 13;
const RUN_DOWN_1 = 14;
const RUN_DOWN_4 = 20;
const RUN_DOWN_RIGHT_OFF = 8;
const TAPPER_1 = 30;
const TAPPER_2 = 31;
const TAPPER_3 = 32;
const SERVE_UP_1_1 = 33;
const SERVE_UP_1_2 = 34;
const SERVE_DOWN_1 = 35;
const SERVE_UP_2_1 = 36;
const SERVE_UP_2_2 = 37;
const SERVE_DOWN_2 = 38;
const BEER_FILL = [null, 39, 40, 41, 42];
const SERVING_MAX = 4;
const LOST_1 = 43;
const GO1 = 4;
const GO4 = 7;
const spriteWidth = 32;
const spriteHeight = 32;
let spriteImage = null;
let goState = 0;
let legState = 0;
let tapperState = 0;
let servingCounter = 0;
const rowXPos = [null, 336, 368, 400, 432];
const rowYPos = [null, 96, 192, 288, 384];
const rowLBound = [null, 128, 96, 64, 32];
const rowRBound = [null, 336, 368, 400, 432];
let playerAction = null;
let gamePlay = false;
export let currentRow = 2;
let lastRow = 0;
let lastPlayerXPos = null;
let playerGoLeft = true;
let playerRunning = false;
let tapperServing = false;
export let playerXPos = 336;
let playerYPos = 192;
let fpsCount = 0;
const legAnimationTiming = 20;

export function initPlayer() {
  spriteImage = getImageResource(BARMAN);
}

export function resetPlayer() {
  currentRow = 2;
  lastRow = 0;
  playerXPos = 336;
  playerYPos = 192;
  playerAction = 0;
  goState = GO1;
  legState = RUN_DOWN_1 - 2;
  tapperState = TAPPER_1;
  lastRow = 0;
  playerGoLeft = true;
  playerRunning = false;
  gamePlay = true;
  tapperServing = false;
}

export function playerLost() {
  playerRunning = false;
  tapperServing = false;
  gamePlay = false;
  playerAction = LOST_1;
}

function setAnimation() {
  if ((fpsCount++ > legAnimationTiming) && (gamePlay)) {
    if (playerGoLeft) {
      playerAction = (playerAction === STAND_L1) ? STAND_L2 : STAND_L1;
    } else {
      playerAction = (playerAction === STAND_R1) ? STAND_R2 : STAND_R1;
    }
    fpsCount = 0;
  }
}

function drawTapper(context) {
  for (let rowNum = 1; rowNum < 5; rowNum++) {
    if ((currentRow !== rowNum) || (!tapperServing) || (goState !== 0)) {
      context.drawImage(spriteImage,
        TAPPER_1 * 32, 0, spriteWidth, spriteHeight,
        rowRBound[rowNum] + 12, rowYPos[rowNum] - 24, spriteWidth, spriteHeight);
    } else {
      context.drawImage(spriteImage,
        tapperState * 32, 0, spriteWidth, spriteHeight,
        rowRBound[rowNum] + 12, rowYPos[rowNum] - 30, spriteWidth, spriteHeight);
    }
  }
}

function drawServing(context) {
  for (let i = 1, count = servingCounter + 1; i < count; i++) {
    context.drawImage(spriteImage,
      BEER_FILL[i] * 32, 0, spriteWidth, spriteHeight,
      playerXPos + 12, playerYPos + 2, spriteWidth, spriteHeight);
  }
  if (tapperState === TAPPER_2) {
    context.drawImage(spriteImage,
      SERVE_UP_1_1 * 32, 0, spriteWidth, spriteHeight,
      playerXPos - 20, playerYPos + 2, spriteWidth, spriteHeight);
    context.drawImage(spriteImage,
      SERVE_UP_1_2 * 32, 0, spriteWidth, spriteHeight,
      playerXPos + 12, playerYPos + 2, spriteWidth, spriteHeight);
    context.drawImage(spriteImage,
      SERVE_DOWN_1 * 32, 0, spriteWidth, spriteHeight,
      playerXPos - 20, playerYPos + spriteHeight + 2, spriteWidth, spriteHeight);
  } else {
    context.drawImage(spriteImage,
      SERVE_UP_2_1 * 32, 0, spriteWidth, spriteHeight,
      playerXPos - 20, playerYPos + 2, spriteWidth, spriteHeight);
    context.drawImage(spriteImage,
      SERVE_UP_2_2 * 32, 0, spriteWidth, spriteHeight,
      playerXPos + 12, playerYPos + 2, spriteWidth, spriteHeight);
    context.drawImage(spriteImage,
      SERVE_DOWN_2 * 32, 0, spriteWidth, spriteHeight,
      playerXPos - 20, playerYPos + spriteHeight + 2, spriteWidth, spriteHeight);
  }
}

export function drawPlayer(context) {
  drawTapper(context);
  if (lastRow !== 0) {
    context.drawImage(spriteImage,
      goState * 32, 0, spriteWidth, spriteHeight,
      lastPlayerXPos, rowYPos[lastRow], spriteWidth, spriteHeight);
    goState += 1;

    if (goState > GO4) {
      goState = 0;
      lastRow = 0;
      return true;
    }
    return false;
  }

  if (tapperServing) {
    drawServing(context);
    return true;
  }

  context.drawImage(spriteImage,
    playerAction * 32, 0, spriteWidth, spriteHeight,
    playerXPos, playerYPos, spriteWidth, spriteHeight);

  if (!playerRunning) {
    setAnimation();
    context.drawImage(spriteImage,
      (2 + playerAction) * 32, 0, spriteWidth, spriteHeight,
      playerXPos, playerYPos + spriteHeight, spriteWidth, spriteHeight);
  } else if (playerGoLeft) {
    context.drawImage(spriteImage,
      legState * 32, 0, spriteWidth, spriteHeight,
      playerXPos, playerYPos + spriteHeight, spriteWidth, spriteHeight);
    context.drawImage(spriteImage,
      (legState + 1) * 32, 0, spriteWidth, spriteHeight,
      playerXPos + spriteHeight, playerYPos + spriteHeight, spriteWidth, spriteHeight);
  } else {
    context.drawImage(spriteImage,
      (legState + RUN_DOWN_RIGHT_OFF) * 32, 0, spriteWidth, spriteHeight,
      playerXPos, playerYPos + spriteHeight, spriteWidth, spriteHeight);
    context.drawImage(spriteImage,
      (legState + 1 + RUN_DOWN_RIGHT_OFF) * 32, 0, spriteWidth, spriteHeight,
      playerXPos - spriteHeight, playerYPos + spriteHeight, spriteWidth, spriteHeight);
  }
  return true;
}

export function movePlayer(direction) {
  playerRunning = false;
  switch (direction) {
    case UP:
      tapperServing = false;
      lastRow = currentRow;
      currentRow -= 1;
      if (currentRow === 0) {
        currentRow = 4;
      }
      goState = GO1;
      lastPlayerXPos = playerXPos;
      playerXPos = rowXPos[currentRow];
      playerYPos = rowYPos[currentRow];
      playSound(BARMAN_ZIP_UP);
      break;
    case DOWN:
      tapperServing = false;
      lastRow = currentRow;
      currentRow += 1;
      if (currentRow === 5) {
        currentRow = 1;
      }
      goState = GO1;
      lastPlayerXPos = playerXPos;
      playerXPos = rowXPos[currentRow];
      playerYPos = rowYPos[currentRow];
      playSound(BARMAN_ZIP_DOWN);
      break;
    case LEFT:
      tapperServing = false;
      if ((playerGoLeft) && (playerXPos > (rowLBound[currentRow]))) {
        playerXPos -= STEP;
        playerRunning = true;
        playerAction = RUN_UP_L1;
        legState += 2;
        if (legState > RUN_DOWN_4) {
          legState = RUN_DOWN_1;
        }
        checkBonusCollision(currentRow, playerXPos);
      }
      playerGoLeft = true;
      break;
    case RIGHT:
      tapperServing = false;
      if ((!playerGoLeft) && (playerXPos < (rowRBound[currentRow]))) {
        playerXPos += STEP;
        playerRunning = true;
        playerAction = RUN_UP_R1;
        legState += 2;
        if (legState > RUN_DOWN_4) {
          legState = RUN_DOWN_1;
        }
      }
      playerGoLeft = false;
      break;
    case FIRE:
      if (playerXPos !== rowRBound[currentRow]) {
        lastRow = currentRow;
        goState = GO1;
        lastPlayerXPos = playerXPos;
        playerXPos = rowXPos[currentRow];
      }
      if (tapperServing === false) {
        servingCounter = 0;
      }
      tapperServing = true;
      tapperState = TAPPER_3;
      if (servingCounter < SERVING_MAX) {
        servingCounter += 1;
        switch (servingCounter) {
          case 1 :
            playSound(MUG_FILL1);
            break;
          case 2 :
          case 3 :
            playSound(MUG_FILL2);
            break;
          case SERVING_MAX :
            playSound(FULL_MUG);
            break;
          default:
            break;
        }
      }
      break;
    case NONE:
      if (tapperServing) {
        tapperState = TAPPER_2;
        if (servingCounter === SERVING_MAX) {
          servingCounter = 0;
          addBeerGlass(currentRow, playerXPos - spriteWidth, true);
          tapperServing = false;
          playerGoLeft = false;
          playerAction = STAND_R1;
          playSound(THROW_MUG);
        }
      } else {
        if (playerGoLeft) {
          playerAction = STAND_L1;
        } else {
          playerAction = STAND_R1;
        }
        legState = RUN_DOWN_1 - 2;
      }
      break;
    default:
      break;
  }
}

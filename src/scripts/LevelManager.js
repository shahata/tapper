import {getImageResource, POP_OUT, GAME_TITLE, PREGAME, LEVEL_1, FONT, MISC} from './ResourceManager';
import {STATE_PLAY, currentGameState} from './Main';
import {playSound} from './SoundManager';
import {addCustomer, isAnyCustomer, CUSTOMER_GREEN_HAT_COWBOY, CUSTOMER_WOMAN, CUSTOMER_BLACK_GUY, CUSTOMER_GRAY_HAT_COWBOY, MAX_CUSTOMER_TYPE} from './Customers';

export const rowLBound = [null, 120, 88, 56, 24];
export const rowRBound = [null, 304, 334, 368, 400];
export const rowYPos = [null, 80, 176, 272, 368];
export const SCORE_BONUS = 1500;
export const SCORE_EMPTY_BEER = 100;
export const SCORE_CUSTOMER = 50;

let life = 0;
let score = 0;
let difficulty = 1;
let wave = 1;
let lastRow = -1;
let fontImage = null;
let miscImage = null;
let levelImage = null;
let gameTitleImage = null;
let readyToPlayImage = null;

export function initLevelManager() {
  gameTitleImage = getImageResource(GAME_TITLE);
  readyToPlayImage = getImageResource(PREGAME);
  levelImage = getImageResource(LEVEL_1);
  fontImage = getImageResource(FONT);
  miscImage = getImageResource(MISC);
}

export function newGame() {
  score = 0;
  life = 3;
  difficulty = 1;
  wave = 1;
  lastRow = -1;
}

function addCustomers() {
  if (currentGameState === STATE_PLAY) {
    if (isAnyCustomer() < 2) {
      if (wave++ === difficulty * 2) {
        difficulty++;
      }

      for (let i = 1; i <= difficulty; i++) {
        addCustomer(1, i, CUSTOMER_GREEN_HAT_COWBOY);
        addCustomer(2, i, CUSTOMER_WOMAN);
        addCustomer(3, i, CUSTOMER_BLACK_GUY);
        addCustomer(4, i, CUSTOMER_GRAY_HAT_COWBOY);
        playSound(POP_OUT);
      }
    } else {
      const randomRow = Math.floor(Math.random() * 5);
      if (randomRow !== 0 && randomRow !== lastRow) {
        const randomCustomerType = Math.floor(Math.random() * MAX_CUSTOMER_TYPE);
        addCustomer(randomRow, 1, randomCustomerType);
        playSound(POP_OUT);
        lastRow = randomRow;
      }
    }
    setTimeout(() => addCustomers(), 3000);
  }
}

export function addScore(points) {
  score += points;
}

export function lifeLost() {
  life--;
}

export function isAlive() {
  return life > 0;
}

function displayNumber(context, number, xPos) {
  const text = `${number}`;
  for (let i = text.length; i--;) {
    const offset = text.charAt(i) * 16;
    context.drawImage(fontImage, offset, 0, 16, 16, xPos, 8, 16, 16);
    xPos -= 16;
  }
}

function displayLife(context) {
  let xPos = 100;
  if (life > 0) {
    for (let i = life; i--;) {
      context.drawImage(miscImage, 0, 0, 16, 16, xPos, 24, 16, 16);
      xPos -= 16;
    }
  }
}

export function displayGameTitle(context) {
  context.fillStyle = 'rgb(0,0,0)';
  context.fillRect(0, 0, context.canvas.width, context.canvas.height);
  context.fill();
  context.drawImage(gameTitleImage, (context.canvas.width - 416) / 2, 120);
  context.fillStyle = 'rgb(255,255,255)';
  context.font = 'bold 14px Courier';
  context.textBaseline = 'top';
  context.fillText('Based on the Original Tapper Game', 122, 290);
  context.fillText('(c) 1983 Bally Midway MFG', 154, 310);
  context.fillText('Press [ENTER] to play', 172, 400);
}

export function displayReadyToPlay(context) {
  context.drawImage(readyToPlayImage, 0, 0);
}

export function displayGameOver(context) {
  context.fillStyle = 'rgb(0,0,0)';
  context.fillRect((context.canvas.width - 180) / 2, (context.canvas.height - 32) / 2, 180, 32);
  context.fill();
  context.fillStyle = 'rgb(255,255,255)';
  context.font = 'bold 14px Courier';
  context.textBaseline = 'top';
  context.fillText('GAME OVER !', ((context.canvas.width - 180) / 2) + 48, ((context.canvas.height - 32) / 2) + 8);
}

export function resetLevelManager() {
  for (let i = 1; i <= difficulty; i++) {
    addCustomer(1, i, CUSTOMER_GREEN_HAT_COWBOY);
    addCustomer(2, i, CUSTOMER_WOMAN);
    addCustomer(3, i, CUSTOMER_BLACK_GUY);
    addCustomer(4, i, CUSTOMER_GRAY_HAT_COWBOY);
  }
  lastRow = -1;
  setTimeout(() => addCustomers(), 3000);
}

export function drawGameHUD(context) {
  displayNumber(context, score, 100);
  displayNumber(context, difficulty, 376);
  displayLife(context);
}

export function drawLevelBackground(context) {
  context.drawImage(levelImage, 0, 0);
}

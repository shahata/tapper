import {loadAllResources, displayLoadingScreen, GET_READY_TO_SERVE, OH_SUSANNA, YOU_LOSE, LAUGHING} from './ResourceManager';
import {initFrameBuffer, drawFrameBuffer} from './System';
import {playSound, stopSound} from './SoundManager';
import {LevelManager} from './LevelManager';
import {BeerGlass} from './BeerGlass';
import {Customers} from './Customers';
import {Player} from './Player';

export const STATE_PLAY = 0;
const STATE_LIFE_LOST = 1;
const STATE_MENU = 2;
const STATE_GAME_OVER = 3;
const STATE_READY = 4;
const STATE_LOADING = 5;
// const STATE_PAUSE = 6;
export const FPS = 60;
export let currentGameState;

let keyPressAllowed = true;
let frameBuffer = null;

export function initGame() {
  frameBuffer = initFrameBuffer('tapperJS', 512, 480, false, 1.0);
  currentGameState = STATE_LOADING;
  setInterval(() => onUpdateFrame(), 1000 / FPS);
  loadAllResources().then(() => loaded());
}

function loaded() {
  LevelManager.init();
  Player.init();
  BeerGlass.init();
  Customers.init();
  document.onkeydown = e => onKeyPress(e);
  document.onkeyup = e => onKeyRelease(e);
  currentGameState = STATE_MENU;
}

function reset() {
  currentGameState = STATE_READY;
  Player.reset();
  BeerGlass.reset();
  Customers.reset();
  LevelManager.reset();
  playSound(GET_READY_TO_SERVE);
  setTimeout(() => {
    currentGameState = STATE_PLAY;
    playSound(OH_SUSANNA, true);
  }, 2.5 * 1000);
}

function lost() {
  Player.lost();
  BeerGlass.stop();
  Customers.stop();
  stopSound(OH_SUSANNA);
  if (LevelManager.life <= 0) {
    currentGameState = STATE_GAME_OVER;
    playSound(YOU_LOSE);
  } else {
    currentGameState = STATE_LIFE_LOST;
    playSound(LAUGHING);
    setTimeout(() => reset(), 3 * 1000);
  }
}

function onUpdateFrame() {
  switch (currentGameState) {
    case STATE_LOADING:
      displayLoadingScreen(frameBuffer);
      break;
    case STATE_MENU:
      LevelManager.displayGameTitle(frameBuffer);
      break;
    case STATE_READY:
      LevelManager.displayReadyToPlay(frameBuffer);
      break;
    default:
      LevelManager.drawLevelBackground(frameBuffer);
      if (Customers.draw(frameBuffer) !== 0) {
        lost();
      }
      if (BeerGlass.draw(frameBuffer) !== 0) {
        lost();
      }
      keyPressAllowed = Player.draw(frameBuffer);
      LevelManager.drawGameHUD(frameBuffer);
      if (currentGameState === STATE_GAME_OVER) {
        LevelManager.displayGameOver(frameBuffer);
      }
      break;
  }
  drawFrameBuffer();
}

function onKeyPress(e) {
  let preventEvent = false;
  if (!keyPressAllowed) {
    return;
  }
  switch (e.keyCode) {
    case 38: // UP arrow
      if (currentGameState === STATE_PLAY) {
        Player.move(Player.UP);
      }
      preventEvent = true;
      break;
    case 40: // DOWN arrow
      if (currentGameState === STATE_PLAY) {
        Player.move(Player.DOWN);
      }
      preventEvent = true;
      break;
    case 37: // LEFT arrow
      if (currentGameState === STATE_PLAY) {
        Player.move(Player.LEFT);
      }
      preventEvent = true;
      break;
    case 39: // RIGHT arrow
      if (currentGameState === STATE_PLAY) {
        Player.move(Player.RIGHT);
      }
      preventEvent = true;
      break;
    case 32: // SPACE
      if (currentGameState === STATE_PLAY) {
        Player.move(Player.FIRE);
      }
      preventEvent = true;
      break;
    case 13: // Press ENTER
      switch (currentGameState) {
        case STATE_MENU:
          LevelManager.newGame();
          reset();
          break;
        case STATE_GAME_OVER:
          currentGameState = STATE_MENU;
          break;
        default:
          break;
      }
      preventEvent = true;
      break;
    default:
      break;
  }
  if (preventEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}

function onKeyRelease(e) {
  let preventEvent = false;
  if (!keyPressAllowed) {
    return;
  }
  switch (e.keyCode) {
    case 38: // UP
    case 40: // DOWN
      preventEvent = true;
      break;
    case 37: // LEFT arrow
      if (currentGameState === STATE_PLAY) {
        Player.move(Player.NONE);
      }
      preventEvent = true;
      break;
    case 39: // RIGHT arrow
      if (currentGameState === STATE_PLAY) {
        Player.move(Player.NONE);
      }
      preventEvent = true;
      break;
    case 32: // SPACE
      if (currentGameState === STATE_PLAY) {
        Player.move(Player.NONE);
      }
      preventEvent = true;
      break;
    default:
      break;
  }
  if (preventEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}

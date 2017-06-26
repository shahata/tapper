import {loadAllResources, GET_READY_TO_SERVE, OH_SUSANNA, YOU_LOSE, LAUGHING} from './ResourceManager';
import {initFrameBuffer, drawFrameBuffer} from './System';
import {playSound, stopSound} from './SoundManager';
import {LevelManager} from './LevelManager';
import {initBeerGlasses, resetBeerGlasses, drawBeerGlasses, updateBeerGlasses} from './BeerGlass';
import {initCustomers, resetCustomers, drawCustomers, updateCustomers} from './Customers';
import {Player} from './Player';

export let currentGameState;
export const STATE_PLAY = 0;
const STATE_LIFE_LOST = 1;
const STATE_MENU = 2;
const STATE_GAME_OVER = 3;
const STATE_READY = 4;

let keyPressAllowed = true;
let frameBuffer = null;

export function initGame() {
  frameBuffer = initFrameBuffer(512, 480, false, 1.0);
  loadAllResources().then(loaded);
}

function loaded() {
  LevelManager.init();
  Player.init();
  initBeerGlasses();
  initCustomers();
  document.onkeydown = onKeyPress;
  document.onkeyup = onKeyRelease;
  currentGameState = STATE_MENU;
  onUpdateFrame();
}

function reset() {
  currentGameState = STATE_READY;
  Player.reset();
  resetBeerGlasses();
  resetCustomers();
  LevelManager.reset();
  playSound(GET_READY_TO_SERVE);
  setTimeout(() => {
    currentGameState = STATE_PLAY;
    playSound(OH_SUSANNA, true);
  }, 2500);
}

function lost() {
  LevelManager.lifeLost();
  Player.lost();
  stopSound(OH_SUSANNA);
  if (LevelManager.life <= 0) {
    currentGameState = STATE_GAME_OVER;
    playSound(YOU_LOSE);
  } else {
    currentGameState = STATE_LIFE_LOST;
    playSound(LAUGHING);
    setTimeout(reset, 3000);
  }
}

function onUpdateFrame() {
  if (currentGameState === STATE_MENU) {
    LevelManager.displayGameTitle(frameBuffer);
  } else if (currentGameState === STATE_READY) {
    LevelManager.displayReadyToPlay(frameBuffer);
  } else {
    if (currentGameState === STATE_PLAY && (updateBeerGlasses() || updateCustomers())) {
      lost();
    }
    LevelManager.drawLevelBackground(frameBuffer);
    drawBeerGlasses(frameBuffer);
    drawCustomers(frameBuffer);
    keyPressAllowed = Player.draw(frameBuffer);
    LevelManager.drawGameHUD(frameBuffer);
    if (currentGameState === STATE_GAME_OVER) {
      LevelManager.displayGameOver(frameBuffer);
    }
  }
  drawFrameBuffer();
  requestAnimationFrame(onUpdateFrame);
}

function onKeyPress(e) {
  let preventEvent = false;
  if (keyPressAllowed) {
    const direction = {38: Player.UP, 40: Player.DOWN, 37: Player.LEFT, 39: Player.RIGHT, 32: Player.FIRE};
    if (e.keyCode in direction) {
      if (currentGameState === STATE_PLAY) {
        Player.move(direction[e.keyCode]);
      }
      preventEvent = true;
    } else if (e.keyCode === 13) { // Press ENTER
      if (currentGameState === STATE_MENU) {
        LevelManager.newGame();
        reset();
      } else if (currentGameState === STATE_GAME_OVER) {
        currentGameState = STATE_MENU;
      }
      preventEvent = true;
    }
  }
  if (preventEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}

function onKeyRelease(e) {
  let preventEvent = false;
  if (keyPressAllowed) {
    switch (e.keyCode) {
      case 38: // UP
      case 40: // DOWN
        preventEvent = true;
        break;
      case 37: // LEFT arrow
      case 39: // RIGHT arrow
      case 32: // SPACE
        if (currentGameState === STATE_PLAY) {
          Player.move(Player.NONE);
        }
        preventEvent = true;
        break;
      default:
        break;
    }
  }
  if (preventEvent) {
    e.preventDefault();
    e.stopImmediatePropagation();
  }
}

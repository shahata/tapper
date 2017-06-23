import {System} from './System';
import {SoundManager} from './SoundManager';
import {ResourceManager} from './ResourceManager';
import {LevelManager} from './LevelManager';
import {Player} from './Player';
import {BeerGlass} from './BeerGlass';
import {Customers} from './Customers';

export const STATE_PLAY = 0;
const STATE_LIFE_LOST = 1;
const STATE_MENU = 2;
const STATE_GAME_OVER = 3;
const STATE_READY = 4;
const STATE_LOADING = 5;
// const STATE_PAUSE = 6;
export const FPS = 60;
export let currentGameState;

export const Game = {
  keyPressAllowed: true,
  frameBuffer: null,

  initialize() {
    System.initVideo('tapperJS', 512, 480, false, 1.0);
    this.frameBuffer = System.getFrameBuffer();
    currentGameState = STATE_LOADING;
    setInterval(() => Game.onUpdateFrame(), 1000 / FPS);
    ResourceManager.loadAllResources(() => Game.loaded());
  },

  loaded() {
    LevelManager.init();
    Player.init();
    BeerGlass.init();
    Customers.init();
    document.onkeydown = e => Game.onKeyPress(e);
    document.onkeyup = e => Game.onKeyRelease(e);
    currentGameState = STATE_MENU;
  },

  reset() {
    currentGameState = STATE_READY;
    Player.reset();
    BeerGlass.reset();
    Customers.reset();
    LevelManager.reset();
    SoundManager.play(SoundManager.GET_READY_TO_SERVE, false);
    setTimeout(() => {
      currentGameState = STATE_PLAY;
      SoundManager.play(SoundManager.OH_SUSANNA, true);
    }, 2.5 * 1000);
  },

  lost() {
    Player.lost();
    BeerGlass.stop();
    Customers.stop();
    SoundManager.stop(SoundManager.OH_SUSANNA);
    if (LevelManager.life <= 0) {
      currentGameState = STATE_GAME_OVER;
      SoundManager.play(SoundManager.YOU_LOSE, false);
    } else {
      currentGameState = STATE_LIFE_LOST;
      SoundManager.play(SoundManager.LAUGHING, false);
      setTimeout(() => Game.reset(), 3 * 1000);
    }
  },

  onUpdateFrame() {
    switch (currentGameState) {
      case STATE_LOADING:
        ResourceManager.displayLoadingScreen(this.frameBuffer);
        break;
      case STATE_MENU:
        LevelManager.displayGameTitle(this.frameBuffer);
        break;
      case STATE_READY:
        LevelManager.displayReadyToPlay(this.frameBuffer);
        break;
      default:
        LevelManager.drawLevelBackground(this.frameBuffer);
        if (Customers.draw(this.frameBuffer) !== 0) {
          Game.lost();
        }
        if (BeerGlass.draw(this.frameBuffer) !== 0) {
          Game.lost();
        }
        this.keyPressAllowed = Player.draw(this.frameBuffer);
        LevelManager.drawGameHUD(this.frameBuffer);
        if (currentGameState === STATE_GAME_OVER) {
          LevelManager.displayGameOver(this.frameBuffer);
        }
        break;
    }
    System.drawFrameBuffer();
  },

  onKeyPress(e) {
    let preventEvent = false;
    if (!this.keyPressAllowed) {
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
            Game.reset();
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
  },

  onKeyRelease(e) {
    let preventEvent = false;
    if (!this.keyPressAllowed) {
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
};

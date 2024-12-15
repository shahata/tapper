const g_STATE_PLAY = 0;
const g_STATE_LIFELOST = 1;
const g_STATE_MENU = 2;
const g_STATE_GAMEOVER = 3;
const g_STATE_READY = 4;
const g_STATE_LOADING = 5;
const g_STATE_PAUSE = 6;

const g_FPS = 60;

var g_game_state;

var Game = {
  _keyPressAllowed: true,
  _frameBuffer: null,
  initialize: function () {
    if (!System.initVideo("tapperJS", 512, 480, false, 1.0)) {
      alert(
        "Sorry but no beer for you, your browser does not support html 5 canvas. Please try with another one!"
      );
      return;
    }

    this._frameBuffer = System.getFrameBuffer();

    // init sound manager (used during preloading)
    SoundMngr.init();

    g_game_state = g_STATE_LOADING;

    // start the drawing loop :)
    setInterval(function () {
      Game.onUpdateFrame();
    }, 1000 / g_FPS);

    // load all ressources
    RessourceMngr.loadAllRessources(Game.loaded);
  },

  loaded: function (status) {
    LevelManager.init();
    Player.init();
    Beerglass.init();
    Customers.init();

    document.onkeydown = function (e) {
      Game.onkeypress(e);
    };
    document.onkeyup = function (e) {
      Game.onkeyrelease(e);
    };

    g_game_state = g_STATE_MENU;
  },

  changeState: function (status) {
    g_game_state = status;
  },

  reset: function () {
    g_game_state = g_STATE_READY;
    Player.reset();
    Beerglass.reset();
    Customers.reset();
    LevelManager.reset();

    SoundMngr.play(SoundMngr.GETREADYTOSERVE, false);
    setTimeout(
      "Game.changeState(g_STATE_PLAY);SoundMngr.play(SoundMngr.OH_SUZANNA, true)",
      2.5 * 1000
    );
  },

  lost: function () {
    Player.lost();
    Beerglass.stop();
    Customers.stop();

    SoundMngr.stop(SoundMngr.OH_SUZANNA);

    if (LevelManager._life <= 0) {
      g_game_state = g_STATE_GAMEOVER;

      SoundMngr.play(SoundMngr.YOU_LOSE, false);
    } else {
      g_game_state = g_STATE_LIFELOST;

      SoundMngr.play(SoundMngr.LAUGHING, false);

      setTimeout("Game.reset()", 3 * 1000);
    }
  },

  onUpdateFrame: function () {
    switch (g_game_state) {
      case g_STATE_LOADING: {
        RessourceMngr.displayLoadingScreen(this._frameBuffer);
        break;
      }

      case g_STATE_MENU: {
        LevelManager.displayGameTitle(this._frameBuffer);
        break;
      }

      case g_STATE_READY: {
        LevelManager.displayReadyToPlay(this._frameBuffer);
        break;
      }
      default:
        {
          LevelManager.drawLevelBackground(this._frameBuffer);
          if (Customers.draw(this._frameBuffer) != 0) {
            Game.lost();
          }
          if (Beerglass.draw(this._frameBuffer) != 0) {
            Game.lost();
          }
          this._keyPressAllowed = Player.draw(this._frameBuffer);
          LevelManager.drawGameHUD(this._frameBuffer);
          if (g_game_state == g_STATE_GAMEOVER) {
            LevelManager.displayGameOver(this._frameBuffer);
          }
        }
        break;
    }
    System.drawFrameBuffer();
  },

  onkeypress: function (e) {
    var prevenEvent = false;

    if (!this._keyPressAllowed) return;

    switch (e.keyCode) {
      case 38: {
        // UP arrow
        if (g_game_state == g_STATE_PLAY) Player.move(Player.UP);
        prevenEvent = true;
        break;
      }
      case 40: {
        // DOWN arrow
        if (g_game_state == g_STATE_PLAY) Player.move(Player.DOWN);
        prevenEvent = true;
        break;
      }
      case 37: {
        // LEFT arrow
        if (g_game_state == g_STATE_PLAY) Player.move(Player.LEFT);
        prevenEvent = true;
        break;
      }
      case 39: {
        // RIGHT arrow
        if (g_game_state == g_STATE_PLAY) Player.move(Player.RIGHT);
        prevenEvent = true;
        break;
      }
      case 32: {
        // SPACE
        if (g_game_state == g_STATE_PLAY) Player.move(Player.FIRE);
        prevenEvent = true;
        break;
      }

      case 13: {
        // Press ENTER
        switch (g_game_state) {
          case g_STATE_MENU: {
            LevelManager.newGame();
            Game.reset();
            break;
          }

          case g_STATE_GAMEOVER: {
            g_game_state = g_STATE_MENU;
            break;
          }

          case g_STATE_PLAY: {
            break;
          }

          default: {
            break;
          }
        } // end switch
        prevenEvent = true;
        break;
      }

      default:
        break;
    }
    if (prevenEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },

  onkeyrelease: function (e) {
    var prevenEvent = false;

    if (!this._keyPressAllowed) return;

    switch (e.keyCode) {
      case 38: // UP
      case 40: {
        // DOWN
        prevenEvent = true;
        break;
      }
      case 37: {
        // LEFT arrow
        if (g_game_state == g_STATE_PLAY) Player.move(Player.NONE);
        prevenEvent = true;
        break;
      }
      case 39: {
        // RIGHT arrow
        if (g_game_state == g_STATE_PLAY) Player.move(Player.NONE);
        prevenEvent = true;
        break;
      }
      case 32: {
        // SPACE
        if (g_game_state == g_STATE_PLAY) Player.move(Player.NONE);
        prevenEvent = true;
        break;
      }
      default:
        break;
    }
    if (prevenEvent) {
      e.preventDefault();
      e.stopImmediatePropagation();
    }
  },
};

window.onload = function () {
  Game.initialize();
};

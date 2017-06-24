import {loadSound} from './SoundManager';

export const BARMAN_ZIP_UP = 'barman-zip-up';
export const BARMAN_ZIP_DOWN = 'barman-zip-down';
export const OH_SUSANNA = 'oh-susanna';
export const GRAB_MUG = 'grab-mug';
export const THROW_MUG = 'throw-mug';
export const MUG_FILL1 = 'mug-fill-1';
export const MUG_FILL2 = 'mug-fill-2';
export const FULL_MUG = 'full-mug';
export const POP_OUT = 'pop-out';
export const OUT_DOOR = 'out-door';
export const LAUGHING = 'laughing';
export const GET_READY_TO_SERVE = 'get-ready-to-serve';
export const YOU_LOSE = 'you-lose';
export const COLLECT_TIP = 'collect-tip';
export const TIP_APPEAR = 'tip-appear';
export const GAME_TITLE = 'game-title';
export const PREGAME = 'pregame';
export const LEVEL_1 = 'level-1';
export const BARMAN = 'barman';
export const BEER_GLASS = 'beer-glass';
export const CUSTOMERS = 'customers';
export const FONT = 'font';
export const MISC = 'misc';

const imageData = [
 {name: GAME_TITLE, src: 'assets/images/game_title.png'},
 {name: PREGAME, src: 'assets/images/pregame.png'},
 {name: LEVEL_1, src: 'assets/images/level-1.png'},
 {name: BARMAN, src: 'assets/images/barman.png'},
 {name: BEER_GLASS, src: 'assets/images/BeerGlass.png'},
 {name: CUSTOMERS, src: 'assets/images/customers.png'},
 {name: FONT, src: 'assets/images/font.png'},
 {name: MISC, src: 'assets/images/misc.png'}
];

const soundData = [
 {name: BARMAN_ZIP_UP, src: 'assets/sounds/zip_up.mp3', channel: 4},
 {name: BARMAN_ZIP_DOWN, src: 'assets/sounds/zip_down.mp3', channel: 4},
 {name: OH_SUSANNA, src: 'assets/sounds/oh_susanna.mp3', channel: 1},
 {name: GRAB_MUG, src: 'assets/sounds/grab_mug.mp3', channel: 2},
 {name: THROW_MUG, src: 'assets/sounds/throw_mug.mp3', channel: 4},
 {name: MUG_FILL1, src: 'assets/sounds/mug_fill1.mp3', channel: 2},
 {name: MUG_FILL2, src: 'assets/sounds/mug_fill2.mp3', channel: 2},
 {name: FULL_MUG, src: 'assets/sounds/full_mug.mp3', channel: 1},
 {name: POP_OUT, src: 'assets/sounds/pop_out.mp3', channel: 4},
 {name: OUT_DOOR, src: 'assets/sounds/out_door.mp3', channel: 4},
 {name: LAUGHING, src: 'assets/sounds/laughing.mp3', channel: 1},
 {name: GET_READY_TO_SERVE, src: 'assets/sounds/get_ready_to_serve.mp3', channel: 1},
 {name: YOU_LOSE, src: 'assets/sounds/you_lose.mp3', channel: 1},
 {name: COLLECT_TIP, src: 'assets/sounds/collect_tip.mp3', channel: 1},
 {name: TIP_APPEAR, src: 'assets/sounds/tip_appear.mp3', channel: 1}
];

const imageList = {};

function preloadImages() {
  return imageData.map(image => new Promise(resolve => {
    const newImage = new Image();
    imageList[image.name] = newImage;
    newImage.src = image.src;
    newImage.onLoad = resolve;
  }));
}

function preLoadSounds() {
  return soundData.map(sound => loadSound(sound));
}

export function loadAllResources() {
  return Promise.all([preloadImages(), preLoadSounds()]);
}

export function getImageResource(name) {
  return imageList[name];
}

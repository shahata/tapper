import {SoundManager} from './SoundManager';

const imageData = [
 {name: 'game_title', src: 'assets/images/game_title.png'},
 {name: 'pregame', src: 'assets/images/pregame.png'},
 {name: 'level-1', src: 'assets/images/level-1.png'},
 {name: 'barman', src: 'assets/images/barman.png'},
 {name: 'BeerGlass', src: 'assets/images/BeerGlass.png'},
 {name: 'customers', src: 'assets/images/customers.png'},
 {name: 'font', src: 'assets/images/font.png'},
 {name: 'misc', src: 'assets/images/misc.png'}
];

const soundData = [
 {name: 'zip_up', src: 'assets/sounds/zip_up.mp3', channel: 4},
 {name: 'zip_down', src: 'assets/sounds/zip_down.mp3', channel: 4},
 {name: 'oh_susanna', src: 'assets/sounds/oh_susanna.mp3', channel: 1},
 {name: 'grab_mug', src: 'assets/sounds/grab_mug.mp3', channel: 2},
 {name: 'throw_mug', src: 'assets/sounds/throw_mug.mp3', channel: 4},
 {name: 'mug_fill1', src: 'assets/sounds/mug_fill1.mp3', channel: 2},
 {name: 'mug_fill2', src: 'assets/sounds/mug_fill2.mp3', channel: 2},
 {name: 'full_mug', src: 'assets/sounds/full_mug.mp3', channel: 1},
 {name: 'pop_out', src: 'assets/sounds/pop_out.mp3', channel: 4},
 {name: 'out_door', src: 'assets/sounds/out_door.mp3', channel: 4},
 {name: 'laughing', src: 'assets/sounds/laughing.mp3', channel: 1},
 {name: 'get_ready_to_serve', src: 'assets/sounds/get_ready_to_serve.mp3', channel: 1},
 {name: 'you_lose', src: 'assets/sounds/you_lose.mp3', channel: 1},
 {name: 'collect_tip', src: 'assets/sounds/collect_tip.mp3', channel: 1},
 {name: 'tip_appear', src: 'assets/sounds/tip_appear.mp3', channel: 1}
];

export const ResourceManager = {
  imageList: null,
  loadCount: 0,
  loadingScreenLogo: null,
  loadingTitleName: 'assets/images/loading_title.png',
  logoWidth: 234,
  logoHeight: 104,
  resourceCount: 0,
  loadedCallBack: undefined,

  checkLoadStatus() {
    if (ResourceManager.loadCount === ResourceManager.resourceCount) {
      ResourceManager.loadedCallBack();
    } else {
      setTimeout(() => ResourceManager.checkLoadStatus(), 100);
    }
  },

  loadAllResources(loadCallBack) {
    ResourceManager.resourceCount = ResourceManager.preloadImages(imageData);
    ResourceManager.resourceCount += ResourceManager.preLoadSounds(soundData);
    ResourceManager.loadedCallBack = loadCallBack;
    setTimeout(() => ResourceManager.checkLoadStatus(), 100);
  },

  resourceLoaded() {
    ResourceManager.loadCount++;
  },

  preloadImages(images) {
    this.imageList = [];
    for (let i = 0; i < images.length; i++) {
      const newImage = new Image();
      this.imageList.push(images[i].name);
      newImage.src = images[i].src;
      newImage.onLoad = ResourceManager.resourceLoaded();
      this.imageList[images[i].name] = newImage;
    }
    return images.length;
  },

  preLoadSounds(soundData) {
    for (let i = 0; i < soundData.length; ++i) {
      SoundManager.load(i, soundData[i], ResourceManager.resourceLoaded);
    }
    return soundData.length;
  },

  displayLoadingScreen(context) {
    this.loadingScreenLogo = new Image();
    this.loadingScreenLogo.src = this.loadingTitleName;
    context.fillStyle = 'black';
    context.fillRect(0, 0, context.canvas.width, context.canvas.height);
    context.fill();
    context.drawImage(this.loadingScreenLogo, (context.canvas.width - this.logoWidth) / 2, (context.canvas.height - this.logoHeight) / 2);

    const percent = ResourceManager.loadCount / ResourceManager.resourceCount;
    const width = Math.floor(percent * context.canvas.width);
    context.strokeStyle = 'gray';
    context.strokeRect(0, 299, context.canvas.width, 20);
    context.fillStyle = 'gray';
    context.fillRect(0, 299, width, 20);
    context.fillStyle = 'white';
    context.font = 'bold 14px Courier';
    context.textBaseline = 'top';
    context.fillText('Loading...', 218, 300);
  },

  getImageResource(name) {
    return this.imageList[name];
  }
};

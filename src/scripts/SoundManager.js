const soundEnabled = true;

export const SoundManager = {
  BARMAN_ZIP_UP: 0,
  BARMAN_ZIP_DOWN: 1,
  OH_SUSANNA: 2,
  GRAB_MUG: 3,
  THROW_MUG: 4,
  MUG_FILL1: 5,
  MUG_FILL2: 6,
  FULL_MUG: 7,
  POP_OUT: 8,
  OUT_DOOR: 9,
  LAUGHING: 10,
  GET_READY_TO_SERVE: 11,
  YOU_LOSE: 12,
  COLLECT_TIP: 13,
  TIP_APPEAR: 14,
  audioChannels: [],

  load(soundId, sound, loadCallBack) {
    const soundClip = document.createElement('audio');
    soundClip.src = sound.src;
    soundClip.autobuffer = true;
    soundClip.preload = 'auto';
    soundClip.addEventListener('canplaythrough', function handler() {
      this.removeEventListener('canplaythrough', handler, false);
      loadCallBack();
    }, false);
    soundClip.load();
    this.audioChannels[soundId] = [soundClip];
    if (sound.channel > 1) {
      for (let channel = 1; channel < sound.channel; channel++) {
        this.audioChannels[soundId].push(soundClip.cloneNode(true));
      }
    }
  },

  stop(soundId) {
    if (soundEnabled) {
      const sound = this.audioChannels[soundId];
      for (let channelId = sound.length; channelId--;) {
        sound[channelId].pause();
      }
    }
  },

  play(soundId, loop) {
    if (soundEnabled) {
      let freeChannel = 0;
      const clip = this.audioChannels[soundId];
      for (let channelId = clip.length; channelId--;) {
        if (clip[channelId].paused || clip[channelId].ended) {
          freeChannel = channelId;
          break;
        }
      }
      clip[freeChannel].currentTime = 0;
      clip[freeChannel].loop = loop;
      clip[freeChannel].play();
    }
  }
};

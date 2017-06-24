const audioChannels = {};

export function loadSound(sound) {
  return new Promise(resolve => {
    const soundClip = document.createElement('audio');
    soundClip.src = sound.src;
    soundClip.autobuffer = true;
    soundClip.preload = 'auto';
    soundClip.addEventListener('canplaythrough', function handler() {
      this.removeEventListener('canplaythrough', handler);
      resolve();
    });
    soundClip.load();
    audioChannels[sound.name] = [soundClip];
    if (sound.channel > 1) {
      for (let channel = 1; channel < sound.channel; channel++) {
        audioChannels[sound.name].push(soundClip.cloneNode(true));
      }
    }
  });
}

export function stopSound(soundId) {
  audioChannels[soundId].forEach(channel => channel.pause());
}

export function playSound(soundId, loop = false) {
  const freeChannel = audioChannels[soundId].find(channel => channel.paused || channel.ended);
  if (freeChannel) {
    freeChannel.currentTime = 0;
    freeChannel.loop = loop;
    freeChannel.play();
  }
}

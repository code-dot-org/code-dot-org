import {randomInt} from '../helpers';

let registerSoundAPI, playSoundAPI;

const soundLibrary = {
  yes: [
    new URL('../../assets/sounds/yes/yes_1.mp3', import.meta.url).href,
    new URL('../../assets/sounds/yes/yes_2.mp3', import.meta.url).href,
    new URL('../../assets/sounds/yes/yes_3.mp3', import.meta.url).href,
    new URL('../../assets/sounds/yes/yes_4.mp3', import.meta.url).href,
    new URL('../../assets/sounds/yes/yes_5.mp3', import.meta.url).href,
    new URL('../../assets/sounds/yes/yes_6.mp3', import.meta.url).href,
    new URL('../../assets/sounds/yes/yes_7.mp3', import.meta.url).href,
    new URL('../../assets/sounds/yes/yes_8.mp3', import.meta.url).href,
    new URL('../../assets/sounds/yes/yes_9.mp3', import.meta.url).href,
  ],
  no: [
    new URL('../../assets/sounds/no/no_1.mp3', import.meta.url).href,
    new URL('../../assets/sounds/no/no_2.mp3', import.meta.url).href,
    new URL('../../assets/sounds/no/no_3.mp3', import.meta.url).href,
    new URL('../../assets/sounds/no/no_4.mp3', import.meta.url).href,
    new URL('../../assets/sounds/no/no_5.mp3', import.meta.url).href,
    new URL('../../assets/sounds/no/no_6.mp3', import.meta.url).href,
    new URL('../../assets/sounds/no/no_7.mp3', import.meta.url).href,
    new URL('../../assets/sounds/no/no_8.mp3', import.meta.url).href,
    new URL('../../assets/sounds/no/no_9.mp3', import.meta.url).href,
  ],
  sortyes: [
    new URL('../../assets/sounds/sortyes/sortyes_1.mp3', import.meta.url).href,
    new URL('../../assets/sounds/sortyes/sortyes_2.mp3', import.meta.url).href,
    new URL('../../assets/sounds/sortyes/sortyes_3.mp3', import.meta.url).href,
  ],
  sortno: [
    new URL('../../assets/sounds/sortno/sortno_1.mp3', import.meta.url).href,
  ],
  other: [
    new URL('../../assets/sounds/other/other_1.mp3', import.meta.url).href,
    new URL('../../assets/sounds/other/other_2.mp3', import.meta.url).href,
    new URL('../../assets/sounds/other/other_3.mp3', import.meta.url).href,
    new URL('../../assets/sounds/other/other_4.mp3', import.meta.url).href,
  ],
};

const injectSoundAPIs = ({registerSound, playSound}) => {
  registerSoundAPI = registerSound;
  playSoundAPI = playSound;
};

const loadSounds = () => {
  Object.entries(soundLibrary).forEach(([, category]) =>
    category.forEach(sound => registerSoundAPI({id: sound, mp3: sound})),
  );
};

const playSound = (categoryName, volume = undefined) => {
  const index = randomInt(0, soundLibrary[categoryName].length - 1);
  playSoundAPI(soundLibrary[categoryName][index], {volume: volume || 1.0});
};

export default {
  injectSoundAPIs,
  loadSounds,
  playSound,
};

import {randomInt} from '../helpers';

let registerSoundAPI, playSoundAPI;

const soundLibrary = {
  yes: [
    require('@public/sounds/yes/yes_1.mp3'),
    require('@public/sounds/yes/yes_2.mp3'),
    require('@public/sounds/yes/yes_3.mp3'),
    require('@public/sounds/yes/yes_4.mp3'),
    require('@public/sounds/yes/yes_5.mp3'),
    require('@public/sounds/yes/yes_6.mp3'),
    require('@public/sounds/yes/yes_7.mp3'),
    require('@public/sounds/yes/yes_8.mp3'),
    require('@public/sounds/yes/yes_9.mp3')
  ],
  no: [
    require('@public/sounds/no/no_1.mp3'),
    require('@public/sounds/no/no_2.mp3'),
    require('@public/sounds/no/no_3.mp3'),
    require('@public/sounds/no/no_4.mp3'),
    require('@public/sounds/no/no_5.mp3'),
    require('@public/sounds/no/no_6.mp3'),
    require('@public/sounds/no/no_7.mp3'),
    require('@public/sounds/no/no_8.mp3'),
    require('@public/sounds/no/no_9.mp3')
  ],
  sortyes: [
    require('@public/sounds/sortyes/sortyes_1.mp3'),
    require('@public/sounds/sortyes/sortyes_2.mp3'),
    require('@public/sounds/sortyes/sortyes_3.mp3')
  ],
  sortno: [require('@public/sounds/sortno/sortno_1.mp3')],
  other: [
    require('@public/sounds/other/other_1.mp3'),
    require('@public/sounds/other/other_2.mp3'),
    require('@public/sounds/other/other_3.mp3'),
    require('@public/sounds/other/other_4.mp3')
  ]
};

export const injectSoundAPIs = ({registerSound, playSound}) => {
  registerSoundAPI = registerSound;
  playSoundAPI = playSound;
};

export const loadSounds = () => {
  Object.entries(soundLibrary).forEach(([_, category]) =>
    category.forEach(sound => registerSoundAPI({id: sound, mp3: sound}))
  );
};

export const playSound = (categoryName, volume = undefined) => {
  const index = randomInt(0, soundLibrary[categoryName].length - 1);
  playSoundAPI(soundLibrary[categoryName][index], {volume: volume || 1.0});
};

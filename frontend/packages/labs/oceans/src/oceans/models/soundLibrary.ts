import no_1 from '@/assets/sounds/no/no_1.mp3';
import no_2 from '@/assets/sounds/no/no_2.mp3';
import no_3 from '@/assets/sounds/no/no_3.mp3';
import no_4 from '@/assets/sounds/no/no_4.mp3';
import no_5 from '@/assets/sounds/no/no_5.mp3';
import no_6 from '@/assets/sounds/no/no_6.mp3';
import no_7 from '@/assets/sounds/no/no_7.mp3';
import no_8 from '@/assets/sounds/no/no_8.mp3';
import no_9 from '@/assets/sounds/no/no_9.mp3';
import other_1 from '@/assets/sounds/other/other_1.mp3';
import other_2 from '@/assets/sounds/other/other_2.mp3';
import other_3 from '@/assets/sounds/other/other_3.mp3';
import other_4 from '@/assets/sounds/other/other_4.mp3';
import sortno_1 from '@/assets/sounds/sortno/sortno_1.mp3';
import sortyes_1 from '@/assets/sounds/sortyes/sortyes_1.mp3';
import sortyes_2 from '@/assets/sounds/sortyes/sortyes_2.mp3';
import sortyes_3 from '@/assets/sounds/sortyes/sortyes_3.mp3';
import yes_1 from '@/assets/sounds/yes/yes_1.mp3';
import yes_2 from '@/assets/sounds/yes/yes_2.mp3';
import yes_3 from '@/assets/sounds/yes/yes_3.mp3';
import yes_4 from '@/assets/sounds/yes/yes_4.mp3';
import yes_5 from '@/assets/sounds/yes/yes_5.mp3';
import yes_6 from '@/assets/sounds/yes/yes_6.mp3';
import yes_7 from '@/assets/sounds/yes/yes_7.mp3';
import yes_8 from '@/assets/sounds/yes/yes_8.mp3';
import yes_9 from '@/assets/sounds/yes/yes_9.mp3';

import {randomInt} from '../helpers';

interface SoundAPIs {
  registerSound: (cfg: {id: string; mp3: string}) => void;
  playSound: (url: string, opts: {volume?: number}) => void;
}

let registerSoundAPI: SoundAPIs['registerSound'];
let playSoundAPI: SoundAPIs['playSound'];

const soundLibrary: Record<string, string[]> = {
  yes: [yes_1, yes_2, yes_3, yes_4, yes_5, yes_6, yes_7, yes_8, yes_9],
  no: [no_1, no_2, no_3, no_4, no_5, no_6, no_7, no_8, no_9],
  sortyes: [sortyes_1, sortyes_2, sortyes_3],
  sortno: [sortno_1],
  other: [other_1, other_2, other_3, other_4],
};

const injectSoundAPIs = (apis: SoundAPIs): void => {
  registerSoundAPI = apis.registerSound;
  playSoundAPI = apis.playSound;
};

const loadSounds = (): void => {
  Object.values(soundLibrary).forEach(category =>
    category.forEach(sound => registerSoundAPI({id: sound, mp3: sound})),
  );
};

const playSound = (categoryName: string, volume?: number): void => {
  const index = randomInt(0, soundLibrary[categoryName].length - 1);
  playSoundAPI(soundLibrary[categoryName][index], {volume: volume || 1.0});
};

export default {
  injectSoundAPIs,
  loadSounds,
  playSound,
};

import {randomInt} from '../helpers';

/** API functions injected from the host Sound system. */
interface SoundAPIs {
  registerSound: (cfg: {id: string; mp3: string}) => void;
  playSound: (url: string, opts: {volume?: number}) => void;
}

/** Module-level references to the injected sound API functions. */
let registerSoundAPI: SoundAPIs['registerSound'];
let playSoundAPI: SoundAPIs['playSound'];

/** Sound categories mapped to their asset URL arrays. */
const soundLibrary: Record<string, string[]> = {
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

/**
 * Store references to the host Sound system APIs for later use.
 *
 * @param apis - Object containing registerSound and playSound functions.
 */
const injectSoundAPIs = (apis: SoundAPIs): void => {
  registerSoundAPI = apis.registerSound;
  playSoundAPI = apis.playSound;
};

/** Register all sounds in every category with the injected Sound system. */
const loadSounds = (): void => {
  Object.entries(soundLibrary).forEach(([, category]) =>
    category.forEach(sound => registerSoundAPI({id: sound, mp3: sound})),
  );
};

/**
 * Play a random sound from the named category.
 *
 * @param categoryName - Key into soundLibrary (e.g. 'yes', 'no', 'sortyes').
 * @param volume - Optional playback volume (0–1); defaults to 1.0.
 */
const playSound = (categoryName: string, volume?: number): void => {
  const index = randomInt(0, soundLibrary[categoryName].length - 1);
  playSoundAPI(soundLibrary[categoryName][index], {volume: volume || 1.0});
};

export default {
  injectSoundAPIs,
  loadSounds,
  playSound,
};

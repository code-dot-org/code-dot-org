import Sounds from '../Sounds';
import {randomInt} from '../helpers';

let mySounds = null;

let soundCategories = {
  yes: 10,
  no: 10,
  other: 4,
  ambience: 1
};

export const loadSounds = () => {
  mySounds = new Sounds();

  Object.keys(soundCategories).forEach(categoryName => {
    for (var i = 1; i <= soundCategories[categoryName]; i++) {
      const baseFilename = `sounds/${categoryName}/${categoryName}_${i}`;
      mySounds.register({
        id: categoryName + '_' + i,
        ogg: baseFilename + '.ogg',
        mp3: baseFilename + '.mp3'
      });
    }
  });
};

export const playSound = (categoryName, specificIndex = undefined) => {
  const index = specificIndex || randomInt(1, soundCategories[categoryName]);
  mySounds.play(categoryName + '_' + index);
};

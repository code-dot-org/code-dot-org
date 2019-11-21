import {generateOcean} from '../../utils/generateOcean';
import {setState} from '../state';
import {randomInt} from '../helpers';
import constants, {ClassType} from '../constants';

export const init = () => {
  const wordFish = generateOcean(
    10,
    /* loadFish = */ true,
    /* loadTrashImage = */ false,
    /*loadCreatureImages = */ false
  );
  arrangeFish(wordFish);
  setState({
    wordFish
  });
};

const arrangeFish = fishes => {
  fishes.forEach(fish => {
    const x = randomInt(0, constants.canvasWidth - constants.fishCanvasWidth);

    const y = randomInt(0, constants.canvasHeight - constants.fishCanvasHeight);
    fish.setXY({x, y});
  });
};

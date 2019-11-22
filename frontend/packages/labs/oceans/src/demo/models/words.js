import {generateOcean} from '../../utils/generateOcean';
import {setState} from '../state';
import {randomInt} from '../helpers';
import constants, {ClassType} from '../constants';

export const init = () => {
  const wordFish = generateOcean(
    1,
    /* loadFish = */ true,
    /* loadTrashImage = */ false,
    /*loadCreatureImages = */ false
  );
  arrangeFish(wordFish);
  setState({
    wordFish,
    fishCount: 1
  });
};

const arrangeFish = fishes => {
  fishes.forEach(fish => {
    const x = randomInt(0, constants.canvasWidth) - constants.canvasWidth;
    console.log(x);

    const y = constants.canvasHeight - constants.fishCanvasHeight - 50;
    fish.setXY({x:-constants.fishCanvasWidth,y});
  });
};

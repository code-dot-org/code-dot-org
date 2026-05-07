import {setState} from '../state';

export const init = () => {
  // There are 4 lanes on a screen and there should be one fish per lane.
  // Set all the fish to null for now. They'll be created in the renderer.
  const wordFish = {0: null, 1: null, 2: null, 3: null};
  setState({
    wordFish: wordFish,
    fishCount: 0
  });
};

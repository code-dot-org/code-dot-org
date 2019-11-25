import {setState} from '../state';

export const init = () => {
  const wordFish = {0: null, 1: null, 2: null, 3: null};
  setState({
    wordFish: wordFish,
    fishCount: 0
  });
};

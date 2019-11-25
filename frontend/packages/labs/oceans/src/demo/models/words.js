import {setState} from '../state';

export const init = () => {
  setState({
    wordFish: [],
    fishCount: 0
  });
};

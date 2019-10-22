import 'babel-polyfill';
import {getState, setState} from '../state';
import {Modes} from '../constants';
import {init as initScene} from '../init';
import {createButton} from '../helpers';

const items = [
  ['Blue', 'Green', 'Red', 'Round', 'Square'],
  [
    'Friendly',
    'Funny',
    'Bizarre',
    'Shy',
    'Glitchy',
    'Delicious',
    'Fun',
    'Angry',
    'Fast',
    'Smart',
    'Brave',
    'Scary',
    'Wild',
    'Fierce',
    'Tropical'
  ]
];

const onChangeWord = itemIndex => {
  console.log('word:', items[currentItemSet()][itemIndex]);
  setState({
    word: items[currentItemSet()][itemIndex],
    currentMode: Modes.Training
  });
  initScene();
};

const currentItemSet = () => {
  const state = getState();
  const iterationCount = state.iterationCount;
  const itemSet = iterationCount === 0 ? 0 : 1;
  return itemSet;
};

const createButtons = () => {
  let buttons = [];
  items[currentItemSet()].forEach((item, itemIndex) => {
    const button = createButton({
      id: `button-${itemIndex}`,
      text: item,
      className: currentItemSet() === 0 ? 'ui-button-1-col' : 'ui-button-3-col',
      onClick: () => {
        onChangeWord(itemIndex);
      }
    });
    buttons.push(button);
  });
  return buttons;
};

export const init = () => {
  setState({uiElements: createButtons()});
};

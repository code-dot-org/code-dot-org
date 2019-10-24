import 'babel-polyfill';
import {getState, setState} from '../state';
import {Modes} from '../constants';
import {init as initScene} from '../init';
import {createButton, createText} from '../helpers';

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
  setState({
    word: items[currentItemSet()][itemIndex],
    currentMode: Modes.Training
  });
  initScene();
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
  const state = getState();
const footerElements = [
  createButton({
    text: 'Select Type',
    onClick: () => onSelectType(),
    className: ''
  }),
  createButton({
    text: 'Continue',
    onClick: () => toMode(Modes.Predicting),
    className: ''
  })
];
  const uiElements = [createText({id: 'teach-text', text: `Now let's teach AI bot what  ${state.word.toUpperCase()} fish looks like`})];
  setState({uiElements, footerElements});
};

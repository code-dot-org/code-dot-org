import 'babel-polyfill';
import {getState, setState} from '../state';
import {Modes} from '../constants';
import {createButton, createText, toMode} from '../helpers';

export const init = () => {
  const state = getState();
  const footerElements = [
    createButton({
      text: 'Continue',
      onClick: () => toMode(Modes.Training),
      className: ''
    })
  ];
  const uiElements = [
    createText({
      id: 'teach-text',
      text: `Now let's teach AI bot what <b>${state.word.toUpperCase()}</b> fish looks like`
    })
  ];
  setState({uiElements, footerElements});
};

import 'idempotent-babel-polyfill';
import {getState, setState} from '../state';
import {Modes} from '../constants';
import {createButton, createImage, createText, toMode} from '../helpers';
import aiBotClosed from '../../../public/images/ai-bot-closed.png';

export const init = () => {
  const state = getState();
  const footerElements = [
    createButton({
      text: 'Continue',
      onClick: () => toMode(Modes.Training),
      className: 'continue-end'
    })
  ];
  const uiElements = [
    createText({
      id: 'training-intro-text',
      text: `Now let's teach A.I. what <b>${state.word.toUpperCase()}</b> fish look like.`
    }),
    createImage({
      id: 'training-intro-ai-bot',
      src: aiBotClosed
    })
  ];
  setState({uiElements, footerElements});
};

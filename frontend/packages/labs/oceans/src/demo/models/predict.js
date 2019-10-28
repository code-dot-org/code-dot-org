import 'babel-polyfill';
import $ from 'jquery';
import {setState} from '../state';
import {Modes} from '../constants';
import {createButton, createText, createImage, toMode} from '../helpers';

export const init = () => {
  setState({isRunning: true});
};

export const predictFish = (state, idx) => {
  return new Promise(resolve => {
    const fish = state.fishData[idx];
    state.trainer.predictFromData(fish.knnData).then(prediction => {
      fish.result = prediction;
      resolve(prediction);
    });
  });
};

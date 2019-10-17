import 'babel-polyfill';
import {setState, getState} from '../state';
import {Modes} from '../constants';
import {backgroundPathForMode} from '../../utils/helpers';
import SimpleTrainer from '../../utils/SimpleTrainer';
import {generateOcean} from '../../utils/generateOcean';
import {renderBackground, render} from '../renderer';

export const init = () => {
  const fishData = generateOcean(100);
  const trainer = new SimpleTrainer();
  trainer.initializeClassifiersWithoutMobilenet();
  const backgroundImgPath = backgroundPathForMode(Modes.Training);

  setState({fishData, trainer});
  renderBackground(backgroundImgPath);
  render();
};

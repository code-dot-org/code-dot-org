import 'babel-polyfill';
import {setState, getState} from '../state';
import {init as initScene} from '../init';
import {Modes, ClassType} from '../constants';
import {createButton} from '../helpers';
import {drawPondFish, drawUiElements, clearCanvas} from '../renderer';

const uiElements = [
  createButton({
    id: 'start-over-button',
    text: 'start over',
    onClick: () => onClickStartOver()
  })
];

export const init = () => {
  predictAllFish(getState(), fishWithConfidence => {
    fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
    const pondFish = fishWithConfidence.splice(0, 20);

    setState({pondFish, uiElements});
  });
};

const predictAllFish = (state, onComplete) => {
  let fishWithConfidence = [];
  state.fishData.map((fish, index) => {
    state.trainer.predictFromData(fish.knnData).then(res => {
      if (res.predictedClassId === ClassType.Like) {
        let data = {
          ...fish,
          confidence: res.confidencesByClassId[res.predictedClassId]
        };
        fishWithConfidence.push(data);
      }

      if (index === state.fishData.length - 1) {
        onComplete(fishWithConfidence);
      }
    });
  });
};

const onClickStartOver = () => {
  const state = setState({currentMode: Modes.Training});
  state.trainer.clearAll();
  initScene();
};

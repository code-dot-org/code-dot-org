import 'babel-polyfill';
import _ from 'lodash';
import {setState, getState} from '../state';
import constants, {Modes, ClassType} from '../constants';
import {
  createButton,
  createText,
  createImage,
  randomInt,
  toMode
} from '../helpers';

const headerElements = [createText({id: 'header', text: 'A.I. Results'})];
const staticUiElements = [
  createImage({
    id: 'pond-ai-bot',
    src: 'images/ai-bot-closed.png'
  }),
  createText({
    id: 'pond-title',
    text: 'How did A.I. do?'
  })
];
const staticFooterElements = [
  createButton({
    text: 'Training',
    onClick: () => toMode(Modes.Training),
    className: ''
  })
];

export const init = async () => {
  const state = getState();
  let fishWithConfidence = await predictAllFish(state);
  fishWithConfidence = _.sortBy(fishWithConfidence, ['confidence']);
  const pondFish = fishWithConfidence.splice(0, 20);
  arrangeFish(pondFish);
  setState({
    pondFish,
    headerElements,
    uiElements: uiElements(state, pondFish.length),
    footerElements: footerElements(state)
  });
};

const predictAllFish = state => {
  return new Promise(resolve => {
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
          resolve(fishWithConfidence);
        }
      });
    });
  });
};

const continueText = state => {
  return state.iterationCount === 0 ? 'Continue' : 'Complete';
};

const uiElements = (state, pondCount) => {
  const pondText = `Out of ${
    state.fishData.length
  } objects, A.I. identified ${pondCount} that it classified as ${state.word.toUpperCase()}. To help A.I. do better, you can train A.I. more and try again. Otherwise, click '${continueText(
    state
  )}'.`;
  return [...staticUiElements, createText({id: 'pond-text', text: pondText})];
};

const footerElements = state => {
  const continueButton = createButton({
    text: continueText(state),
    onClick: () => onClickContinue(),
    className: ''
  });

  return [...staticFooterElements, continueButton];
};

const arrangeFish = fishes => {
  fishes.forEach(fish => {
    fish.x = randomInt(
      0,
      constants.canvasWidth - constants.fishCanvasWidth / 2
    );
    fish.y = randomInt(
      0,
      constants.canvasHeight - constants.fishCanvasHeight / 2
    );
  });
};

const onClickContinue = () => {
  const state = setState({
    iterationCount: getState().iterationCount + 1,
    trainingIndex: 0,
    fishData: [],
    yesCount: 0,
    noCount: 0
  });
  state.trainer.clearAll();
  toMode(Modes.Words);
};

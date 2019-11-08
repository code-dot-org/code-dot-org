import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';

const guides = [
  {
    id: 'fishvtrash-training-init',
    text: 'Welcome to the tutorial!',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'TopLeft'
  },
  {
    id: 'fishvtrash-training-init2',
    text: 'Use these two buttons to train A.I.',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'BottomMiddle'
  },
  {
    id: 'fishvtrash-training-done',
    text: "Great work!  You can continue when you're ready.",
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount > 40;
      }
    },
    style: 'BottomMiddle'
  },
  {
    id: 'fishvtrash-training-keeptraining',
    text: 'Nice work.  Keep training!',
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'BottomMiddle'
  },
  {
    id: 'fishvtrash-predicting-init',
    text: 'Does A.I. know what a fish looks like?',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    style: 'BottomMiddle'
  },
  {
    id: 'fishvtrash-predicting-init2',
    text: "Let's see!",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    style: 'BottomRight'
  },
  {
    id: 'fishvtrash-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} random objects, A.I. identified ${
        state.totalPondFish
      } that belong in water.`;
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    style: 'BottomMiddle'
  },
  {
    id: 'fishvtrash-pond-init2',
    text: "How did A.I do?",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    style: 'BottomMiddle'
  },
  {
    id: 'fishvtrash-pond-init3',
    text: "Try clicking some fish to see how confident A.I. was.",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    style: 'BottomMiddle'
  }
];

export function getCurrentGuide() {
  const state = getState();

  for (const guide of guides) {
    // If the current state matches the guide's requirements...
    if (
      Object.keys(guide.when).every(key => {
        return key === 'fn'
          ? guide.when['fn'](getState())
          : guide.when[key] === state[key];
      })
    ) {
      // And if we haven't already dismissed this particular guide...
      if (
        !(state.guideDismissals && state.guideDismissals.includes(guide.id))
      ) {
        return guide;
      }
    }
  }

  return null;
}

export function dismissGuide(id) {
  const state = getState();
  const currentGuideDismissals = state.guideDismissals;
  let newGuideDismissals = [...currentGuideDismissals];
  newGuideDismissals.push(id);
  setState({guideDismissals: newGuideDismissals, guideShowing: false});
}

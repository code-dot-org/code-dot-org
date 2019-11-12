import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';

const guides = [
  {
    id: 'fishvtrash-training-init',
    text: "Let's clean up the ocean!",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'TopLeft',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-training-init2',
    text: 'Use these two buttons to train A.I.',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'BottomMiddleButtons'
  },
  {
    id: 'fishvtrash-training-done',
    text: "Great work!  You can continue when you're ready.",
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount > 15; // TODO: 40
      }
    },
    style: 'BottomRightNarrow',
    hideBackground: true
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
    style: 'BottomMiddleButtons',
    hideBackground: true
  },
  {
    id: 'fishvtrash-predicting-init',
    text: 'Does A.I. know what a fish looks like?',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-predicting-init2',
    text: "Let's see!",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    style: 'BottomRight',
    hideBackground: true
  },
  {
    id: 'fishvtrash-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} random objects, A.I. identified ${
        state.totalPondFish
      } that belong in water.`;
    },
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    },
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-pond-init2',
    text: 'How did A.I do?',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-pond-init3',
    text: 'Try clicking some fish to see how confident A.I. was.',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'creaturesvtrash-predicting-init',
    text: 'A.I. has learned to remove objects it identifies as "Not Fish".',
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'creaturesvtrash-predicting-init2',
    text: 'What unintended consequences might this lead to?',
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'creaturesvtrash-predicting-init3',
    text: "Let's see!",
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    style: 'BottomRight',
    hideBackground: true
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause1',
    text: 'There are lots of creatures in the sea who don’t look like fish.',
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    },
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause2',
    text: 'But that doesn’t mean they should be removed!',
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    },
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'creaturesvtrash-predicting-pause3',
    text: 'A.I. only knows what we teach it!',
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    },
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'creaturesvtrash-training-init',
    text: 'Let’s train A.I. again!',
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Training},
    style: 'BottomMiddleButtons',
    hideBackground: true
  },
  {
    id: 'creaturesvtrash-training-keeptraining',
    text: 'Keep training!',
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'BottomRight',
    hideBackground: true
  },
  {
    id: 'creaturesvtrash-predicting-init',
    text:
      'Now let’s see if A.I. does a better job separating what should be in the ocean and what shouldn’t.',
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'creaturesvtrash-predicting-init2',
    text: "Let's go!",
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Predicting},
    style: 'BottomRight',
    hideBackground: true
  },
  {
    id: 'creaturesvtrash-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} random objects, A.I. identified ${
        state.totalPondFish
      } that belong in water.`;
    },
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    },
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'creaturesvtrash-pond-init2',
    text: 'How did A.I do?',
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Pond},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishshort-predicting-init',
    textFn: state => {
      return `Nice work! Your training data has programmed A.I. to recognize ${state.word.toLowerCase()} fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishshort-predicting-init',
    textFn: state => {
      return `Let’s run A.I.’s program and see how it works.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    hideBackground: true,
    arrow: 'none'
  },
  {
    id: 'fishshort-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} objects, A.I. identified ${
        state.totalPondFish
      } that ${state.fishData.length === 1 ? 'is' : 'are'} ${state.word.toLowerCase()}.`;
    },
    when: {
      appMode: AppMode.FishShort,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    },
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishshort-pond-init2',
    text: 'How did A.I do?',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Pond},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishlong-predicting-init',
    textFn: state => {
      return `Nice work! Your training data has programmed A.I. to recognize ${state.word.toLowerCase()} fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishlong-predicting-init2',
    textFn: state => {
      return `Let’s run A.I.’s program and see how it works.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    hideBackground: true,
    arrow: 'none'
  },
  {
    id: 'fishlong-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} objects, A.I. identified ${
        state.totalPondFish
      } that ${state.fishData.length === 1 ? 'is' : 'are'} ${state.word.toLowerCase()}.`;
    },
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    },
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishlong-pond-init2',
    text: 'How did A.I do?',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond},
    style: 'BottomMiddle',
    arrow: 'none'
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

export function dismissCurrentGuide() {
  const currentGuide = getCurrentGuide();

  // If we have a current guide, and it's actually showing (rather than still
  // typing).
  if (currentGuide && getState().guideShowing) {
    const state = getState();
    const currentGuideDismissals = state.guideDismissals;
    let newGuideDismissals = [...currentGuideDismissals];
    newGuideDismissals.push(currentGuide.id);
    setState({guideDismissals: newGuideDismissals, guideShowing: false});
  }
}

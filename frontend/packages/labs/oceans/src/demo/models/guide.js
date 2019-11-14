import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';

const guides = [
  {
    id: 'fishvtrash-training-init',
    text: "Garbage dumped in the ocean and rivers affects water health and marine life.  In this activity you will program an artificial intelligence (AI) to identify trash.  Let's clean up the ocean!",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'Center',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-training-init2',
    text: "Let's meet A.I.",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'TopRight',
  },
  {
    id: 'fishvtrash-training-init3',
    text: 'A.I. does not know if an object is a fish or trash, but it can process different images and identify patterns.',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'BottomRightCenter',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-training-init4',
    text: "To program A.I., use the buttons to label an image as either 'fish' or 'not fish'. This will train A.I. to do it on its own. Let's get started!",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'BottomMiddle',
  },
  {
    id: 'fishvtrash-training-pause1',
    text: "Did you know 1 in 3 people do not have access to clean water?  Keep training to help A.I. identify trash in the water!",
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'BottomRightCenter',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-training-pause2',
    text: 'Access to clean water could reduce global diseases by 10%.  Keep training to help clean the water!',
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15; // TODO: 40
      }
    },
    style: 'BottomRightCenter',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-training-pause3',
    text: 'Great work! You can keep training or Continue when ready.',
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 40;
      }
    },
    style: 'BottomRightCenter',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-predicting-init',
    text: "Now let's see if A.I. knows what a 'fish' looks like.",
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    style: 'BottomRight',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-predicting-init2',
    text: 'A.I. will look at each object and label it based on your training.',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    style: 'BottomRight',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-predicting-init3',
    text: 'Click Run.',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    style: 'BottomRight',
    hideBackground: true
  },
  {
    id: 'fishvtrash-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} random objects, A.I. identified ${
        state.totalPondFish
      } as 'fish'.`;
    },
    //TODO after doing a 2nd training iteration these messages no longer show
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
    text: 'How did A.I. do?',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishvtrash-pond-init3',
    text: 'You can train A.I. more...',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    style: 'BottomLeft'
  },
  {
    id: 'fishvtrash-pond-init4',
    text: '...or Continue.',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    style: 'BottomRight'
  },
//  {
//    id: 'fishvtrash-pond-init5',
//    text: 'Try clicking some fish to see how confident A.I. was.',
//    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
//    style: 'BottomMiddle',
//    arrow: 'none'
//  },
  {
    id: 'creaturesvtrash-predicting-init',
    text: "A.I. was trained to identify objects as 'Fish' or 'Not Fish'.",
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
    text: 'There are lots of creatures in the ocean who don’t look like fish.',
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
    style: 'BottomMiddle',
  },
  {
    id: 'creaturesvtrash-predicting-init',
    text: "Now let’s see if A.I. does a better job identifying what should be in the ocean and what shouldn’t.",
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
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
    id: 'fishshort-words-init',
    text: 'AI and machine learning can be used to teach a computer new things.',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishshort-words-init2',
    text: 'What else can we program a computer to learn?',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishshort-words-init3',
    text: "Next, let's teach A.I. a new word by showing it examples of that type of fish.",
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishshort-predicting-init',
    textFn: state => {
      return `Nice work! Your training data programmed A.I. to recognize '${state.word.toLowerCase()}' fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishshort-predicting-init2',
    textFn: state => {
      return `Let’s see A.I. identify '${state.word.toLowerCase()}' fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishshort-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} random fish, A.I. identified ${
        state.totalPondFish
      } that ${state.fishData.length === 1 ? 'is' : 'are'} '${state.word.toLowerCase()}'.`;
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
    id: 'fishlong-words-init',
    text: 'What if the words are more subjective? Can A.I. still learn the word?',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Words},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishlong-predicting-init',
    textFn: state => {
      return `Nice work! Your training data programmed A.I. to recognize '${state.word.toLowerCase()}' fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishlong-predicting-init2',
    textFn: state => {
      return `Let’s see A.I. identify '${state.word.toLowerCase()}' fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting},
    style: 'BottomMiddle',
    arrow: 'none'
  },
  {
    id: 'fishlong-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} random fish, A.I. identified ${
        state.totalPondFish
      } that ${state.fishData.length === 1 ? 'is' : 'are'} '${state.word.toLowerCase()}'.`;
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
  },
  {
    id: 'fishlong-pond-init3',
    text: 'You can train A.I. more...',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond},
    style: 'BottomLeft'
  },
  {
    id: 'fishlong-pond-init4',
    text: '...or Continue.',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond},
    style: 'BottomRight'
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

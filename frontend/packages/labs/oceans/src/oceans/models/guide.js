import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';
import {queryStrFor} from '../helpers';
import turtleImage from '@public/images/turtle-large.png';
import seahorseImage from '@public/images/seahorse-large.png';
import trashBottleImage from '@public/images/bottle-large.png';
import trashCanImage from '@public/images/can-large.png';

const imageStyleOverrides = {
  turtle: {bottom: '1%', left: '6%'},
  seahorse: {bottom: '2%', left: '14%'},
  bottle: {bottom: '1%', left: '20%'},
  can: {bottom: '2%', left: '16%'}
};

const guides = [
  {
    id: 'fishvtrash-training-init1',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training}
  },
  {
    id: 'fishvtrash-training-init2',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    arrow: 'BotRight'
  },
  {
    id: 'fishvtrash-training-init3',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training}
  },
  {
    id: 'fishvtrash-training-init4',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'Center',
    arrow: 'LowerCenter'
  },
  {
    id: 'fishvtrash-training-pause1',
    hasHeading: true,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'Info',
    image: trashBottleImage,
    imageStyle: imageStyleOverrides.bottle
  },
  {
    id: 'fishvtrash-training-pause2',
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    }
  },
  {
    id: 'fishvtrash-training-pause3',
    hasHeading: true,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    },
    style: 'Info',
    image: trashCanImage,
    imageStyle: imageStyleOverrides.can
  },
  {
    id: 'fishvtrash-training-pause4',
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    }
  },
  {
    id: 'fishvtrash-training-pause5',
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 30;
      }
    }
  },
  {
    id: 'fishvtrash-predicting-init1',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'fishvtrash-predicting-init2',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'fishvtrash-predicting-init3',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'fishvtrash-pond-init1',
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  {
    id: 'fishvtrash-pond-recall',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'UpperRight'
  },
  {
    id: 'fishvtrash-pond-init2',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'LowerLeft'
  },
  {
    id: 'fishvtrash-pond-init3',
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrashdemo-predicting-init1',
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrashdemo-predicting-init2',
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrashdemo-predicting-init3',
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrashdemo-predicting-init4',
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause1',
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause2',
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause3',
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause4',
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    },
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrash-training-init1',
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Training}
  },
  {
    id: 'creaturesvtrash-training-init2',
    hasHeadong: true,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'Info',
    image: seahorseImage,
    imageStyle: imageStyleOverrides.seahorse
  },
  {
    id: 'creaturesvtrash-training-init3',
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    }
  },
  {
    id: 'creaturesvtrash-training-init4',
    hasHeading: true,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    },
    style: 'Info',
    image: turtleImage,
    imageStyle: imageStyleOverrides.turtle
  },
  {
    id: 'creaturesvtrash-training-init5',
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    }
  },
  {
    id: 'creaturesvtrash-training-init6',
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 30;
      }
    }
  },
  {
    id: 'creaturesvtrash-predicting-init1',
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrash-pond-init1',
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  {
    id: 'fishshort-words-init1',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-words-init2',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-words-training-pause1',
    when: {
      appMode: AppMode.FishShort,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 10;
      }
    }
  },
  {
    id: 'fishshort-words-training-pause2',
    when: {
      appMode: AppMode.FishShort,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 30;
      }
    }
  },
  {
    id: 'fishshort-predicting-init1',
    textFn: state => {
      return `With your training data, you have programmed A.I. to recognize “${state.word.toLowerCase()}” fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting}
  },
  {
    id: 'fishshort-predicting-init2',
    textFn: state => {
      return `Let’s see A.I. identify “${state.word.toLowerCase()}” fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting}
  },
  {
    id: 'fishshort-pond-init1',
    textFn: state => {
      return `Based on your training, A.I. identified ${
        state.fishData.length === 1 ? 'this' : 'these'
      } fish as “${state.word.toLowerCase()}”.  How did A.I. do?  You can Train More if you want to improve the results.`;
    },
    when: {
      appMode: AppMode.FishShort,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  {
    id: 'fishshort-pond-init2',
    text: 'Click on the info button to see what A.I. learned.',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Pond},
    arrow: 'UpperFarRight'
  },
  {
    id: 'fishlong-words-init1',
    text: 'Now let’s see if A.I. can learn a less obvious word.',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Words}
  },
  {
    id: 'fishlong-words-init2',
    text:
      'Let’s teach A.I. a word that depends on your opinion.  It is up to you to pick fish that match your word.',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Words}
  },
  {
    id: 'fishlong-training-pause1',
    text: `Is it fair to use artificial intelligence to judge a fish by its looks?  While AI might seem fair and neutral, its analysis comes from the training we provide.  What unintended bias could this cause?`,
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount > 5;
      }
    }
  },
  {
    id: 'fishlong-training-pause2',
    text: `More training data will help A.I. learn your word.  Keep training.`,
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 30;
      }
    }
  },
  {
    id: 'fishlong-training-pause3',
    text: `Each choice you make can help A.I. learn.  Keep training.`,
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 50;
      }
    }
  },
  {
    id: 'fishlong-training-pause4',
    text: `Do you think A.I. has enough training data?  A.I. will do better with a lot of data.  Continue when you think A.I. is ready.`,
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 100;
      }
    }
  },
  {
    id: 'fishlong-training-many',
    text: `Wow.  That’s a lot of fish!`,
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 300;
      }
    }
  },
  {
    id: 'fishlong-predicting-init1',
    textFn: state => {
      return `With your training data, you have programmed A.I. to recognize “${state.word.toLowerCase()}” fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting}
  },
  {
    id: 'fishlong-predicting-init2',
    textFn: state => {
      return `Let’s see A.I. identify “${state.word.toLowerCase()}” fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting}
  },
  {
    id: 'fishlong-pond-init1',
    textFn: state => {
      return `Based on your training, A.I. identified ${
        state.fishData.length === 1 ? 'this' : 'these'
      } fish as “${state.word.toLowerCase()}”.  How did A.I do?`;
    },
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  {
    id: 'fishlong-pond-init2',
    text: `You can Train More if you want to improve the results.`,
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond},
    arrow: 'LowerLeft'
  },
  {
    id: 'fishlong-pond-init3',
    text: `Or you can teach A.I. a new word by choosing New Word.`,
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond},
    arrow: 'LowishRight'
  }
];

export function getCurrentGuide() {
  if (queryStrFor('guide') === 'off') {
    return null;
  }

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
        if (state.i18n[guide.id]) {
          guide.text = state.i18n[guide.id]();
        }
        if (guide.hasHeading && state.i18n[`${guide.id}-heading`]) {
          guide.heading = state.i18n[`${guide.id}-heading`]();
        }
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

    return true;
  }

  return false;
}

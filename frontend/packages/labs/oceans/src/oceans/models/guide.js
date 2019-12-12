import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';
import {queryStrFor} from '../helpers';
import turtleImage from '@public/images/turtle-large.png';
import seahorseImage from '@public/images/seahorse-large.png';
import trashBottleImage from '@public/images/bottle-large.png';
import trashCanImage from '@public/images/can-large.png';
import * as I18n from '../i18n';

const imageStyleOverrides = {
  turtle: {bottom: '1%', left: '6%'},
  seahorse: {bottom: '2%', left: '14%'},
  bottle: {bottom: '1%', left: '20%'},
  can: {bottom: '2%', left: '16%'}
};

const guides = [
  {
    id: 'fishvtrash-training-init1',
    textFn: () => {
      return I18n.t('fishvtrash-training-init1');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training}
  },
  {
    id: 'fishvtrash-training-init2',
    textFn: () => {
      return I18n.t('fishvtrash-training-init2');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    arrow: 'BotRight'
  },
  {
    id: 'fishvtrash-training-init3',
    textFn: () => {
      return I18n.t('fishvtrash-training-init3');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training}
  },
  {
    id: 'fishvtrash-training-init4',
    textFn: () => {
      return I18n.t('fishvtrash-training-init4');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'Center',
    arrow: 'LowerCenter'
  },
  {
    id: 'fishvtrash-training-pause1',
    textFn: () => {
      return I18n.t('fishvtrash-training-pause1');
    },
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'Info',
    didYouKnow: true,
    image: trashBottleImage,
    imageStyle: imageStyleOverrides.bottle
  },
  {
    id: 'fishvtrash-training-pause2',
    textFn: () => {
      return I18n.t('fishvtrash-training-pause2');
    },
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
    textFn: () => {
      return I18n.t('fishvtrash-training-pause3');
    },
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    },
    didYouKnow: true,
    style: 'Info',
    image: trashCanImage,
    imageStyle: imageStyleOverrides.can
  },
  {
    id: 'fishvtrash-training-pause4',
    textFn: () => {
      return I18n.t('fishvtrash-training-pause4');
    },
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
    textFn: () => {
      return I18n.t('fishvtrash-training-pause5');
    },
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
    textFn: () => {
      return I18n.t('fishvtrash-predicting-init1');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'fishvtrash-predicting-init2',
    textFn: () => {
      return I18n.t('fishvtrash-predicting-init2');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'fishvtrash-predicting-init3',
    textFn: () => {
      return I18n.t('fishvtrash-predicting-init3');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'fishvtrash-pond-init1',
    textFn: () => {
      return I18n.t('fishvtrash-pond-init1');
    },
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
    textFn: () => {
      return I18n.t('fishvtrash-pond-recall');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'UpperRight'
  },
  {
    id: 'fishvtrash-pond-init2',
    textFn: () => {
      return I18n.t('fishvtrash-pond-init2');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'LowerLeft'
  },
  {
    id: 'fishvtrash-pond-init3',
    textFn: () => {
      return I18n.t('fishvtrash-pond-init3');
    },
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrashdemo-predicting-init1',
    textFn: () => {
      return I18n.t('creaturesvtrashdemo-predicting-init1');
    },
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrashdemo-predicting-init2',
    textFn: () => {
      return I18n.t('creaturesvtrashdemo-predicting-init2');
    },
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrashdemo-predicting-init3',
    textFn: () => {
      return I18n.t('creaturesvtrashdemo-predicting-init3');
    },
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrashdemo-predicting-init4',
    textFn: () => {
      return I18n.t('creaturesvtrashdemo-predicting-init4');
    },
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause1',
    textFn: () => {
      return I18n.t('creaturesvtrashdemo-predicting-pause1');
    },
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause2',
    textFn: () => {
      return I18n.t('creaturesvtrashdemo-predicting-pause2');
    },
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause3',
    textFn: () => {
      return I18n.t('creaturesvtrashdemo-predicting-pause3');
    },
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause4',
    textFn: () => {
      return I18n.t('creaturesvtrashdemo-predicting-pause4');
    },
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
    textFn: () => {
      return I18n.t('creaturesvtrash-training-init1');
    },
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Training}
  },
  {
    id: 'creaturesvtrash-training-init2',
    textFn: () => {
      return I18n.t('creaturesvtrash-training-init2');
    },
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    didYouKnow: true,
    style: 'Info',
    image: seahorseImage,
    imageStyle: imageStyleOverrides.seahorse
  },
  {
    id: 'creaturesvtrash-training-init3',
    textFn: () => {
      return I18n.t('creaturesvtrash-training-init3');
    },
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
    textFn: () => {
      return I18n.t('creaturesvtrash-training-init4');
    },
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    },
    didYouKnow: true,
    style: 'Info',
    image: turtleImage,
    imageStyle: imageStyleOverrides.turtle
  },
  {
    id: 'creaturesvtrash-training-init5',
    textFn: () => {
      return I18n.t('creaturesvtrash-training-init5');
    },
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
    textFn: () => {
      return I18n.t('creaturesvtrash-training-init6');
    },
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
    textFn: () => {
      return I18n.t('creaturesvtrash-predicting-init1');
    },
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrash-pond-init1',
    textFn: () => {
      return I18n.t('creaturesvtrash-pond-init1');
    },
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
    textFn: () => {
      return I18n.t('fishshort-words-init1');
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-words-init2',
    textFn: () => {
      return I18n.t('fishshort-words-init2');
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-words-training-pause1',
    textFn: () => {
      return I18n.t('fishshort-words-training-pause1');
    },
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
    textFn: () => {
      return I18n.t('fishshort-words-training-pause2');
    },
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
      return I18n.t('fishshort-predicting-init1', {
        WORD: state.word.toLowerCase()
      });
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting}
  },
  {
    id: 'fishshort-predicting-init2',
    textFn: state => {
      return I18n.t('fishshort-predicting-init2', {
        WORD: state.word.toLowerCase()
      });
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting}
  },
  {
    id: 'fishshort-pond-init1',
    textFn: state => {
     return I18n.t('fishshort-pond-init1', {
        N: state.fishData.length,
        WORD: state.word.toLowerCase()
      });

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
    textFn: () => {
      return I18n.t('fishshort-pond-init2');
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Pond},
    arrow: 'UpperFarRight'
  },
  {
    id: 'fishlong-words-init1',
    textFn: () => {
      return I18n.t('fishlong-words-init1');
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Words}
  },
  {
    id: 'fishlong-words-init2',
    textFn: () => {
      return I18n.t('fishlong-words-init2');
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Words}
  },
  {
    id: 'fishlong-training-pause1',
    textFn: () => {
      return I18n.t('fishlong-training-pause1');
    },
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
    textFn: () => {
      return I18n.t('fishlong-training-pause2');
    },
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
    textFn: () => {
      return I18n.t('fishlong-training-pause3');
    },
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
    textFn: () => {
      return I18n.t('fishlong-training-pause4');
    },
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
    textFn: () => {
      return I18n.t('fishlong-training-many');
    },
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
      return I18n.t('fishlong-predicting-init1', {
        WORD: state.word.toLowerCase()
      });
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting}
  },
  {
    id: 'fishlong-predicting-init2',
    textFn: state => {
      return I18n.t('fishlong-predicting-init2', {
        WORD: state.word.toLowerCase()
      });
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting}
  },
  {
    id: 'fishlong-pond-init1',
    textFn: state => {
      return I18n.t('fishlong-pond-init1', {
        N: state.fishData.length,
        WORD: state.word.toLowerCase()
      });
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
    textFn: () => {
      return I18n.t('fishlong-pond-init2');
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond},
    arrow: 'LowerLeft'
  },
  {
    id: 'fishlong-pond-init3',
    textFn: () => {
      return I18n.t('fishlong-pond-init3');
    },
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

import {getState, setState} from '../state';
import {AppMode, Modes} from '../constants';
import {queryStrFor} from '../helpers';
import crabImage from '../../../public/images/seaCreatures/Crab.png';
import turtleImage from '../../../public/images/seaCreatures/Turtle.png';
import seahorseImage from '../../../public/images/seaCreatures/Seahorse.png';
import trashBottleImage from '../../../public/images/trash/Trash_Bottle.png';
import trashCanImage from '../../../public/images/trash/Trash_Can.png';
import guideFish1 from '../../../public/images/fish/guideFish/guideFish1.png';

const guides = [
  {
    id: 'fishvtrash-training-init',
    text: `Garbage dumped in the ocean and rivers affects water health and marine life.  In this activity you will "program" or "train" an artificial intelligence (AI) to identify fish or trash.  Let's clean up the ocean!`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    image: guideFish1
  },
  {
    id: 'fishvtrash-training-init2',
    text: `Let's meet A.I.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    arrow: 'BotRight'
  },
  {
    id: 'fishvtrash-training-init3',
    text: `A.I. is an artifical intelligence and does not know if an object is a fish or trash, but it can process different images and identify patterns.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training}
  },
  {
    id: 'fishvtrash-training-init4',
    text: `To program A.I., use the buttons to label an image as either "fish" or "not fish".  This will teach A.I. to do it on its own.  Let's get started!`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Training},
    style: 'Center',
    arrow: 'LowerCenter'
  },
  {
    id: 'fishvtrash-training-pause1',
    heading: 'Did you know?',
    text: `An estimated 17 billion pounds of plastic enters the ocean from land-based sources each year.`,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'Info',
    image: trashBottleImage
  },
  {
    id: 'fishvtrash-training-pause2',
    text: `Keep training to help A.I. identify what trash looks like.`,
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
    heading: 'Did you know?',
    text: `Marine debris comes in many shapes and sizes, ranging from small plastics to glass bottles to rubber tires, and many more.`,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    },
    style: 'Info',
    image: trashCanImage
  },
  {
    id: 'fishvtrash-training-pause4',
    text: `Keep training to help A.I. learn.`,
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
    text: `Great work!  The more training you provide A.I. the better it will do.  You can keep training A.I. or continue when ready.`,
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 30;
      }
    }
  },
  {
    id: 'fishvtrash-predicting-init',
    text: `Now let's see if A.I. knows what a "fish" looks like.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'fishvtrash-predicting-init2',
    text: `A.I. will analyze 100 random objects and label each one based on your training.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'fishvtrash-predicting-init3',
    text: `Let's go!`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Predicting},
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'fishvtrash-pond-init',
    textFn: state => {
      return `A.I. identified ${
        state.totalPondFish
      } objects that match your training data for "fish".  How did A.I. do?`;
    },
    //TODO after doing a 2nd training iteration these messages no longer show
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Pond,
      fn: state => {
        return state.fishData && state.totalPondFish !== null;
      }
    }
  },
  //TODO: placeholder for when we add the See More button
  //  {
  //    id: 'fishvtrash-pond-init2',
  //    text: `To see all the objects that A.I. analyzed click See More.`,
  //    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
  //    style: 'TopLeft',
  //    arrow: 'none'
  //  },
  {
    id: 'fishvtrash-pond-init3',
    text: `You can train A.I. more...`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'LowerLeft'
  },
  {
    id: 'fishvtrash-pond-init4',
    text: `...or Continue.`,
    when: {appMode: AppMode.FishVTrash, currentMode: Modes.Pond},
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrash-predicting-init',
    text: `So far we trained A.I. to identify objects as either "Fish" or "Not Fish".`,
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrash-predicting-init2',
    text: `What if this training data was used to decide what belonged in the water?`,
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    image: crabImage
  },
  {
    id: 'creaturesvtrash-predicting-init3',
    text: `What would happen to other types of sea creatures?  What unintended consequences might our current training approach lead to?`,
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    image: crabImage
  },
  {
    id: 'creaturesvtrash-predicting-init4',
    text: `Let's see.`,
    when: {appMode: AppMode.CreaturesVTrashDemo, currentMode: Modes.Predicting},
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause1',
    text: `Did you notice that some sea creatures were unintentionally labeled as "Not Fish"?`,
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrashdemo-predicting-pause2',
    text: `There are a lot of sea creatures that don't look like fish.  But that doesn’t mean they don't belong in the water.`,
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrash-predicting-pause3',
    text: `A.I. only knows what we teach it.`,
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    }
  },
  {
    id: 'creaturesvtrash-predicting-pause4',
    text: `Let's train A.I. again.`,
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true
    },
    noDimBackground: true,
    arrow: 'LowerRight'
  },
  {
    id: 'creaturesvtrash-training-init',
    text: `Now let’s teach A.I. to learn which objects should be in the water.`,
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Training}
  },
  {
    id: 'creaturesvtrash-training-init2',
    heading: 'Did you know?',
    text: `In the ocean, plastic debris can harm fish, seabirds and marine mammals. This is one of many reasons to keep the oceans clean.`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 5;
      }
    },
    style: 'Info',
    image: seahorseImage
  },
  {
    id: 'creaturesvtrash-training-init3',
    text: `Keep training A.I. to identify what should be in the water.`,
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
    heading: 'Did you know?',
    text: `Marine plastic pollution has impacted at least 267 species worldwide, including 86% of all sea turtle species.`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 15;
      }
    },
    style: 'Info',
    image: turtleImage
  },
  {
    id: 'creaturesvtrash-training-init5',
    text: `Keep training to teach A.I. what belongs in the water.`,
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
    text: `Great work!  The more training you provide A.I. the better it will do.  You can keep training A.I. or continue when ready.`,
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: state => {
        return state.yesCount + state.noCount >= 30;
      }
    }
  },
  {
    id: 'creaturesvtrash-predicting-init',
    text: `Do you think A.I. will now do a better job identifying what should be in the water?  Let's watch.`,
    when: {appMode: AppMode.CreaturesVTrash, currentMode: Modes.Predicting}
  },
  {
    id: 'creaturesvtrash-pond-init',
    textFn: state => {
      return `A.I. identified ${
        state.totalPondFish
      } objects that match your training data for "belongs in water".  How did A.I. do?`;
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
    id: 'fishshort-words-init',
    text: 'AI and machine learning can be used to teach a computer new things.',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-words-init2',
    text: 'What else can we program a computer to learn?',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-words-init3',
    text:
      "Next, let's teach A.I. a new word by showing it examples of that type of fish.",
    when: {appMode: AppMode.FishShort, currentMode: Modes.Words}
  },
  {
    id: 'fishshort-predicting-init',
    textFn: state => {
      return `Nice work! Your training data programmed A.I. to recognize '${state.word.toLowerCase()}' fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting}
  },
  {
    id: 'fishshort-predicting-init2',
    textFn: state => {
      return `Let’s see A.I. identify '${state.word.toLowerCase()}' fish.`;
    },
    when: {appMode: AppMode.FishShort, currentMode: Modes.Predicting}
  },
  {
    id: 'fishshort-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} random fish, A.I. identified ${
        state.totalPondFish
      } that ${
        state.fishData.length === 1 ? 'is' : 'are'
      } '${state.word.toLowerCase()}'.`;
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
    text: 'How did A.I do?',
    when: {appMode: AppMode.FishShort, currentMode: Modes.Pond}
  },
  {
    id: 'fishlong-words-init',
    text:
      'What if the words are more subjective? Can A.I. still learn the word?',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Words}
  },
  {
    id: 'fishlong-predicting-init',
    textFn: state => {
      return `Nice work! Your training data programmed A.I. to recognize '${state.word.toLowerCase()}' fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting}
  },
  {
    id: 'fishlong-predicting-init2',
    textFn: state => {
      return `Let’s see A.I. identify '${state.word.toLowerCase()}' fish.`;
    },
    when: {appMode: AppMode.FishLong, currentMode: Modes.Predicting}
  },
  {
    id: 'fishlong-pond-init',
    textFn: state => {
      return `Out of ${state.fishData.length} random fish, A.I. identified ${
        state.totalPondFish
      } that ${
        state.fishData.length === 1 ? 'is' : 'are'
      } '${state.word.toLowerCase()}'.`;
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
    text: 'How did A.I do?',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond}
  },
  {
    id: 'fishlong-pond-init3',
    text: 'You can train A.I. more...',
    when: {appMode: AppMode.FishLong, currentMode: Modes.Pond},
    arrow: 'LowerLeft'
  },
  {
    id: 'fishlong-pond-init4',
    text: '...or Play Again.',
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

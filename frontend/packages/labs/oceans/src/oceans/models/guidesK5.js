import {AppMode, Modes} from '../constants';
import seahorseImage from '@public/images/seahorse-large.png';
import I18n from '../i18n';

const imageStyleOverrides = {
  turtle: {bottom: '1%', left: '6%'},
  seahorse: {bottom: '2%', left: '14%'},
  bottle: {bottom: '1%', left: '20%'},
  can: {bottom: '2%', left: '16%'}
};

const encourageStopTrainingCountsFishLong = [150, 200, 250];
const encourageStopTrainingCountsDefault = [100, ...encourageStopTrainingCountsFishLong];

const guidesK5 = [
  {
    id: "fishvtrash-training-init1",
    textFn: () => {
      return I18n.t("fishvtrash-training-init1");
    },
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Training },
  },
  {
    id: "fishvtrash-training-init2",
    textFn: () => {
      return I18n.t("fishvtrash-training-init2");
    },
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Training },
    arrow: "BotRight",
  },
  {
    id: "fishvtrash-training-init3",
    textFn: () => {
      return I18n.t("fishvtrash-training-init3");
    },
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Training },
  },
  {
    id: "fishvtrash-training-init4",
    textFn: () => I18n.t("fishvtrash-training-init4"),
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Training },
    style: "Center",
    arrow: "LowerCenter",
  },
  {
    id: "fishvtrash-training-pause2",
    textFn: () => I18n.t("fishvtrash-training-pause2"),
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 15;
      },
    },
  },
  {
    id: "fishvtrash-training-pause5",
    textFn: () => I18n.t("fishvtrash-training-pause5"),
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 50;
      },
    },
  },
  ...encourageStopTrainingCountsDefault.map(count => {
    return {
      id: `fishvtrash-training-generic-please-continue-count-${count}`,
      textFn: () => I18n.t('training-generic-please-continue'),
      when: {
        appMode: AppMode.FishVTrash,
        currentMode: Modes.Training,
        fn: state => {
          return state.yesCount + state.noCount >= count;
        }
      }
    }
  }),
  {
    id: "fishvtrash-predicting-init1",
    textFn: () => I18n.t("fishvtrash-predicting-init1"),
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Predicting },
  },
  {
    id: "fishvtrash-predicting-init2",
    textFn: () => I18n.t("fishvtrash-predicting-init2"),
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Predicting },
  },
  {
    id: "fishvtrash-predicting-init3",
    textFn: () => I18n.t("fishvtrash-predicting-init3"),
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Predicting },
    noDimBackground: true,
    arrow: "LowerRight",
  },
  {
    id: "fishvtrash-pond-init1",
    textFn: () => I18n.t("fishvtrash-pond-init1"),
    when: {
      appMode: AppMode.FishVTrash,
      currentMode: Modes.Pond,
      fn: (state) => {
        return state.fishData && state.totalPondFish !== null;
      },
    },
  },
  {
    id: "fishvtrash-pond-recall",
    textFn: () => I18n.t("fishvtrash-pond-recall"),
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Pond },
    arrow: "UpperRight",
  },
  {
    id: "fishvtrash-pond-init2",
    textFn: () => I18n.t("fishvtrash-pond-init2"),
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Pond },
    arrow: "LowerLeft",
  },
  {
    id: "fishvtrash-pond-init3",
    textFn: () => I18n.t("fishvtrash-pond-init3"),
    when: { appMode: AppMode.FishVTrash, currentMode: Modes.Pond },
    arrow: "LowerRight",
  },
  {
    id: "creaturesvtrashdemo-predicting-init1",
    textFn: () => I18n.t("creaturesvtrashdemo-predicting-init1"),
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
    },
  },
  {
    id: "creaturesvtrashdemo-predicting-init2",
    textFn: () => I18n.t("creaturesvtrashdemo-predicting-init2"),
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
    },
  },
  {
    id: "creaturesvtrashdemo-predicting-init3",
    textFn: () => I18n.t("creaturesvtrashdemo-predicting-init3"),
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
    },
  },
  {
    id: "creaturesvtrashdemo-predicting-init4",
    textFn: () => I18n.t("creaturesvtrashdemo-predicting-init4"),
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
    },
    noDimBackground: true,
    arrow: "LowerRight",
  },
  {
    id: "creaturesvtrashdemo-predicting-pause1",
    textFn: () => I18n.t("creaturesvtrashdemo-predicting-pause1"),
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true,
    },
  },
  {
    id: "creaturesvtrashdemo-predicting-pause2",
    textFn: () => I18n.t("creaturesvtrashdemo-predicting-pause2"),
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true,
    },
  },
  {
    id: "creaturesvtrashdemo-predicting-pause3",
    textFn: () => I18n.t("creaturesvtrashdemo-predicting-pause3"),
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true,
    },
  },
  {
    id: "creaturesvtrashdemo-predicting-pause4",
    textFn: () => I18n.t("creaturesvtrashdemo-predicting-pause4"),
    when: {
      appMode: AppMode.CreaturesVTrashDemo,
      currentMode: Modes.Predicting,
      isPaused: true,
    },
    noDimBackground: true,
    arrow: "LowerRight",
  },
  {
    id: "creaturesvtrash-training-init1",
    textFn: () => I18n.t("creaturesvtrash-training-init1"),
    when: { appMode: AppMode.CreaturesVTrash, currentMode: Modes.Training },
  },
  {
    id: "creaturesvtrash-training-init2",
    textFn: () => I18n.t("creaturesvtrash-training-init2"),
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 15;
      },
    },
    style: "Info",
    image: seahorseImage,
    imageStyle: imageStyleOverrides.seahorse,
  },
  {
    id: "creaturesvtrash-training-init3",
    textFn: () => I18n.t("creaturesvtrash-training-init3"),
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 15;
      },
    },
  },
  {
    id: "creaturesvtrash-training-init6",
    textFn: () => I18n.t("creaturesvtrash-training-init6"),
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 50;
      },
    },
  },
  ...encourageStopTrainingCountsDefault.map(count => {
    return {
      id: `creaturesvtrash-training-generic-please-continue-count-${count}`,
      textFn: () => I18n.t('training-generic-please-continue'),
      when: {
        appMode: AppMode.CreaturesVTrash,
        currentMode: Modes.Training,
        fn: state => {
          return state.yesCount + state.noCount >= count;
        }
      }
    }
  }),
  {
    id: "creaturesvtrash-predicting-init1",
    textFn: () => I18n.t("creaturesvtrash-predicting-init1"),
    when: { appMode: AppMode.CreaturesVTrash, currentMode: Modes.Predicting },
  },
  {
    id: "creaturesvtrash-pond-init1",
    textFn: () => I18n.t("creaturesvtrash-pond-init1"),
    when: {
      appMode: AppMode.CreaturesVTrash,
      currentMode: Modes.Pond,
      fn: (state) => {
        return state.fishData && state.totalPondFish !== null;
      },
    },
  },
  {
    id: "fishshort-words-init1",
    textFn: () => I18n.t("fishshort-words-init1"),
    when: { appMode: AppMode.FishShort, currentMode: Modes.Words },
  },
  {
    id: "fishshort-words-init2",
    textFn: () => I18n.t("fishshort-words-init2"),
    when: { appMode: AppMode.FishShort, currentMode: Modes.Words },
  },
  {
    id: "fishshort-words-training-pause1",
    textFn: () => I18n.t("fishshort-words-training-pause1"),
    when: {
      appMode: AppMode.FishShort,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 10;
      },
    },
  },
  {
    id: "fishshort-words-training-pause2",
    textFn: () => I18n.t("fishshort-words-training-pause2"),
    when: {
      appMode: AppMode.FishShort,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 30;
      },
    },
  },
  {
    id: "fishshort-predicting-init1",
    textFn: (state) =>
      I18n.t("fishshort-predicting-init1", {
        word: state.word.toLowerCase(),
      }),
    when: { appMode: AppMode.FishShort, currentMode: Modes.Predicting },
  },
  {
    id: "fishshort-predicting-init2",
    textFn: (state) =>
      I18n.t("fishshort-predicting-init2", {
        word: state.word.toLowerCase(),
      }),
    when: { appMode: AppMode.FishShort, currentMode: Modes.Predicting },
  },
  {
    id: "fishshort-pond-init1",
    textFn: (state) =>
      I18n.t("fishshort-pond-init1", {
        n: state.fishData.length,
        word: state.word.toLowerCase(),
      }),
    when: {
      appMode: AppMode.FishShort,
      currentMode: Modes.Pond,
      fn: (state) => {
        return state.fishData && state.totalPondFish !== null;
      },
    },
  },
  {
    id: "fishshort-pond-init2",
    textFn: () => I18n.t("fishshort-pond-init2"),
    when: { appMode: AppMode.FishShort, currentMode: Modes.Pond },
    arrow: "UpperFarRight",
  },
  {
    id: "fishlong-words-init1",
    textFn: () => I18n.t("fishlong-words-init1"),
    when: { appMode: AppMode.FishLong, currentMode: Modes.Words },
  },
  {
    id: "fishlong-words-init2",
    textFn: () => I18n.t("fishlong-words-init2"),
    when: { appMode: AppMode.FishLong, currentMode: Modes.Words },
  },
  {
    id: "fishlong-training-pause1",
    textFn: () => I18n.t("fishlong-training-pause1"),
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount > 5;
      },
    },
  },
  {
    id: "fishlong-training-pause2",
    textFn: () => I18n.t("fishlong-training-pause2"),
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 30;
      },
    },
  },
  {
    id: "fishlong-training-pause3",
    textFn: () => I18n.t("fishlong-training-pause3"),
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 50;
      },
    },
  },
  {
    id: "fishlong-training-pause4",
    textFn: () => I18n.t("fishlong-training-pause4"),
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 100;
      },
    },
  },
  ...encourageStopTrainingCountsFishLong.map(count => {
    return {
      id: `fishlong-training-generic-please-continue-count-${count}`,
      textFn: () => I18n.t('training-generic-please-continue'),
      when: {
        appMode: AppMode.FishLong,
        currentMode: Modes.Training,
        fn: state => {
          return state.yesCount + state.noCount >= count;
        }
      }
    }
  }),
  {
    id: "fishlong-training-many",
    textFn: () => I18n.t("fishlong-training-many"),
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Training,
      fn: (state) => {
        return state.yesCount + state.noCount >= 300;
      },
    },
  },
  {
    id: "fishlong-predicting-init1",
    textFn: (state) =>
      I18n.t("fishlong-predicting-init1", {
        word: state.word.toLowerCase(),
      }),
    when: { appMode: AppMode.FishLong, currentMode: Modes.Predicting },
  },
  {
    id: "fishlong-predicting-init2",
    textFn: (state) =>
      I18n.t("fishlong-predicting-init2", {
        word: state.word.toLowerCase(),
      }),
    when: { appMode: AppMode.FishLong, currentMode: Modes.Predicting },
  },
  {
    id: "fishlong-pond-init1",
    textFn: (state) =>
      I18n.t("fishlong-pond-init1", {
        n: state.fishData.length,
        word: state.word.toLowerCase(),
      }),
    when: {
      appMode: AppMode.FishLong,
      currentMode: Modes.Pond,
      fn: (state) => {
        return state.fishData && state.totalPondFish !== null;
      },
    },
  },
  {
    id: "fishlong-pond-init2",
    textFn: () => I18n.t("fishlong-pond-init2"),
    when: { appMode: AppMode.FishLong, currentMode: Modes.Pond },
    arrow: "LowerLeft",
  },
  {
    id: "fishlong-pond-init3",
    textFn: () => I18n.t("fishlong-pond-init3"),
    when: { appMode: AppMode.FishLong, currentMode: Modes.Pond },
    arrow: "LowishRight",
  },
];

export default guidesK5;

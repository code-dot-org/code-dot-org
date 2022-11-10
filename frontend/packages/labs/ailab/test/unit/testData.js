/* Mock state to be used across the testing suite. */

import MessageFormat from "messageformat";

export const regressionState = {
  data: [
    {
      sun: 'high',
      height: 3.8
    },
    {
      sun: 'high',
      height: 3.9
    },
    {
      sun: 'medium',
      height: 2.6
    },
    {
      sun: 'medium',
      height: 2.5
    },
    {
      sun: 'low',
      height: 0.9
    },
    {
      sun: 'low',
      height: 1.6
    }
  ],
  labelColumn: 'height',
  accuracyCheckPredictedLabels: [4.0, 3.75, 2.63, 2.46, 1.6, 1.0],
  accuracyCheckLabels: [5.9, 3.8, 2.6, 2.5, 1.6, 0.7],
  accuracyCheckExamples: [[2], [2], [1], [1], [0], [0]],
  selectedFeatures: ['sun'],
  columnsByDataType: {
    height: 'numerical',
    sun: 'categorical'
  },
  featureNumberKey: {
    'sun': {
      'low' : 0,
      'medium' : 1,
      'high' : 2,
    }
  }
};

export const classificationState = {
  data: [
    {
      weather: 'sunny',
      temp: 'hot',
      play: 'no'
    },
    {
      weather: 'overcast',
      temp: 'hot',
      play: 'yes'
    },
    {
      weather: 'overcast',
      temp: 'mild',
      play: 'yes'
    },
    {
      weather: 'overcast',
      temp: 'cool',
      play: 'yes'
    },
    {
      weather: 'rainy',
      temp: 'mild',
      play: 'yes'
    },
    {
      weather: 'rainy',
      temp: 'cool',
      play: 'no'
    }
  ],
  currentColumn: 'temp',
  labelColumn: 'play',
  selectedFeatures: ['temp', 'weather'],
  columnsByDataType: {
    weather: 'categorical',
    temp: 'categorical',
    play: 'categorical'
  },
  accuracyCheckLabels: [1, 0, 0, 0, 0, 1],
  accuracyCheckExamples: [[0,2], [1,2], [1,1], [1,0], [2,1], [2,0]],
  prediction: 0,
  featureNumberKey: {
    'temp': {
      'cool' : 0,
      'mild' : 1,
      'hot' : 2,
    },
    'play': {
      'yes' : 0,
      'no' : 1
    },
    'weather': {
      'sunny' : 0,
      'overcast' : 1,
      'rainy': 2
    }
  }
};

export const batCountMax = 100;
export const batCountMin = 40;
export const mosquitoCountMax = 10;
export const mosquitoCountMin = 1;

export const allNumericalState = {
  data: [
    {
      batCount: batCountMax,
      mosquitoCount: mosquitoCountMin
    },
    {
      batCount: 90,
      mosquitoCount: 2
    },{
      batCount: 80,
      mosquitoCount: 3
    },{
      batCount: 70,
      mosquitoCount: 4
    },{
      batCount: 60,
      mosquitoCount: 5
    },{
      batCount: 50,
      mosquitoCount: 6
    },{
      batCount: batCountMin,
      mosquitoCount: mosquitoCountMax
    }
  ],
  currentColumn: 'batCount',
  labelColumn: 'mosquitoCount',
  selectedFeatures: ['batCount'],
  columnsByDataType: {
    batCount: 'numerical',
    mosquitoCount: 'numerical'
  }
};

export const premadeDatasetName = 'bats_eat_mozzies';
export const batDatasetDescription = 'Count of bats and mosquitios';
export const batDatasetDescriptionLocalized = 'Localized How many mosquitoes there are.';
export const mosquitoDescription = 'How many mosquitoes there are.';
export const batDatasetUses = 'People can have a fun time learning about bats';
export const batDatasetUsesLocalized = 'Localized People can have a fun time learning about bats';
export const batDatasetMisuses = 'Hunters could use this information to avoid bats';
export const batDatasetMisusesLocalized = 'Localized Hunters could use this information to avoid bats';

export const premadeDatasetState = {
  ...allNumericalState,
  csvfile: 'bats-eat-mozzies.csv',
  metadata: {
    name: premadeDatasetName,
    card: {
      description: batDatasetDescription,
      context: {
        potentialUses: batDatasetUses,
        potentialMisuses: batDatasetMisuses
      }
    },
    defaultLabelColumn: 'mosquitoCount',
    fields: [
      {
        id: 'mosquitoCount',
        type: 'numerical',
        description: mosquitoDescription
      },
      {
        id: 'batCount',
        type: 'numerical',
        description: 'How many bats there are.'
      }
    ]
  }
}

export const premadeDatasetTranslations = new MessageFormat('en').compile({
  datasets: {
    bats_eat_mozzies: {
      fields: {
        mosquitoCount: {
          description: "mosquitoCount description"
        }
      },
      card: {
        description: batDatasetDescriptionLocalized,
        context: {
          potentialUses: batDatasetUsesLocalized,
          potentialMisuses: batDatasetMisusesLocalized
        }
      }
    }
  }
});

export const playDatasetDescription = "Survey of the weather, temperature and whether it was a good day to play outside.";

export const userUploadedDatasetState = {
  ...classificationState,
  csvfile: {
    name: 'play-outside-today?.csv',
  },
  trainedModelDetails: {
    datasetDescription: playDatasetDescription
  }
}

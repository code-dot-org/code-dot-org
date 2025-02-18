import React from 'react';

import MazeThumbnail from './MazeThumbnail';

const sampleMap = [
  [0, 0, 0, 4, 0, 0, 0, 0],
  [0, 0, 0, 1, 0, 1, 0, 0],
  [0, 0, 2, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 0, 0, 0, 0, 1, 1, 4],
  [0, 0, 0, 0, 0, 1, 0, 0],
  [0, 3, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0],
];

const collectorMap = [
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 1},
    {tileType: 1, value: 1, range: 1},
    {tileType: 1},
    {tileType: 1, value: 2, range: 2},
    {tileType: 1},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 1, value: 4, range: 4},
    {tileType: 0},
    {tileType: 1},
    {tileType: 0},
    {tileType: 1, value: 3, range: 3},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 1},
    {tileType: 1},
    {tileType: 2},
    {tileType: 1},
    {tileType: 1},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 1, value: 3, range: 3},
    {tileType: 0},
    {tileType: 1},
    {tileType: 0},
    {tileType: 1, value: 1, range: 1},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 1},
    {tileType: 1, value: 2, range: 2},
    {tileType: 1},
    {tileType: 1, value: 4, range: 4},
    {tileType: 1},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
];

const beeMap = [
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 2},
    {tileType: 1, featureType: 1, value: 1, flowerColor: 0, range: 1},
    {tileType: 1},
    {tileType: 1},
    {tileType: 1, featureType: 1, value: 1, flowerColor: 0, range: 1},
    {tileType: 1},
    {tileType: 1, featureType: 1, value: 1, flowerColor: 0, range: 1},
    {tileType: 1, featureType: 1, value: 1, flowerColor: 0, range: 1},
  ],
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
  [
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
    {tileType: 0},
  ],
];

const harvesterMap = [
  [
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
  ],
  [
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {
      tileType: 1,
      value: 1,
      range: 1,
      possibleFeatures: [2],
      startsHidden: false,
    },
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {
      tileType: 1,
      value: 1,
      range: 1,
      possibleFeatures: [1],
      startsHidden: false,
    },
    {tileType: 2, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
  ],
  [
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {
      tileType: 1,
      value: 1,
      range: 1,
      possibleFeatures: [1],
      startsHidden: false,
    },
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
  ],
  [
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
  ],
  [
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
  ],
  [
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
  ],
  [
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {
      tileType: 1,
      value: 1,
      range: 1,
      possibleFeatures: [2],
      startsHidden: false,
    },
    {
      tileType: 1,
      value: 1,
      range: 1,
      possibleFeatures: [1],
      startsHidden: false,
    },
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {
      tileType: 1,
      value: 1,
      range: 1,
      possibleFeatures: [2],
      startsHidden: false,
    },
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
  ],
  [
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 1, possibleFeatures: [0], startsHidden: false},
    {tileType: 0, possibleFeatures: [0], startsHidden: false},
  ],
];

export default {
  component: MazeThumbnail,
};

// Template
const Template = args => <MazeThumbnail {...args} />;

// Stories
export const AngryBirds = Template.bind({});
AngryBirds.args = {
  mazeSummary: {map: sampleMap, level: {startDirection: 1}, skin: 'birds'},
};

export const PlantsVsZombies = Template.bind({});
PlantsVsZombies.args = {
  mazeSummary: {map: sampleMap, level: {startDirection: 1}, skin: 'pvz'},
};

export const Scrat = Template.bind({});
Scrat.args = {
  mazeSummary: {map: sampleMap, level: {startDirection: 1}, skin: 'scrat'},
};

export const Farmer = Template.bind({});
Farmer.args = {
  mazeSummary: {map: sampleMap, level: {startDirection: 1}, skin: 'farmer'},
};

export const FarmerNight = Template.bind({});
FarmerNight.args = {
  mazeSummary: {
    map: sampleMap,
    level: {startDirection: 1},
    skin: 'farmer_night',
  },
};

export const Bee = Template.bind({});
Bee.args = {
  mazeSummary: {
    map: beeMap,
    level: {startDirection: 1, flowerType: 'redWithNectar'},
    skin: 'bee',
  },
};

export const Harvester = Template.bind({});
Harvester.args = {
  mazeSummary: {
    map: harvesterMap,
    level: {startDirection: 1},
    skin: 'harvester',
  },
};

export const Collector = Template.bind({});
Collector.args = {
  mazeSummary: {
    map: collectorMap,
    level: {startDirection: 1},
    skin: 'collector',
  },
};

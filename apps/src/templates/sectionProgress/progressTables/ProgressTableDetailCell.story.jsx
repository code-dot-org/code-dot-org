import React from 'react';

import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

import {
  fakeLevels,
  fakeLevel,
  fakeProgressForLevels,
} from '../../progress/progressTestHelpers';

import ProgressTableDetailCell from './ProgressTableDetailCell';

const statusForLevel = [
  LevelStatus.perfect,
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.submitted,
];
const levels = fakeLevels(5);
levels[0].isConceptLevel = true;

const diamondLevels = fakeLevels(2);
diamondLevels[0].isConceptLevel = true;
diamondLevels[1].isConceptLevel = true;

const unpluggedLevel = fakeLevel({id: 2, isUnplugged: true});

const studentProgress = fakeProgressForLevels(levels);
levels.forEach(
  (level, index) => (studentProgress[level.id].status = statusForLevel[index])
);

const pairedProgress = fakeProgressForLevels(levels);
pairedProgress[levels[0].id].paired = true;

const sublevels = fakeLevels(5);
sublevels.forEach((sub, index) => {
  sub.bubbleText = String.fromCharCode('a'.charCodeAt(0) + index);
});
const levelWithSublevels = fakeLevels(1)[0];
levelWithSublevels.sublevels = sublevels;

export default {
  component: ProgressTableDetailCell,
};

const DEFAULT_PROPS = {
  studentId: 1,
  sectionId: 1,
};

/**
 * This places the component in the same table structure that will be rendered
 * by the component's parents, to ensure that the same layout styles are applied.
 */
const Template = args => (
  <div className="progress-table">
    <div className="content-view">
      <table className="detail-view">
        <tbody>
          <tr>
            <td>
              <ProgressTableDetailCell {...DEFAULT_PROPS} {...args} />
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
);

export const LevelWithSublevels = Template.bind({});
LevelWithSublevels.args = {
  levels: [levelWithSublevels],
  studentProgress: studentProgress,
};

export const BasicBubbles = Template.bind({});
BasicBubbles.args = {
  levels: levels,
  studentProgress: studentProgress,
};

export const DiamondBubbles = Template.bind({});
DiamondBubbles.args = {
  levels: diamondLevels,
  studentProgress: studentProgress,
};

export const IncludesPairedLevel = Template.bind({});
IncludesPairedLevel.args = {
  levels: levels,
  studentProgress: pairedProgress,
};

export const FirstLevelUnplugged = Template.bind({});
FirstLevelUnplugged.args = {
  levels: [unpluggedLevel, ...levels],
  studentProgress: studentProgress,
};

export const OnlyLevelUnplugged = Template.bind({});
OnlyLevelUnplugged.args = {
  levels: [unpluggedLevel],
  studentProgress: studentProgress,
};

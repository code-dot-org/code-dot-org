import React from 'react';
import ProgressTableDetailCell from './ProgressTableDetailCell';
import {
  fakeLevels,
  fakeLevel,
  fakeProgressForLevels
} from '../../progress/progressTestHelpers';
import {LevelStatus} from '@cdo/apps/util/sharedConstants';

const statusForLevel = [
  LevelStatus.perfect,
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.submitted
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

/**
 * This wrapper places the component in the same table structure that will be
 * rendered by the component's parents, to ensure that the same layout styles
 * are applied.
 */
function wrapped(component) {
  return (
    <div className="progress-table">
      <div className="content-view">
        <table className="detail-view">
          <tbody>
            <tr>
              <td>{component}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default storybook => {
  storybook
    .storiesOf('SectionProgress/ProgressTableDetailCell', module)
    .addStoryTable([
      {
        name: 'level with sublevels',
        description: 'Should show small dots for sublevels',
        story: () =>
          wrapped(
            <ProgressTableDetailCell
              studentId={1}
              sectionId={1}
              levels={[levelWithSublevels]}
              studentProgress={studentProgress}
            />
          )
      },
      {
        name: 'basic bubbles',
        story: () =>
          wrapped(
            <ProgressTableDetailCell
              studentId={1}
              sectionId={1}
              levels={levels}
              studentProgress={studentProgress}
            />
          )
      },
      {
        name: 'diamond bubbles only',
        description: 'diamonds should be aligned',
        story: () =>
          wrapped(
            <ProgressTableDetailCell
              studentId={1}
              sectionId={1}
              levels={diamondLevels}
              studentProgress={studentProgress}
            />
          )
      },
      {
        name: 'includes a paired level',
        description: 'Should show the pair programming icon',
        story: () =>
          wrapped(
            <ProgressTableDetailCell
              studentId={1}
              sectionId={1}
              levels={levels}
              studentProgress={pairedProgress}
            />
          )
      },
      {
        name: 'first level is unplugged',
        description: 'Should get a pill for unplugged',
        story: () =>
          wrapped(
            <ProgressTableDetailCell
              studentId={1}
              sectionId={1}
              levels={[unpluggedLevel, ...levels]}
              studentProgress={studentProgress}
            />
          )
      },
      {
        name: 'only level is unplugged',
        description: 'Should get a pill for unplugged',
        story: () =>
          wrapped(
            <ProgressTableDetailCell
              studentId={1}
              sectionId={1}
              levels={[unpluggedLevel]}
              studentProgress={studentProgress}
            />
          )
      }
    ]);
};

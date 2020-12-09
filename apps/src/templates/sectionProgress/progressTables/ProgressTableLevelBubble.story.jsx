import React from 'react';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';
import color from '@cdo/apps/util/color';

const statuses = [
  LevelStatus.locked,
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.perfect
];
const assessmentStatuses = [
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.submitted,
  LevelStatus.completed_assessment
];

const wrapperStyle = {
  width: 50,
  height: 50,
  backgroundColor: color.background_gray,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
};

function wrapped(component) {
  return <div style={wrapperStyle}>{component}</div>;
}

function wrapMultiple(components) {
  return (
    <div style={{...wrapperStyle, width: null, height: null}}>
      {components.map(component => component)}
    </div>
  );
}

export default storybook => {
  storybook
    .storiesOf('SectionProgress/ProgressTableLevelBubble', module)
    .addStoryTable(
      []
        .concat(
          statuses.map(status => ({
            name: `regular bubble status: ${status}`,
            story: () =>
              wrapped(
                <ProgressTableLevelBubble
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  disabled={status === LevelStatus.locked}
                  title={'3'}
                  url={'/foo/bar'}
                />
              )
          }))
        )
        .concat(
          statuses.map(status => ({
            name: `concept bubble status: ${status}`,
            story: () =>
              wrapped(
                <ProgressTableLevelBubble
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  disabled={status === LevelStatus.locked}
                  title={'3'}
                  url={'/foo/bar'}
                  concept={true}
                />
              )
          }))
        )
        .concat(
          assessmentStatuses.map(status => ({
            name: `assessment bubble status: ${status}`,
            story: () =>
              wrapped(
                <ProgressTableLevelBubble
                  levelStatus={status}
                  levelKind={LevelKind.assessment}
                  disabled={status === LevelStatus.locked}
                  title={'3'}
                  url={'/foo/bar'}
                />
              )
          }))
        )
        .concat(
          statuses.slice(1).map(status => ({
            name: `paired bubble status: ${status}`,
            story: () =>
              wrapped(
                <ProgressTableLevelBubble
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  disabled={status === LevelStatus.locked}
                  title={'3'}
                  url={'/foo/bar'}
                  paired={true}
                />
              )
          }))
        )
        .concat(
          statuses.map(status => ({
            name: `bonus bubble status: ${status}`,
            story: () =>
              wrapped(
                <ProgressTableLevelBubble
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  disabled={status === LevelStatus.locked}
                  title={'3'}
                  url={'/foo/bar'}
                  bonus={true}
                />
              )
          }))
        )
        .concat([
          {
            name: 'small bubbles',
            story: () =>
              wrapMultiple([
                <ProgressTableLevelBubble
                  levelStatus={LevelStatus.perfect}
                  disabled={false}
                  smallBubble={true}
                  title={'a'}
                  url={'/foo/bar'}
                  key={1}
                />,
                <ProgressTableLevelBubble
                  levelStatus={LevelStatus.attempted}
                  disabled={false}
                  smallBubble={true}
                  title={'b'}
                  url={'/foo/bar'}
                  key={2}
                />,
                <ProgressTableLevelBubble
                  levelStatus={LevelStatus.not_tried}
                  disabled={false}
                  smallBubble={true}
                  title={'c'}
                  url={'/foo/bar'}
                  key={3}
                />
              ])
          }
          //   {
          //     name: 'bubble with no url',
          //     story: () => (
          //       <ProgressTableLevelBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           icon: 'fa-document',
          //           kind: LevelKind.level
          //         }}
          //         studentLevelProgress={perfectProgress}
          //         disabled={false}
          //       />
          //     )
          //   },
          //   {
          //     name: 'disabled bubble',
          //     description: 'Should not be clickable or show progress',
          //     story: () => (
          //       <ProgressTableLevelBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           icon: 'fa-document',
          //           kind: LevelKind.level,
          //           url: '/foo/bar'
          //         }}
          //         studentLevelProgress={perfectProgress}
          //         disabled={true}
          //       />
          //     )
          //   },
          //   {
          //     name: 'hidden tooltips bubble',
          //     description: 'should not have tooltips',
          //     story: () => (
          //       <ProgressTableLevelBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           kind: LevelKind.level,
          //           url: '/foo/bar',
          //           icon: 'fa-document'
          //         }}
          //         studentLevelProgress={perfectProgress}
          //         hideToolTips={true}
          //         disabled={false}
          //       />
          //     )
          //   },
          //   {
          //     name: 'pairing icon bubble - perfect',
          //     description: 'should show the paring icon, completed perfectly',
          //     story: () => (
          //       <ProgressTableLevelBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           kind: LevelKind.level,
          //           url: '/foo/bar',
          //           icon: 'fa-document'
          //         }}
          //         studentLevelProgress={{...perfectProgress, paired: true}}
          //         hideToolTips={true}
          //         disabled={false}
          //         pairingIconEnabled={true}
          //       />
          //     )
          //   },
          //   {
          //     name: 'pairing icon bubble - attempted',
          //     description: 'should show the paring icon, attempted',
          //     story: () => (
          //       <ProgressTableLevelBubble
          //         level={{
          //           id: 1,
          //           levelNumber: 3,
          //           kind: LevelKind.level,
          //           url: '/foo/bar',
          //           icon: 'fa-document'
          //         }}
          //         studentLevelProgress={{
          //           ...levelProgressWithStatus(LevelStatus.attempted),
          //           paired: true
          //         }}
          //         hideToolTips={true}
          //         disabled={false}
          //         pairingIconEnabled={true}
          //       />
          //     )
          //   }
        ])
    );
};

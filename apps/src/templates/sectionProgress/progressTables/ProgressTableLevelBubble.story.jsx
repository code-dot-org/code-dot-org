import React from 'react';
import ProgressTableLevelBubble from './ProgressTableLevelBubble';
import {LevelKind, LevelStatus} from '@cdo/apps/util/sharedConstants';
import color from '@cdo/apps/util/color';
import {BubbleSize} from '@cdo/apps/templates/progress/progressStyles';

const statuses = [
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.passed,
  LevelStatus.perfect
];
const assessmentStatuses = [
  LevelStatus.not_tried,
  LevelStatus.attempted,
  LevelStatus.submitted,
  LevelStatus.completed_assessment,
  LevelStatus.perfect
];

const wrapperStyle = {
  width: 200,
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
      [
        {
          name: `locked bubble`,
          story: () =>
            wrapped(
              <ProgressTableLevelBubble
                levelId={'1'}
                levelStatus={LevelStatus.not_tried}
                levelKind={LevelKind.level}
                isLocked={true}
                title={'3'}
                url={'/foo/bar'}
              />
            )
        }
      ]
        .concat(
          statuses.map(status => ({
            name: `regular bubble status: ${status}`,
            story: () =>
              wrapped(
                <ProgressTableLevelBubble
                  levelId={'2'}
                  levelStatus={status}
                  levelKind={LevelKind.level}
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
                  levelId={'3'}
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  title={'3'}
                  url={'/foo/bar'}
                  isConcept={true}
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
                  levelId={'4'}
                  levelStatus={status}
                  levelKind={LevelKind.assessment}
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
                  levelId={'5'}
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  title={'3'}
                  url={'/foo/bar'}
                  isPaired={true}
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
                  levelId={'6'}
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  title={'3'}
                  url={'/foo/bar'}
                  isBonus={true}
                />
              )
          }))
        )
        .concat(
          statuses.map(status => ({
            name: `unplugged bubble status: ${status}`,
            story: () =>
              wrapped(
                <ProgressTableLevelBubble
                  levelId={'7'}
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  title={'3'}
                  url={'/foo/bar'}
                  isUnplugged={true}
                />
              )
          }))
        )
        .concat([
          {
            name: 'letter bubbles',
            story: () =>
              wrapMultiple([
                <ProgressTableLevelBubble
                  levelId={'8'}
                  levelStatus={LevelStatus.perfect}
                  bubbleSize={BubbleSize.letter}
                  title={'a'}
                  url={'/foo/bar'}
                  key={1}
                />,
                <ProgressTableLevelBubble
                  levelId={'9'}
                  levelStatus={LevelStatus.attempted}
                  bubbleSize={BubbleSize.letter}
                  title={'b'}
                  url={'/foo/bar'}
                  key={2}
                />,
                <ProgressTableLevelBubble
                  levelId={'10'}
                  levelStatus={LevelStatus.not_tried}
                  bubbleSize={BubbleSize.letter}
                  title={'c'}
                  url={'/foo/bar'}
                  key={3}
                />
              ])
          }
        ])
        .concat([
          {
            name: 'dot bubbles',
            story: () =>
              wrapMultiple([
                <ProgressTableLevelBubble
                  levelId={'11'}
                  levelStatus={LevelStatus.perfect}
                  isConcept={true}
                  bubbleSize={BubbleSize.dot}
                  title={'a'}
                  url={'/foo/bar'}
                  key={1}
                />,
                <ProgressTableLevelBubble
                  levelId={'12'}
                  levelStatus={LevelStatus.attempted}
                  bubbleSize={BubbleSize.dot}
                  title={'b'}
                  url={'/foo/bar'}
                  key={2}
                />,
                <ProgressTableLevelBubble
                  levelId={'13'}
                  levelStatus={LevelStatus.not_tried}
                  bubbleSize={BubbleSize.dot}
                  title={'c'}
                  url={'/foo/bar'}
                  key={3}
                />
              ])
          }
        ])
    );
};

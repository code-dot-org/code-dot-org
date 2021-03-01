import React from 'react';
import ProgressTableLevelBubble, {BubbleSize} from './ProgressTableLevelBubble';
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
          name: `disabled bubble`,
          story: () =>
            wrapped(
              <ProgressTableLevelBubble
                levelStatus={LevelStatus.not_tried}
                levelKind={LevelKind.level}
                isDisabled={true}
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
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  isDisabled={status === LevelStatus.locked}
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
                  levelStatus={status}
                  levelKind={LevelKind.assessment}
                  isDisabled={status === LevelStatus.locked}
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
                  isDisabled={status === LevelStatus.locked}
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
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  isDisabled={status === LevelStatus.locked}
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
                  levelStatus={status}
                  levelKind={LevelKind.level}
                  isDisabled={status === LevelStatus.locked}
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
                  levelStatus={LevelStatus.perfect}
                  isDisabled={false}
                  bubbleSize={BubbleSize.letter}
                  title={'a'}
                  url={'/foo/bar'}
                  key={1}
                />,
                <ProgressTableLevelBubble
                  levelStatus={LevelStatus.attempted}
                  isDisabled={false}
                  bubbleSize={BubbleSize.letter}
                  title={'b'}
                  url={'/foo/bar'}
                  key={2}
                />,
                <ProgressTableLevelBubble
                  levelStatus={LevelStatus.not_tried}
                  isDisabled={false}
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
                  levelStatus={LevelStatus.perfect}
                  isDisabled={false}
                  isConcept={true}
                  bubbleSize={BubbleSize.dot}
                  title={'a'}
                  url={'/foo/bar'}
                  key={1}
                />,
                <ProgressTableLevelBubble
                  levelStatus={LevelStatus.attempted}
                  isDisabled={false}
                  bubbleSize={BubbleSize.dot}
                  title={'b'}
                  url={'/foo/bar'}
                  key={2}
                />,
                <ProgressTableLevelBubble
                  levelStatus={LevelStatus.not_tried}
                  isDisabled={false}
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

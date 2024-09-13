import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import firehoseClient from '@cdo/apps/metrics/firehose';
import {ReviewStates} from '@cdo/apps/templates/feedback/types';
import {
  fakeLevel,
  fakeProgressForLevels,
} from '@cdo/apps/templates/progress/progressTestHelpers';
import ProgressTableDetailCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailCell';
import ProgressTableLevelBubble from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelBubble';
import {LevelStatus} from '@cdo/generated-scripts/sharedConstants';

const level_1 = fakeLevel({
  id: '123',
  levelNumber: 1,
  isUnplugged: true,
});
const sublevel_1 = fakeLevel({id: '789', levelNumber: 1});
const level_2 = fakeLevel({id: '456', levelNumber: 2, sublevels: [sublevel_1]});
const level_3 = fakeLevel({id: '999', levelNumber: 3, bonus: true});
const levels = [level_1, level_2, level_3];

const DEFAULT_PROPS = {
  studentId: 1,
  sectionId: 123,
  levels: levels,
  studentProgress: fakeProgressForLevels(levels, LevelStatus.passed, {
    teacher_feedback_review_state: ReviewStates.keepWorking,
  }),
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ProgressTableDetailCell {...props} />);
};

describe('ProgressTableDetailCell', () => {
  beforeEach(() => {
    jest.spyOn(firehoseClient, 'putRecord').mockClear().mockImplementation();
  });

  afterEach(() => {
    firehoseClient.putRecord.mockRestore();
  });

  it('renders nothing if levels array is empty', () => {
    const wrapper = setUp({levels: []});
    expect(Object.keys(wrapper)).toHaveLength(0);
  });

  it('displays a progress table level bubble for each level and sublevel', () => {
    const wrapper = setUp();
    const levelBubble1 = wrapper.findWhere(node => node.key() === '123_1');
    const levelBubble2 = wrapper.findWhere(node => node.key() === '456_2');
    const levelBubble3 = wrapper.findWhere(node => node.key() === '999_3');
    expect(levelBubble1.find(ProgressTableLevelBubble)).toHaveLength(1);
    expect(levelBubble2.find(ProgressTableLevelBubble)).toHaveLength(2); // 1 for level, 1 for sublevel
    expect(levelBubble3.find(ProgressTableLevelBubble)).toHaveLength(1);
  });

  it('passes expected values to ProgressTableLevelBubble', () => {
    const wrapper = setUp();
    const levelBubble3 = wrapper
      .findWhere(node => node.key() === '999_3')
      .find(ProgressTableLevelBubble);
    const levelBubble3Props = levelBubble3.props();
    expect(levelBubble3Props.levelStatus).toBe(LevelStatus.passed);
    expect(levelBubble3Props.isLocked).toBe(false);
    expect(levelBubble3Props.isUnplugged).toBe(false);
    expect(levelBubble3Props.isBonus).toBe(true);
    expect(levelBubble3Props.reviewState).toBe(ReviewStates.keepWorking);
  });

  it('generates the right url for level bubble', () => {
    const wrapper = setUp();
    const levelBubble1 = wrapper.findWhere(node => node.key() === '123_1');
    const url = levelBubble1.find(ProgressTableLevelBubble).props().url;
    expect(url).toBe('/level1?section_id=123&user_id=1');
  });

  it('calls firehose putRecord when clicking a level', () => {
    const wrapper = setUp();
    const levelBubble1 = wrapper
      .findWhere(node => node.key() === '123_1')
      .childAt(0);
    levelBubble1.simulate('click');
    expect(firehoseClient.putRecord).toHaveBeenCalled();
  });

  it('calls firehose putRecord when clicking a sublevel', () => {
    const wrapper = setUp();
    const sublevel = wrapper.findWhere(
      node => node.key() === `${sublevel_1.id}`
    );
    sublevel.simulate('click');
    expect(firehoseClient.putRecord).toHaveBeenCalled();
  });
});

import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableDetailCell from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailCell';
import ProgressTableLevelBubble from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelBubble';
import sinon from 'sinon';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import {
  fakeLevel,
  fakeProgressForLevels
} from '@cdo/apps/templates/progress/progressTestHelpers';

const level_1 = fakeLevel({
  id: '123',
  levelNumber: 1,
  isUnplugged: true
});
const sublevel_1 = fakeLevel({id: '789', levelNumber: 1});
const level_2 = fakeLevel({id: '456', levelNumber: 2, sublevels: [sublevel_1]});
const level_3 = fakeLevel({id: '999', levelNumber: 3, bonus: true});
const levels = [level_1, level_2, level_3];

const DEFAULT_PROPS = {
  studentId: 1,
  sectionId: 123,
  levels: levels,
  studentProgress: fakeProgressForLevels(levels)
};

const setUp = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<ProgressTableDetailCell {...props} />);
};

describe('ProgressTableDetailCell', () => {
  beforeEach(() => {
    sinon.stub(firehoseClient, 'putRecord');
  });

  afterEach(() => {
    firehoseClient.putRecord.restore();
  });

  it('renders nothing if levels array is empty', () => {
    const wrapper = setUp({levels: []});
    expect(wrapper).to.be.empty;
  });

  it('displays a progress table level bubble for each level and sublevel', () => {
    const wrapper = setUp();
    const levelBubble1 = wrapper.findWhere(node => node.key() === '123_1');
    const levelBubble2 = wrapper.findWhere(node => node.key() === '456_2');
    const levelBubble3 = wrapper.findWhere(node => node.key() === '999_3');
    expect(levelBubble1.find(ProgressTableLevelBubble)).to.have.length(1);
    expect(levelBubble2.find(ProgressTableLevelBubble)).to.have.length(2); // 1 for level, 1 for sublevel
    expect(levelBubble3.find(ProgressTableLevelBubble)).to.have.length(1);
  });

  it('generates the right url for level bubble', () => {
    const wrapper = setUp();
    const levelBubble1 = wrapper.findWhere(node => node.key() === '123_1');
    const url = levelBubble1.find(ProgressTableLevelBubble).props().url;
    expect(url).to.equal('/level1?section_id=123&user_id=1');
  });

  it('calls firehose putRecord when clicking a level', () => {
    const wrapper = setUp();
    const levelBubble1 = wrapper
      .findWhere(node => node.key() === '123_1')
      .childAt(0);
    levelBubble1.simulate('click');
    expect(firehoseClient.putRecord).to.have.been.called;
  });

  it('calls firehose putRecord when clicking a sublevel', () => {
    const wrapper = setUp();
    const sublevel = wrapper.findWhere(
      node => node.key() === `${sublevel_1.id}`
    );
    sublevel.simulate('click');
    expect(firehoseClient.putRecord).to.have.been.called;
  });
});

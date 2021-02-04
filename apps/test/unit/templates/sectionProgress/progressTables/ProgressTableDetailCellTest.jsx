import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableDetailCell, {
  unitTestExports
} from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableDetailCell';
import ProgressTableLevelBubble from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelBubble';
import sinon from 'sinon';
import firehoseClient from '@cdo/apps/lib/util/firehose';
import * as progressStyles from '@cdo/apps/templates/progress/progressStyles';
import i18n from '@cdo/locale';
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
  studentProgress: fakeProgressForLevels(levels),
  stageExtrasEnabled: false
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

  it('displays a progress table level bubble for each level and sublevel', () => {
    const wrapper = setUp();
    const levelBubble1 = wrapper.findWhere(node => node.key() === '123_1');
    const levelBubble2 = wrapper.findWhere(node => node.key() === '456_2');
    const levelBubble3 = wrapper.findWhere(node => node.key() === '999_3');
    expect(levelBubble1.find(ProgressTableLevelBubble)).to.have.length(1);
    expect(levelBubble2.find(ProgressTableLevelBubble)).to.have.length(2); // 1 for level, 1 for sublevel
    expect(levelBubble3.find(ProgressTableLevelBubble)).to.have.length(1);
  });

  it('disables progress bubble if there is a bonus and stageExtrasEnabled is false', () => {
    const wrapper = setUp();
    const levelBubble3 = wrapper.findWhere(node => node.key() === '999_3');
    const progressBubble = levelBubble3.find(ProgressTableLevelBubble);
    expect(progressBubble.props().disabled).to.be.true;
  });

  it('disable is false for progress bubble if there is a bonus and stageExtrasEnabled is true', () => {
    const wrapper = setUp({stageExtrasEnabled: true});
    const levelBubble3 = wrapper.findWhere(node => node.key() === '999_3');
    const progressBubble = levelBubble3.find(ProgressTableLevelBubble);
    expect(progressBubble.props().disabled).to.be.false;
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

  it('widthForLevels returns the correct width when there are unplugged levels', () => {
    const levels = [level_1, level_1];
    const unpluggedWidth = unitTestExports.getUnpluggedWidth();
    const expectedWidth = 2 * unpluggedWidth + 2 * progressStyles.CELL_PADDING;
    expect(ProgressTableDetailCell.widthForLevels(levels)).to.equal(
      expectedWidth
    );
  });

  it('getUnpluggedWidth returns the width of the unplugged bubble in english', () => {
    expect(unitTestExports.getUnpluggedWidth()).to.equal(121);
  });

  it('getUnpluggedWidth returns the width of the unplugged bubble in spanish', () => {
    sinon.stub(i18n, 'unpluggedActivity').returns('Actividad fuera de línea');
    expect(unitTestExports.getUnpluggedWidth()).to.equal(147);
  });

  it('widthForLevels returns the correct width when there are no unplugged levels', () => {
    const notUnpluggedLevel = fakeLevel({
      isUnplugged: false
    });
    const levels = [notUnpluggedLevel, notUnpluggedLevel];

    const levelCount = 2;
    const expectedWidth =
      levelCount * progressStyles.BUBBLE_CONTAINER_WIDTH +
      2 * progressStyles.CELL_PADDING;

    expect(ProgressTableDetailCell.widthForLevels(levels)).to.equal(
      expectedWidth
    );
  });

  it('widthForLevels returns the correct width when there are sublevels', () => {
    const levels = [level_2];

    const sublevelCount = level_2.sublevels.length;
    const expectedWidth =
      progressStyles.BUBBLE_CONTAINER_WIDTH +
      sublevelCount * progressStyles.LETTER_BUBBLE_CONTAINER_WIDTH +
      2 * progressStyles.CELL_PADDING;

    expect(ProgressTableDetailCell.widthForLevels(levels)).to.equal(
      expectedWidth
    );
  });
});

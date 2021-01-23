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

const LEVEL_1 = {
  isUnplugged: true,
  sublevels: undefined,
  url: '/level-1',
  id: '123',
  bonus: null,
  isConceptLevel: true,
  bubbleText: '1',
  kind: 'puzzle',
  levelNumber: 1
};

const SUBLEVEL_1 = {
  isUnplugged: true,
  sublevels: undefined,
  url: '/sublevel-1',
  id: '789',
  bonus: null,
  isConceptLevel: true,
  bubbleText: '1',
  kind: 'puzzle',
  levelNumber: 1
};

const LEVEL_2 = {
  isUnplugged: false,
  sublevels: [SUBLEVEL_1],
  url: '/level-2',
  id: '456',
  bonus: null,
  isConceptLevel: true,
  bubbleText: '2',
  kind: 'assessment',
  levelNumber: 2
};

const LEVEL_3 = {
  isUnplugged: false,
  sublevels: undefined,
  url: '/level-3',
  id: '999',
  bonus: true,
  isConceptLevel: true,
  bubbleText: '3',
  kind: 'puzzel',
  levelNumber: 3
};

const DEFAULT_PROPS = {
  studentId: 1,
  sectionId: 123,
  levels: [LEVEL_1, LEVEL_2, LEVEL_3],
  studentProgress: {
    123: {pages: null, paired: false, result: 100, status: 'perfect'},
    456: {pages: null, paired: false, result: 1001, status: 'locked'},
    789: {pages: null, paired: false, result: 100, status: 'locked'}
  },
  stageExtrasEnabled: false
};

describe('ProgressTableDetailCell', () => {
  beforeEach(() => {
    sinon.stub(firehoseClient, 'putRecord');
  });

  afterEach(() => {
    firehoseClient.putRecord.restore();
  });

  it('displays a progress table level bubble for each level and sublevel', () => {
    const wrapper = shallow(<ProgressTableDetailCell {...DEFAULT_PROPS} />);
    const levelBubble1 = wrapper.findWhere(node => node.key() === '123_1');
    const levelBubble2 = wrapper.findWhere(node => node.key() === '456_2');
    const levelBubble3 = wrapper.findWhere(node => node.key() === '999_3');
    expect(levelBubble1.find(ProgressTableLevelBubble)).to.have.length(1);
    expect(levelBubble2.find(ProgressTableLevelBubble)).to.have.length(2); // 1 for level, 1 for sublevel
    expect(levelBubble3.find(ProgressTableLevelBubble)).to.have.length(1);
  });

  it('disables progress bubble if there is a bonus and stageExtrasEnabled is false', () => {
    const wrapper = shallow(<ProgressTableDetailCell {...DEFAULT_PROPS} />);
    const levelBubble3 = wrapper.findWhere(node => node.key() === '999_3');
    const progressBubble = levelBubble3.find(ProgressTableLevelBubble);
    expect(progressBubble.props().disabled).to.be.true;
  });

  it('disable is false for progress bubble if there is a bonus and stageExtrasEnabled is true', () => {
    const props = {...DEFAULT_PROPS, stageExtrasEnabled: true};
    const wrapper = shallow(<ProgressTableDetailCell {...props} />);
    const levelBubble3 = wrapper.findWhere(node => node.key() === '999_3');
    const progressBubble = levelBubble3.find(ProgressTableLevelBubble);
    expect(progressBubble.props().disabled).to.be.false;
  });

  it('generates the right url for level bubble', () => {
    const wrapper = shallow(<ProgressTableDetailCell {...DEFAULT_PROPS} />);
    const levelBubble1 = wrapper.findWhere(node => node.key() === '123_1');
    const url = levelBubble1.find(ProgressTableLevelBubble).props().url;
    expect(url).to.equal('/level-1?section_id=123&user_id=1');
  });

  it('calls firehouse putRecord when clicking a level', () => {
    const wrapper = shallow(<ProgressTableDetailCell {...DEFAULT_PROPS} />);
    const levelBubble1 = wrapper
      .findWhere(node => node.key() === '123_1')
      .childAt(0);
    levelBubble1.simulate('click');
    expect(firehoseClient.putRecord).to.have.been.called;
  });

  it('calls firehouse putRecord when clicking a sublevel', () => {
    const wrapper = shallow(<ProgressTableDetailCell {...DEFAULT_PROPS} />);
    const sublevel = wrapper.findWhere(
      node => node.key() === `${SUBLEVEL_1.id}`
    );
    sublevel.simulate('click');
    expect(firehoseClient.putRecord).to.have.been.called;
  });

  it('widthForLevels returns the correct width when there are unplugged levels', () => {
    const levels = [LEVEL_1, LEVEL_1];
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
    const notUnpluggedLevel = {...LEVEL_1, isUnplugged: false};
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
    const levels = [LEVEL_2];

    const sublevelCount = LEVEL_2.sublevels.length;
    const expectedWidth =
      progressStyles.BUBBLE_CONTAINER_WIDTH +
      sublevelCount * progressStyles.LETTER_BUBBLE_CONTAINER_WIDTH +
      2 * progressStyles.CELL_PADDING;

    expect(ProgressTableDetailCell.widthForLevels(levels)).to.equal(
      expectedWidth
    );
  });
});

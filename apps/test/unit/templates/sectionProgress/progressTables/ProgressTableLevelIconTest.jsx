import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableLevelIcon from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelIcon';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const DEFAULT_PROPS = {
  levels: [
    {
      id: 123,
      levelNumber: 1,
      sublevels: [{id: 1}, {id: 2}],
      kind: 'assessment'
    },
    {
      id: 456,
      levelNumber: 2,
      sublevels: undefined,
      isUnplugged: true
    },
    {
      id: 789,
      levelNumber: 3,
      sublevels: undefined,
      bonus: true
    }
  ]
};

describe('ProgressTableLevelIcon', () => {
  it('renders icon for each level', () => {
    const wrapper = shallow(<ProgressTableLevelIcon {...DEFAULT_PROPS} />);
    expect(wrapper.find(FontAwesome)).to.have.length(3);
  });

  it('renders extra space for sublevels', () => {
    const wrapper = shallow(<ProgressTableLevelIcon {...DEFAULT_PROPS} />);
    const levelWithSublevels = wrapper.findWhere(
      node => node.key() === '123_1'
    );
    // LETTER_BUBBLE_CONTAINER_WIDTH = 23 defined by apps/src/templates/progress/progressStyles.js
    // we have 2 sublevels, 23 * 2 = 46
    expect(levelWithSublevels.childAt(1).props().style.width).to.equal(46);
  });
});

import React from 'react';
import {expect} from '../../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import ProgressTableLevelIcon from '@cdo/apps/templates/sectionProgress/progressTables/ProgressTableLevelIcon';
import {LETTER_BUBBLE_CONTAINER_WIDTH} from '@cdo/apps/templates/progress/progressStyles';
import FontAwesome from '@cdo/apps/templates/FontAwesome';

const DEFAULT_PROPS = {
  levels: [
    {
      id: '123',
      levelNumber: 1,
      sublevels: [{id: '1'}, {id: '2'}],
      kind: 'assessment'
    },
    {
      id: '456',
      levelNumber: 2,
      sublevels: undefined,
      isUnplugged: true
    },
    {
      id: '789',
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
    expect(levelWithSublevels.childAt(1).props().style.width).to.equal(
      2 * LETTER_BUBBLE_CONTAINER_WIDTH
    );
  });
});

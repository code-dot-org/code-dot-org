import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import TipWithTooltip from '@cdo/apps/lib/levelbuilder/lesson-editor/TipWithTooltip';
import sinon from 'sinon';

describe('TipWithTooltip', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      tip: {
        key: 'tip-1',
        type: 'teachingTip',
        markdown: ''
      },
      onClick: sinon.spy()
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<TipWithTooltip {...defaultProps} />);
    expect(wrapper.find('FontAwesome').length).to.equal(1);
    expect(wrapper.find('LessonTip').length).to.equal(1);
    expect(wrapper.find('ReactTooltip').length).to.equal(1);
  });
});

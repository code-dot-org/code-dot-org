import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import LessonTipIconWithTooltip from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonTipIconWithTooltip';
import sinon from 'sinon';

describe('LessonTipIconWithTooltip', () => {
  let defaultProps, onClick;
  beforeEach(() => {
    onClick = sinon.spy();
    defaultProps = {
      tip: {
        key: 'tip-1',
        type: 'teachingTip',
        markdown: ''
      },
      onClick
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonTipIconWithTooltip {...defaultProps} />);
    expect(wrapper.find('FontAwesome').length).to.equal(1);
    expect(wrapper.find('LessonTip').length).to.equal(1);
    expect(wrapper.find('ReactTooltip').length).to.equal(1);
  });

  it('registers click', () => {
    const wrapper = shallow(<LessonTipIconWithTooltip {...defaultProps} />);
    expect(wrapper.find('FontAwesome').length).to.equal(1);

    const icon = wrapper.find('FontAwesome');
    icon.simulate('click');
    expect(onClick).to.have.been.calledWith({
      key: 'tip-1',
      type: 'teachingTip',
      markdown: ''
    });
  });
});

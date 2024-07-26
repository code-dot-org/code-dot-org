import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonTipIconWithTooltip from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonTipIconWithTooltip';

describe('LessonTipIconWithTooltip', () => {
  let defaultProps, onClick;
  beforeEach(() => {
    onClick = jest.fn();
    defaultProps = {
      tip: {
        key: 'tip-1',
        type: 'teachingTip',
        markdown: '',
      },
      onClick,
    };
  });

  it('renders default props', () => {
    const wrapper = shallow(<LessonTipIconWithTooltip {...defaultProps} />);
    expect(wrapper.find('FontAwesome').length).toBe(1);
    expect(wrapper.find('LessonTip').length).toBe(1);
    expect(wrapper.find('ReactTooltip').length).toBe(1);
  });

  it('registers click', () => {
    const wrapper = shallow(<LessonTipIconWithTooltip {...defaultProps} />);
    expect(wrapper.find('FontAwesome').length).toBe(1);

    const icon = wrapper.find('FontAwesome');
    icon.simulate('click');
    expect(onClick).toHaveBeenCalledWith({
      key: 'tip-1',
      type: 'teachingTip',
      markdown: '',
    });
  });
});

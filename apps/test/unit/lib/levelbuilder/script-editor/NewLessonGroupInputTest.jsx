import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';

import {UnconnectedNewLessonGroupInput as NewLessonGroupInput} from '@cdo/apps/lib/levelbuilder/script-editor/NewLessonGroupInput';

describe('LessonCard', () => {
  let defaultProps;

  beforeEach(() => {
    defaultProps = {
      onConfirm: () => {},
      onCancel: () => {},
      lessonGroups: []
    };
  });

  it('renders the NewLessonGroupInput area', () => {
    let wrapper = shallow(<NewLessonGroupInput {...defaultProps} />);
    expect(wrapper.find('input')).to.have.lengthOf(2);
    expect(wrapper.find('button')).to.have.lengthOf(2);
  });
});

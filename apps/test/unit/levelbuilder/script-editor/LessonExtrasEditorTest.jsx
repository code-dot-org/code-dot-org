import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonExtrasEditor from '@cdo/apps/levelbuilder/unit-editor/LessonExtrasEditor';

describe('LessonExtrasEditor', () => {
  let defaultProps,
    updateLessonExtrasAvailable,
    updateProjectWidgetVisible,
    updateProjectWidgetTypes;

  beforeEach(() => {
    updateLessonExtrasAvailable = jest.fn();
    updateProjectWidgetVisible = jest.fn();
    updateProjectWidgetTypes = jest.fn();
    defaultProps = {
      projectWidgetVisible: false,
      projectWidgetTypes: [],
      lessonExtrasAvailable: false,
      updateLessonExtrasAvailable,
      updateProjectWidgetVisible,
      updateProjectWidgetTypes,
    };
  });
  it('project settings are not visible when lesson extras is not checked', () => {
    const wrapper = mount(<LessonExtrasEditor {...defaultProps} />);
    expect(wrapper.find('input')).toHaveLength(1);
    expect(wrapper.find('select')).toHaveLength(0);
  });

  it('project settings are visible when lesson extras is checked', () => {
    const wrapper = mount(
      <LessonExtrasEditor {...defaultProps} lessonExtrasAvailable={true} />
    );

    expect(wrapper.find('input')).toHaveLength(2);
    expect(wrapper.find('select')).toHaveLength(1);
  });
});

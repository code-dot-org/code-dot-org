import {expect} from 'chai';
import React from 'react';
import {mount} from 'enzyme';
import LessonExtrasEditor from '@cdo/apps/lib/script-editor/LessonExtrasEditor';

const DEFAULT_PROPS = {
  projectWidgetVisible: false,
  projectWidgetTypes: [],
  lessonExtrasAvailable: false
};

describe('LessonExtrasEditor', () => {
  it('project settings are not visible when lesson extras is not checked', () => {
    const wrapper = mount(<LessonExtrasEditor {...DEFAULT_PROPS} />);
    expect(wrapper.find('input[name="project_widget_visible"]')).to.have.length(
      0
    );
    expect(
      wrapper.find('select[name="project_widget_types[]"]')
    ).to.have.length(0);
  });

  it('project settings are visible when lesson extras is checked', () => {
    const wrapper = mount(
      <LessonExtrasEditor {...DEFAULT_PROPS} lessonExtrasAvailable={true} />
    );

    expect(wrapper.find('input[name="project_widget_visible"]')).to.have.length(
      1
    );
    expect(
      wrapper.find('select[name="project_widget_types[]"]')
    ).to.have.length(1);
  });
});

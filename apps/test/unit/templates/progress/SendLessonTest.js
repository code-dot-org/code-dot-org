import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SendLesson from '@cdo/apps/templates/progress/SendLesson';

const lessonUrl =
  'https://studio.code.org/courses/coursee-2020/units/1/lessons/2/levels/1';
const lessonTitle = 'Lesson 2: Drawing with Loops';

describe('SendLesson', () => {
  it('renders a button with a share icon', () => {
    const wrapper = shallow(
      <SendLesson lessonUrl={lessonUrl} lessonTitle={lessonTitle} />
    );

    expect(wrapper.find(MuiButton).length).toEqual(1);
    // Icon now rides in MUI Button's `startIcon` slot rather than a
    // top-level `icon` prop on legacy Button.
    const startIcon = wrapper.find(MuiButton).prop('startIcon');
    expect(startIcon.type).toEqual(FontAwesomeV6Icon);
    expect(startIcon.props.iconName).toEqual('share-from-square');
  });

  it('opens the SendLessonDialog when the button is clicked', () => {
    const wrapper = shallow(
      <SendLesson lessonUrl={lessonUrl} lessonTitle={lessonTitle} />
    );

    // dialog should be closed initially
    expect(wrapper.find('Connect(SendLessonDialog)').length).toEqual(0);

    // click the button
    expect(wrapper.find(MuiButton).length).toEqual(1);
    wrapper.find(MuiButton).props().onClick();

    // dialog should now be open
    expect(wrapper.find('Connect(SendLessonDialog)').length).toEqual(1);
  });
});

import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import SendLesson from '@cdo/apps/templates/progress/SendLesson';

const lessonUrl = 'https://studio.code.org/s/coursee-2020/lessons/2/levels/1';
const lessonTitle = 'Lesson 2: Drawing with Loops';

describe('SendLesson', () => {
  it('renders a button with a share icon', () => {
    const wrapper = shallow(
      <SendLesson lessonUrl={lessonUrl} lessonTitle={lessonTitle} />
    );

    expect(wrapper.find('Button').length).toEqual(1);
    expect(wrapper.find('Button').at(0).props().icon).toEqual('share-square-o');
  });

  it('opens the SendLessonDialog when the button is clicked', () => {
    const wrapper = shallow(
      <SendLesson lessonUrl={lessonUrl} lessonTitle={lessonTitle} />
    );

    // dialog should be closed initially
    expect(wrapper.find('Connect(SendLessonDialog)').length).toEqual(0);

    // click the button
    expect(wrapper.find('Button').length).toEqual(1);
    wrapper.find('Button').props().onClick();

    // dialog should now be open
    expect(wrapper.find('Connect(SendLessonDialog)').length).toEqual(1);
  });
});

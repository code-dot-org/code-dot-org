import React from 'react';
import {assert} from '../../../util/reconfiguredChai';
import SendLesson from '@cdo/apps/templates/progress/SendLesson';
import {shallow} from 'enzyme';

const lessonUrl = 'https://studio.code.org/s/coursee-2020/lessons/2/levels/1';
const lessonTitle = 'Lesson 2: Drawing with Loops';

describe('SendLesson', () => {
  it('renders a button with a share icon', () => {
    const wrapper = shallow(
      <SendLesson lessonUrl={lessonUrl} lessonTitle={lessonTitle} />
    );

    assert.equal(wrapper.find('Button').length, 1);
    assert.equal(
      wrapper
        .find('Button')
        .at(0)
        .props().icon,
      'share-square-o'
    );
  });

  it('opens the SendLessonDialog when the button is clicked', () => {
    const wrapper = shallow(
      <SendLesson lessonUrl={lessonUrl} lessonTitle={lessonTitle} />
    );

    // dialog should be closed initially
    assert.equal(wrapper.find('Connect(SendLessonDialog)').length, 0);

    // click the button
    assert.equal(wrapper.find('Button').length, 1);
    wrapper
      .find('Button')
      .props()
      .onClick();

    // dialog should now be open
    assert.equal(wrapper.find('Connect(SendLessonDialog)').length, 1);
  });
});

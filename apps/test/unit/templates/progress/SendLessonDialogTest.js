import React from 'react';
import {assert} from '../../../util/reconfiguredChai';
import {UnconnectedSendLessonDialog as SendLessonDialog} from '@cdo/apps/templates/progress/SendLessonDialog';
import {shallow} from 'enzyme';

const lessonUrl = 'https://studio.code.org/s/coursee-2020/lessons/2/levels/1';

describe('SendLessonDialog', () => {
  it('renders a copy lesson link button', () => {
    const wrapper = shallow(
      <SendLessonDialog lessonUrl={lessonUrl} showGoogleButton={false} />
    );

    assert.equal(wrapper.find('#uitest-copy-button').length, 1);
    assert.equal(
      wrapper
        .find('#uitest-copy-button')
        .at(0)
        .props().icon,
      'link'
    );
  });

  it('renders a share to google button', () => {
    const wrapper = shallow(
      <SendLessonDialog lessonUrl={lessonUrl} showGoogleButton={true} />
    );

    assert.equal(wrapper.find('GoogleClassroomShareButton').length, 1);
  });
});

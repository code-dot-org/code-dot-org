import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedSendLessonDialog as SendLessonDialog} from '@cdo/apps/templates/progress/SendLessonDialog';

import {assert} from '../../../util/reconfiguredChai'; //eslint-disable-line no-restricted-imports

const lessonUrl = 'https://studio.code.org/s/coursee-2020/lessons/2/levels/1';

describe('SendLessonDialog', () => {
  it('renders a copy lesson link button', () => {
    const wrapper = shallow(
      <SendLessonDialog lessonUrl={lessonUrl} showGoogleButton={false} />
    );

    expect(wrapper.find('#uitest-copy-button').length).toEqual(1);
    expect(wrapper.find('#uitest-copy-button').at(0).props().icon).toEqual(
      'link'
    );
  });

  it('renders a share to google button', () => {
    const wrapper = shallow(
      <SendLessonDialog lessonUrl={lessonUrl} showGoogleButton={true} />
    );

    expect(wrapper.find('GoogleClassroomShareButton').length).toEqual(1);
  });
});

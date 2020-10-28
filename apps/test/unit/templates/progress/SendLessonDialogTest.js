import React from 'react';
import {assert} from '../../../util/reconfiguredChai';
import SendLessonDialog from '@cdo/apps/templates/progress/SendLessonDialog';
import {shallow} from 'enzyme';

const lessonUrl = 'https://studio.code.org/s/coursee-2020/stage/2/puzzle/1';

describe('SendLessonDialog', () => {
  it('renders a copy lesson link button', () => {
    const wrapper = shallow(
      <SendLessonDialog lessonUrl={lessonUrl} showGoogleButton={false} />
    );

    assert.equal(wrapper.find('#ui-test-copy-button').length, 1);
    assert.equal(
      wrapper
        .find('#ui-test-copy-button')
        .at(0)
        .props().icon,
      'copy'
    );
  });
});

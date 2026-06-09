import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import Modal from '@code-dot-org/component-library/modal';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnconnectedSendLessonDialog as SendLessonDialog} from '@cdo/apps/templates/progress/SendLessonDialog';

const lessonUrl =
  'https://studio.code.org/courses/coursee-2020/units/1/lessons/2/levels/1';

// The dialog body lives in Modal's `customContent` prop (a JSX node),
// not as direct children — shallow-render that prop through a wrapping
// fragment so we can query its sub-tree.
const renderContent = wrapper =>
  shallow(<div>{wrapper.find(Modal).prop('customContent')}</div>);

describe('SendLessonDialog', () => {
  it('renders a copy lesson link button', () => {
    const wrapper = shallow(
      <SendLessonDialog isOpen lessonUrl={lessonUrl} showGoogleButton={false} />
    );

    const content = renderContent(wrapper);
    const copyButton = content.find('#uitest-copy-button');
    expect(copyButton.length).toEqual(1);
    // Icon is now an FontAwesomeV6Icon child rather than an `icon` prop on
    // legacy Button.
    expect(
      copyButton
        .find(FontAwesomeV6Icon)
        .someWhere(n => n.prop('iconName') === 'link')
    ).toBe(true);
  });

  it('renders a share to google button', () => {
    const wrapper = shallow(
      <SendLessonDialog isOpen lessonUrl={lessonUrl} showGoogleButton={true} />
    );

    expect(
      renderContent(wrapper).find('GoogleClassroomShareButton').length
    ).toEqual(1);
  });
});

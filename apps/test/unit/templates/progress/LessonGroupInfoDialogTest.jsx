import Modal from '@code-dot-org/component-library/modal';
import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonGroupInfoDialog from '@cdo/apps/templates/progress/LessonGroupInfoDialog';

const DEFAULT_PROPS = {
  isOpen: true,
  displayName: 'Lesson Group Name',
  description: 'This is an awesome Lesson Group.',
  closeDialog: () => {},
  bigQuestions: 'Who? What?',
};

describe('LessonGroupInfoDialog', () => {
  it('renders dialog with title, description, big questions, and a close button', () => {
    const wrapper = shallow(<LessonGroupInfoDialog {...DEFAULT_PROPS} />);

    const modal = wrapper.find(Modal);
    expect(modal).toHaveLength(1);
    // Title text is passed to DSCO Modal's `title` prop (was an inline <h2>
    // under BaseDialog before the migration).
    expect(modal.prop('title')).toEqual('Lesson Group Name');
    // Modal renders its own close action button via primaryButtonProps —
    // assert by inspecting the prop rather than finding a child Button.
    expect(modal.prop('primaryButtonProps').children).toBeTruthy();
    // LessonGroupInfo lives inside Modal's customContent JSX; shallow-render
    // the prop through a wrapping fragment so we can query it.
    const content = shallow(<div>{modal.prop('customContent')}</div>);
    expect(content.find('LessonGroupInfo')).toHaveLength(1);
  });
});

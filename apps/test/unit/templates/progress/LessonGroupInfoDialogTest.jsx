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
  it('renders dialog with description and big questions', () => {
    const wrapper = shallow(<LessonGroupInfoDialog {...DEFAULT_PROPS} />);

    expect(wrapper.find('h2')).toHaveLength(1);
    expect(wrapper.contains('Lesson Group Name')).toBe(true);
    expect(wrapper.find('LessonGroupInfo')).toHaveLength(1);
    expect(wrapper.find('Button')).toHaveLength(1);
  });
});

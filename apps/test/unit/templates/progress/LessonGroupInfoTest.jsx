import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import LessonGroupInfo from '@cdo/apps/templates/progress/LessonGroupInfo';

const DEFAULT_PROPS = {
  description: 'This is an awesome Lesson Group.',
  bigQuestions: 'Who? What?',
};

describe('LessonGroupInfoDialog', () => {
  it('renders description and big questions', () => {
    const wrapper = shallow(<LessonGroupInfo {...DEFAULT_PROPS} />);

    expect(wrapper.find('SafeMarkdown')).toHaveLength(2);
    expect(wrapper.find('SafeMarkdown').at(0).props().markdown).toBe(
      'This is an awesome Lesson Group.'
    );

    expect(wrapper.find('SafeMarkdown').at(1).props().markdown).toBe(
      'Who? What?'
    );
  });
});

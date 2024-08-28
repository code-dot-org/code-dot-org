import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';
import {UnconnectedLessonGroup as LessonGroup} from '@cdo/apps/templates/progress/LessonGroup';
import {fakeLesson} from '@cdo/apps/templates/progress/progressTestHelpers';

const DEFAULT_PROPS = {
  isPlc: false,
  isSummaryView: false,
  scriptId: 1,
  groupedLesson: {
    lessonGroup: {
      displayName: 'jazz',
      description: 'A chapter about conditionals',
      bigQuestions: 'Why is the earth round? Can pigs fly?',
    },
    lessons: [fakeLesson('lesson1', 1)],
    levelsByLesson: [],
  },
  hasVisibleLesson: true,
  viewAs: ViewType.Instructor,
};

describe('LessonGroup', () => {
  it('renders clickable lesson group info button when there is a description or big questions', () => {
    const wrapper = shallow(<LessonGroup {...DEFAULT_PROPS} />);
    expect(wrapper.find('FontAwesome')).toHaveLength(2);

    expect(wrapper.state('lessonGroupInfoDialogOpen')).toBe(false);
    wrapper.find('FontAwesome').at(1).simulate('click');
    expect(wrapper.state('lessonGroupInfoDialogOpen')).toBe(true);
  });
  it('renders without lesson group info button when there is no description or big questions', () => {
    const props = {
      ...DEFAULT_PROPS,
      groupedLesson: {
        ...DEFAULT_PROPS.groupedLesson,
        lessonGroup: {
          displayName: 'jazz',
          description: null,
          bigQuestions: null,
        },
      },
    };
    const wrapper = shallow(<LessonGroup {...props} />);
    expect(wrapper.find('FontAwesome')).toHaveLength(1);
  });
  it('does not render in participant view if there are no visible lessons', () => {
    const props = {
      ...DEFAULT_PROPS,
      isSummaryView: true,
      hasVisibleLesson: false,
      viewAs: ViewType.Participant,
    };
    const wrapper = shallow(<LessonGroup {...props} />);
    expect(wrapper.get(0)).toBeNull();
  });
  it('does render in instructor view if there are no lessons', () => {
    const props = {
      ...DEFAULT_PROPS,
      groupedLesson: {
        ...DEFAULT_PROPS.groupedLesson,
        lessons: [],
      },
      isSummaryView: true,
      viewAs: ViewType.Instructor,
    };
    const wrapper = shallow(<LessonGroup {...props} />);
    expect(wrapper.get(0)).not.toBeNull();
  });
});

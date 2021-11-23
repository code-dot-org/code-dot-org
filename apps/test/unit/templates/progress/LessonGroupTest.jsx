import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import {UnconnectedLessonGroup as LessonGroup} from '@cdo/apps/templates/progress/LessonGroup';
import {fakeLesson} from '@cdo/apps/templates/progress/progressTestHelpers';
import {ViewType} from '@cdo/apps/code-studio/viewAsRedux';

const DEFAULT_PROPS = {
  isPlc: false,
  isSummaryView: false,
  scriptId: 1,
  groupedLesson: {
    lessonGroup: {
      displayName: 'jazz',
      description: 'A chapter about conditionals',
      bigQuestions: 'Why is the earth round? Can pigs fly?'
    },
    lessons: [fakeLesson('lesson1', 1)],
    levelsByLesson: []
  },
  lessonIsVisible: () => true,
  viewAs: ViewType.Teacher
};

describe('LessonGroup', () => {
  it('renders clickable lesson group info button when there is a description or big questions', () => {
    const wrapper = shallow(<LessonGroup {...DEFAULT_PROPS} />);
    expect(wrapper.find('FontAwesome')).to.have.lengthOf(2);

    expect(wrapper.state('lessonGroupInfoDialogOpen')).to.be.false;
    wrapper
      .find('FontAwesome')
      .at(1)
      .simulate('click');
    expect(wrapper.state('lessonGroupInfoDialogOpen')).to.be.true;
  });
  it('renders without lesson group info button when there is no description or big questions', () => {
    const props = {
      ...DEFAULT_PROPS,
      groupedLesson: {
        ...DEFAULT_PROPS.groupedLesson,
        lessonGroup: {
          displayName: 'jazz',
          description: null,
          bigQuestions: null
        }
      }
    };
    const wrapper = shallow(<LessonGroup {...props} />);
    expect(wrapper.find('FontAwesome')).to.have.lengthOf(1);
  });
  it('does not render in student view if there are no visible lessons', () => {
    const props = {
      ...DEFAULT_PROPS,
      isSummaryView: true,
      lessonIsVisible: () => false,
      viewAs: ViewType.Student
    };
    const wrapper = shallow(<LessonGroup {...props} />);
    expect(wrapper.get(0)).to.be.null;
  });
  it('does not render in student view if there are no lessons', () => {
    const props = {
      ...DEFAULT_PROPS,
      groupedLesson: {
        ...DEFAULT_PROPS.groupedLesson,
        lessons: []
      },
      isSummaryView: true,
      viewAs: ViewType.Student
    };
    const wrapper = shallow(<LessonGroup {...props} />);
    expect(wrapper.get(0)).to.be.null;
  });
  it('does render in teacher view if there are no lessons', () => {
    const props = {
      ...DEFAULT_PROPS,
      groupedLesson: {
        ...DEFAULT_PROPS.groupedLesson,
        lessons: []
      },
      isSummaryView: true,
      viewAs: ViewType.Teacher
    };
    const wrapper = shallow(<LessonGroup {...props} />);
    expect(wrapper.get(0)).to.not.be.null;
  });
});

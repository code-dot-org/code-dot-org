import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import {UnconnectedLessonGroup as LessonGroup} from '@cdo/apps/templates/progress/LessonGroup';

const DEFAULT_PROPS = {
  isPlc: false,
  isSummaryView: false,
  scriptId: 1,
  lessonGroup: {
    displayName: 'jazz',
    description: 'A chapter about conditionals',
    bigQuestions: ['Why is the earth round?', 'Can pigs fly?']
  },
  lessons: [],
  levelsByLesson: []
};

const NO_QUESTION_OR_DESCRIPTION_PROPS = {
  isPlc: false,
  isSummaryView: false,
  scriptId: 1,
  lessonGroup: {
    displayName: 'jazz',
    description: null,
    bigQuestions: null
  },
  lessons: [],
  levelsByLesson: []
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
    const wrapper = shallow(
      <LessonGroup {...NO_QUESTION_OR_DESCRIPTION_PROPS} />
    );
    expect(wrapper.find('FontAwesome')).to.have.lengthOf(1);
  });
});

import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import RubricContainer from '@cdo/apps/templates/rubrics/RubricContainer';

describe('RubricContainer', () => {
  const defaultRubric = {
    learningGoals: [],
    lesson: {
      position: 3,
      name: 'Data Structures',
    },
    level: {
      name: 'test_level',
      position: 7,
    },
  };

  it('renders a RubricContent component when the rubric tab is selected', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{}}
        initialTeacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
      />
    );
    expect(wrapper.find('RubricContent')).to.have.lengthOf(1);
  });

  it('switches components when tabs are clicked', () => {
    const wrapper = shallow(
      <RubricContainer
        rubric={defaultRubric}
        studentLevelInfo={{}}
        initialTeacherHasEnabledAi={true}
        currentLevelName={'test_level'}
        reportingData={{}}
      />
    );
    expect(wrapper.find('RubricContent')).to.have.lengthOf(1);
    expect(wrapper.find('RubricSettings')).to.have.lengthOf(0);
    wrapper.find('HeaderTab').at(1).simulate('click');
    expect(wrapper.find('RubricContent')).to.have.lengthOf(0);
    expect(wrapper.find('RubricSettings')).to.have.lengthOf(1);
    wrapper.find('HeaderTab').at(0).simulate('click');
    expect(wrapper.find('RubricContent')).to.have.lengthOf(1);
    expect(wrapper.find('RubricSettings')).to.have.lengthOf(0);
  });
});

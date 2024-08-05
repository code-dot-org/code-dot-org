import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {updateHiddenScript} from '@cdo/apps/code-studio/hiddenLessonRedux';
import {UnconnectedMultipleAssignButton as MultipleAssignButton} from '@cdo/apps/templates/MultipleAssignButton';
import {fakeTeacherSectionsForDropdown} from '@cdo/apps/templates/teacherDashboard/sectionAssignmentTestHelper';
import {
  assignToSection,
  testingFunction,
} from '@cdo/apps/templates/teacherDashboard/teacherSectionsRedux';

describe('MultipleAssignButtonTest', () => {
  const defaultProps = {
    sectionId: 0,
    courseId: 1,
    courseOfferingId: 2,
    courseVersionId: 3,
    scriptId: 4,
    assignToSection: assignToSection,
    updateHiddenScript: updateHiddenScript,
    testingFunction: testingFunction,
    sectionsForDropdown: fakeTeacherSectionsForDropdown,
    isAssigningCourse: false,
  };
  const setUp = (overrideProps = {}) => {
    const props = {...defaultProps, ...overrideProps};
    return shallow(<MultipleAssignButton {...props} />);
  };

  it('renders a MultipleSectionsAssigner when clicked on unit page', () => {
    const wrapper = setUp();
    expect(wrapper.find('.uitest-assign-button')).toBeDefined();
    expect(wrapper.exists('Connect(MultipleSectionsAssigner)')).toBe(false);
    wrapper.find('Button').simulate('click');
    expect(
      wrapper.find('Connect(MultipleSectionsAssigner)').first().props()
        .isAssigningCourse
    ).toBe(false);
    expect(wrapper.exists('Connect(MultipleSectionsAssigner)')).toBe(true);
  });

  it('renders a MultipleSectionsAssigner when clicked on course page', () => {
    const wrapper = setUp({isAssigningCourse: true});
    expect(wrapper.find('.uitest-assign-button')).toBeDefined();
    expect(wrapper.exists('Connect(MultipleSectionsAssigner)')).toBe(false);
    wrapper.find('Button').simulate('click');
    expect(
      wrapper.find('Connect(MultipleSectionsAssigner)').first().props()
        .isAssigningCourse
    ).toBe(true);
    expect(wrapper.exists('Connect(MultipleSectionsAssigner)')).toBe(true);
  });
});

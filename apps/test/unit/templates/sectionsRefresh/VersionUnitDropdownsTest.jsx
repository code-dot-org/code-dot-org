import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import VersionUnitDropdowns from '@cdo/apps/templates/sectionsRefresh/VersionUnitDropdowns';

import {highSchoolCourseOfferings} from './CourseOfferingsTestData';

const csdOffering = highSchoolCourseOfferings['high']['Course'][
  'Year Long'
].find(obj => obj.id === 74);

const DEFAULT_PROPS = {
  courseOffering: csdOffering,
  updateCourse: () => {},
  sectionCourse: {
    courseOfferingId: 74,
    displayName: 'Computer Science Discoveries',
    versionId: 737,
  },
};

const setUpMount = (overrideProps = {}) => {
  console.log();
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<VersionUnitDropdowns {...props} />);
};

describe('VersionUnitDropdowns', () => {
  it('renders the CSD unit selections', () => {
    const wrapper = setUpMount();

    // Counts all dropdown options across the two lists
    expect(wrapper.find('option').length).toBe(5);
    expect(wrapper.contains("Problem Solving and Computing ('22-'23)")).toBe(
      true
    );
    expect(wrapper.contains("Web Development ('22-'23)")).toBe(true);
  });

  it('assigns correct tts and lesson extras when unit selected', () => {
    const updateSpy = jest.fn();
    const wrapper = setUpMount({updateCourse: updateSpy});

    expect(updateSpy).not.toHaveBeenCalled();
    wrapper
      .find('select')
      .at(1)
      .simulate('change', {target: {value: 5080}});
    expect(updateSpy).toHaveBeenCalledWith({
      courseOfferingId: 74,
      displayName: 'Computer Science Discoveries',
      versionId: 737,
      unitId: 5080,
      hasLessonExtras: false,
      hasTextToSpeech: true,
    });
  });
});

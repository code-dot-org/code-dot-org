import React from 'react';
import {shallow, mount} from 'enzyme';
import sinon from 'sinon';
import {expect} from '../../../util/reconfiguredChai';
import QuickAssignTable from '@cdo/apps/templates/sectionsRefresh/QuickAssignTable';
import {MARKETING_AUDIENCE} from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';
import {
  elementarySchoolCourseOffering,
  highSchoolCourseOfferings
} from './CourseOfferingsTestData';
import i18n from '@cdo/locale';

const DEFAULT_PROPS = {
  marketingAudience: MARKETING_AUDIENCE.HIGH,
  courseOfferings: highSchoolCourseOfferings,
  setSelectedCourseOffering: () => {},
  updateCourse: () => {},
  sectionCourse: {}
};

const setUpShallow = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return shallow(<QuickAssignTable {...props} />);
};

const setUpMount = (overrideProps = {}) => {
  const props = {...DEFAULT_PROPS, ...overrideProps};
  return mount(<QuickAssignTable {...props} />);
};

describe('QuickAssignTable', () => {
  it('renders Course as the first and only table/column header', () => {
    const wrapper = setUpShallow({
      marketingAudience: MARKETING_AUDIENCE.ELEMENTARY,
      courseOfferings: elementarySchoolCourseOffering
    });

    expect(wrapper.find('table').length).to.equal(1);
    expect(wrapper.contains(i18n.courses())).to.be.true;
  });

  it('renders two tables with correct headers', () => {
    const wrapper = setUpShallow();
    expect(wrapper.find('table').length).to.equal(2);
    expect(wrapper.contains(i18n.courses())).to.be.true;
    expect(wrapper.contains(i18n.standaloneUnits())).to.be.true;
  });

  it('calls updateSection when a radio button is pressed', () => {
    const updateSpy = sinon.spy();
    const wrapper = setUpMount({updateCourse: updateSpy});

    const radio = wrapper.find("input[value='Computer Science A']");
    expect(updateSpy).not.to.have.been.called;
    radio.simulate('change', {
      target: {value: 'Computer Science A', checked: true}
    });
    expect(updateSpy).to.have.been.called;
  });

  it('automatically checks correct radio button if course is already assigned', () => {
    const wrapper = setUpMount({
      sectionCourse: {displayName: 'Computer Science A'}
    });

    const radio = wrapper.find("input[value='Computer Science A']");
    expect(radio.props().checked).to.be.true;
    // and verify that the next door radio is checked=false
    expect(
      wrapper.find("input[value='Computer Science Discoveries']").props()
        .checked
    ).to.be.false;
  });
});

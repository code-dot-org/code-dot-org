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

describe('QuickAssignTable', () => {
  it('renders Course as the first and only table/column header', () => {
    const wrapper = shallow(
      <QuickAssignTable
        marketingAudience={MARKETING_AUDIENCE.ELEMENTARY}
        courseOfferings={elementarySchoolCourseOffering}
        updateCourse={() => {}}
      />
    );

    expect(wrapper.find('table').length).to.equal(1);
    expect(wrapper.contains(i18n.courses())).to.be.true;
  });

  it('renders two tables with correct headers', () => {
    const wrapper = shallow(
      <QuickAssignTable
        marketingAudience={MARKETING_AUDIENCE.HIGH}
        courseOfferings={highSchoolCourseOfferings}
        updateCourse={() => {}}
      />
    );
    expect(wrapper.find('table').length).to.equal(2);
    expect(wrapper.contains(i18n.courses())).to.be.true;
    expect(wrapper.contains(i18n.standaloneUnits())).to.be.true;
  });

  it('calls updateSection when a radio button is pressed', () => {
    const updateSpy = sinon.spy();
    const wrapper = mount(
      <QuickAssignTable
        marketingAudience={MARKETING_AUDIENCE.HIGH}
        courseOfferings={highSchoolCourseOfferings}
        updateCourse={updateSpy}
      />
    );

    const radio = wrapper.find("input[value='Computer Science A']");
    expect(updateSpy).not.to.have.been.called;
    radio.simulate('change', {
      target: {value: 'Computer Science A', checked: true}
    });
    expect(updateSpy).to.have.been.called;
  });
});

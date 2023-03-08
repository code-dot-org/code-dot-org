import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import QuickAssignTableHocPl from '@cdo/apps/templates/sectionsRefresh/QuickAssignTableHocPl';
import {MARKETING_AUDIENCE} from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';
import {hocCourseOfferings} from './CourseOfferingsTestData';
import i18n from '@cdo/locale';

describe('QuickAssignTable', () => {
  it('renders Hour of Code as the first and only table/column header', () => {
    const wrapper = shallow(
      <QuickAssignTableHocPl
        marketingAudience={MARKETING_AUDIENCE.HOC}
        courseOfferings={hocCourseOfferings}
        updateCourse={() => {}}
        sectionCourse={{}}
      />
    );
    expect(wrapper.find('table').length).to.equal(3);
    expect(wrapper.contains(i18n.courseOfferingHOC())).to.be.true;
  });

  it('renders extra two headers in the first and second tables', () => {
    const wrapper = shallow(
      <QuickAssignTableHocPl
        marketingAudience={MARKETING_AUDIENCE.HOC}
        courseOfferings={hocCourseOfferings}
        updateCourse={() => {}}
        sectionCourse={{}}
      />
    );
    expect(wrapper.find('table').length).to.equal(3);
    // First header displays in table 0
    expect(
      wrapper
        .find('table')
        .at(0)
        .contains('Favorites')
    ).to.be.true;
    // Fourth header displays in table 0
    expect(
      wrapper
        .find('table')
        .at(0)
        .contains('Popular Media')
    ).to.be.true;
    // Fifth header displays in table 1
    expect(
      wrapper
        .find('table')
        .at(1)
        .contains('Sports')
    ).to.be.true;
  });
});

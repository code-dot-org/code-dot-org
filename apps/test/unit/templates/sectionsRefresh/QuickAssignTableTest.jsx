import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import QuickAssignTable from '@cdo/apps/templates/sectionsRefresh/QuickAssignTable';
import {MARKETING_AUDIENCE} from '@cdo/apps/templates/sectionsRefresh/CurriculumQuickAssign';
import {
  elementarySchoolCourseOffering,
  highSchoolCourseOfferings
} from './CourseOfferingsTestData';

describe('QuickAssignTable', () => {
  it('renders Course as the first and only table/column header', () => {
    const wrapper = shallow(
      <QuickAssignTable
        marketingAudience={MARKETING_AUDIENCE.ELEMENTARY}
        courseOfferings={elementarySchoolCourseOffering}
      />
    );

    expect(wrapper.find('table').length).to.equal(1);
    expect(wrapper.contains('Course')).to.be.true;
  });

  it('renders two tables with correct headers', () => {
    const wrapper = shallow(
      <QuickAssignTable
        marketingAudience={MARKETING_AUDIENCE.HIGH}
        courseOfferings={highSchoolCourseOfferings}
      />
    );
    expect(wrapper.find('table').length).to.equal(2);
    expect(wrapper.contains('Course')).to.be.true;
    expect(wrapper.contains('Standalone Unit')).to.be.true;
  });
});

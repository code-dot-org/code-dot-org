import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import StandardsReportHeader from '@cdo/apps/templates/sectionProgress/standards/StandardsReportHeader';

describe('StandardsReportHeader', () => {
  let DEFAULT_PROPS;

  beforeEach(() => {
    DEFAULT_PROPS = {
      teacherName: 'Awesome Teacher',
      sectionName: 'Great Section',
    };
  });

  it('report shows section information and report date', () => {
    const wrapper = shallow(<StandardsReportHeader {...DEFAULT_PROPS} />);
    expect(wrapper.contains('Class Standards Report')).toBe(true);
    expect(wrapper.contains('Awesome Teacher')).toBe(true);
    expect(wrapper.contains('Great Section')).toBe(true);
  });
});

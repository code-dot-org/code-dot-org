import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import RollupUnitEntry from '@cdo/apps/templates/courseRollupPages/RollupUnitEntry';

import {courseData} from './rollupTestData';

describe('RollupUnitEntry', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectToRollUp: 'Vocabulary',
      unit: courseData.units[0],
    };
  });

  it('renders correct number of lesson', () => {
    const wrapper = mount(<RollupUnitEntry {...defaultProps} />);

    expect(wrapper.find('RollupLessonEntry').length).toBe(2);
  });
});

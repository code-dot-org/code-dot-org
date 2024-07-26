import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';

import {courseData} from './rollupTestData';

describe('UnitRollup', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectToRollUp: 'Vocabulary',
      unit: courseData.units[0],
    };
  });

  it('renders course link', () => {
    const wrapper = mount(<UnitRollup {...defaultProps} />);

    const navLink = wrapper.find('a').at(0);
    expect(navLink.props().href).toContain('/s/unit-1');
    expect(navLink.contains('< Unit 1 - Unit One')).toBe(true);
  });

  it('renders correct number of units', () => {
    const wrapper = mount(<UnitRollup {...defaultProps} />);

    expect(wrapper.find('RollupUnitEntry').length).toBe(1);
  });
});

import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';

import {expect} from '../../../util/reconfiguredChai';

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
    expect(navLink.props().href).to.contain('/s/unit-1');
    expect(navLink.contains('< Unit 1 - Unit One')).to.be.true;
  });

  it('renders correct number of units', () => {
    const wrapper = mount(<UnitRollup {...defaultProps} />);

    expect(wrapper.find('RollupUnitEntry').length).to.equal(1);
  });
});

import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../util/reconfiguredChai';
import UnitRollup from '@cdo/apps/templates/courseRollupPages/UnitRollup';
import {courseData} from './rollupTestData';

describe('UnitRollup', () => {
  let defaultProps;
  beforeEach(() => {
    defaultProps = {
      objectToRollUp: 'Vocabulary',
      unit: courseData.units[0]
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

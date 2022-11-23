import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../util/deprecatedChai';
import {UnconnectedRegionalPartnerSearch as RegionalPartnerSearch} from '@cdo/apps/templates/RegionalPartnerSearch';

const MINIMUM_PROPS = {
  responsiveSize: 'md'
};

describe('RegionalPartnerSearch', () => {
  it('renders form for zip code', () => {
    const wrapper = shallow(<RegionalPartnerSearch {...MINIMUM_PROPS} />);
    expect(wrapper.find('form')).not.to.be.null;
    expect(wrapper.find('form').text()).to.contain('ZIP');
  });
});

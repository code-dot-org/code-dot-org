import {assert} from '../../util/configuredChai';
import React from 'react';
import {UnconnectedAgeDialog as AgeDialog} from '@cdo/apps/templates/AgeDialog';
import {shallow} from 'enzyme';

describe('AgeDialog', () => {
  const defaultProps = {
    signedIn: false,
    turnOffFilter: () => {}
  };

  afterEach(() => sessionStorage.clear());

  it('renders null if signed in', () => {
    const wrapper = shallow(
      <AgeDialog
        {...defaultProps}
        signedIn={true}
      />
    );
    assert.equal(wrapper.getNode(), null);
  });

  it('renders null if seen before', () => {
    sessionStorage.setItem('ad_anon_over13', true);
    const wrapper = shallow(
      <AgeDialog
        {...defaultProps}
      />
    );
    assert.equal(wrapper.getNode(), null);
  });

  it('renders a dialog otherwise', () => {
    const wrapper = shallow(
      <AgeDialog
        {...defaultProps}
      />
    );
    assert.equal(wrapper.name(), 'BaseDialog');
  });
});

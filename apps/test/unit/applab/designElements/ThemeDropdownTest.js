import React from 'react';
import {expect} from '../../../util/reconfiguredChai';
import {shallow} from 'enzyme';
import sinon from 'sinon';
import ThemeDropdown from '@cdo/apps/applab/designElements/ThemeDropdown';

const DEFAULT_PROPS = {
  initialValue: 'citrus',
  handleChange: () => {},
  description: 'Theme'
};

describe('ThemeDropdown', () => {
  describe('handleChange', () => {
    it('sets the new theme from the event value', () => {
      const handleChangeSpy = sinon.spy();
      const wrapper = shallow(
        <ThemeDropdown {...DEFAULT_PROPS} handleChange={handleChangeSpy} />
      );

      expect(wrapper.state('selectedValue')).to.equal(
        DEFAULT_PROPS.initialValue
      );
      wrapper.find('Select').simulate('change', {value: 'bubblegum'});
      expect(handleChangeSpy.callCount).to.equal(1);
      expect(wrapper.state('selectedValue')).to.equal('bubblegum');
    });

    it('sets the theme to default if the event is null', () => {
      const handleChangeSpy = sinon.spy();
      const wrapper = shallow(
        <ThemeDropdown {...DEFAULT_PROPS} handleChange={handleChangeSpy} />
      );

      expect(wrapper.state('selectedValue')).to.equal(
        DEFAULT_PROPS.initialValue
      );
      wrapper.find('Select').simulate('change', null);
      expect(handleChangeSpy.callCount).to.equal(1);
      expect(wrapper.state('selectedValue')).to.equal('default');
    });
  });
});

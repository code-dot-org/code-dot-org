import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import ThemeDropdown from '@cdo/apps/applab/designElements/ThemeDropdown';

const DEFAULT_PROPS = {
  initialValue: 'citrus',
  handleChange: () => {},
  description: 'Theme',
};

describe('ThemeDropdown', () => {
  describe('handleChange', () => {
    it('sets the new theme from the event value', () => {
      const handleChangeSpy = jest.fn();
      const wrapper = shallow(
        <ThemeDropdown {...DEFAULT_PROPS} handleChange={handleChangeSpy} />
      );

      expect(wrapper.state('selectedValue')).toBe(DEFAULT_PROPS.initialValue);
      wrapper.find('Select').simulate('change', {value: 'bubblegum'});
      expect(handleChangeSpy).toHaveBeenCalledTimes(1);
      expect(wrapper.state('selectedValue')).toBe('bubblegum');
    });

    it('sets the theme to default if the event is null', () => {
      const handleChangeSpy = jest.fn();
      const wrapper = shallow(
        <ThemeDropdown {...DEFAULT_PROPS} handleChange={handleChangeSpy} />
      );

      expect(wrapper.state('selectedValue')).toBe(DEFAULT_PROPS.initialValue);
      wrapper.find('Select').simulate('change', null);
      expect(handleChangeSpy).toHaveBeenCalledTimes(1);
      expect(wrapper.state('selectedValue')).toBe('default');
    });
  });
});

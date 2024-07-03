import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {CheckedRadioButton} from '@cdo/apps/lib/ui/CheckedRadioButton';

const DEFAULT_PROPS = {
  id: 'rubric-input-performanceLevel1',
  disabledMode: false,
  checked: false,
  value: 'performanceLevel1',
  onRadioButtonChange: () => {},
};

describe('CheckedRadioButton', () => {
  it('does set input to checked if checked prop is true', () => {
    const wrapper = shallow(
      <CheckedRadioButton {...DEFAULT_PROPS} checked={true} />
    );
    expect(wrapper.find('input').props().checked).toBe(true);
  });
});

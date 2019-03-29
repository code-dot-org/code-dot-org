import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {CheckedRadioButton} from '@cdo/apps/src/lib/ui/CheckedRadioButton';

const DEFAULT_PROPS = {
  id: 'rubric-input-exceeds',
  disabledMode: false,
  checked: false,
  value: 'exceeds',
  onRadioButtonChange: () => {}
};

describe('CheckedRadioButton', () => {
  it('does set input to checked if checked prop is true', () => {
    const wrapper = shallow(
      <CheckedRadioButton {...DEFAULT_PROPS} checked={true} />
    );
    expect(wrapper.find('input')).to.be.checked();
  });

  it('becomes checked when click on the input', () => {
    const wrapper = shallow(<CheckedRadioButton {...DEFAULT_PROPS} />);
    const confirmInput = wrapper.find('input').first();
    confirmInput.simulate('change', {target: {value: 'exceeds'}});
    // stub change method?
    expect(wrapper.find('input')).to.be.checked();
  });
});

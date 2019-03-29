import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnwrappedRubricField as RubricField} from '@cdo/apps/templates/instructions/RubricField';

const DEFAULT_PROPS = {
  showFeedbackInputAreas: true,
  rubricLevel: 'exceeds',
  rubricValue: 'exceeded expectations',
  disabledMode: false,
  onChange: () => {},
  currentlyChecked: false
};

describe('RubricField', () => {
  it('renders with the correct values', () => {
    const wrapper = shallow(<RubricField {...DEFAULT_PROPS} />);

    // Radio Button
    const confirmCheckedRadioButton = wrapper
      .find('CheckedRadioButton')
      .first();
    expect(confirmCheckedRadioButton.props().checked).to.equal(false);

    // Details
    const confirmDetails = wrapper.find('details').first();
    expect(confirmDetails).to.contain('Exceeds');
    expect(confirmDetails).to.contain('exceeded expectations');
  });
  it('does not have a CheckedRadioButton when showFeedbackInputAreas is false', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} showFeedbackInputAreas={false} />
    );
    expect(wrapper).to.not.have.descendants('CheckedRadioButton');
  });
  it('has a radio button that is checked if currentlyChecked is true', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} currentlyChecked={true} />
    );

    const confirmCheckedRadioButton = wrapper
      .find('CheckedRadioButton')
      .first();
    expect(confirmCheckedRadioButton.props().checked).to.equal(true);
  });
  it('has a disabled radio button if disabledMode is true.', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} disabledMode={true} />
    );

    const confirmCheckedRadioButton = wrapper
      .find('CheckedRadioButton')
      .first();
    expect(confirmCheckedRadioButton.props().disabledMode).to.equal(true);
  });
});

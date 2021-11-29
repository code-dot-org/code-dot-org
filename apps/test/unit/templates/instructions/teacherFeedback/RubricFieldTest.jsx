import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {UnwrappedRubricField as RubricField} from '@cdo/apps/templates/instructions/teacherFeedback/RubricField';

const DEFAULT_PROPS = {
  showFeedbackInputAreas: true,
  rubricLevel: 'performanceLevel1',
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
    expect(confirmDetails.contains('Extensive Evidence')).to.equal(true);
    expect(confirmDetails.contains('exceeded expectations')).to.equal(true);
  });
  it('does not have a CheckedRadioButton when showFeedbackInputAreas is false', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} showFeedbackInputAreas={false} />
    );
    expect(wrapper.find('CheckedRadioButton')).to.have.lengthOf(0);
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

import {shallow} from 'enzyme'; // eslint-disable-line no-restricted-imports
import React from 'react';

import {UnwrappedRubricField as RubricField} from '@cdo/apps/templates/instructions/teacherFeedback/RubricField';

const DEFAULT_PROPS = {
  showFeedbackInputAreas: true,
  rubricLevel: 'performanceLevel1',
  rubricValue: 'exceeded expectations',
  disabledMode: false,
  onChange: () => {},
  currentlyChecked: false,
};

describe('RubricField', () => {
  it('renders with the correct values', () => {
    const wrapper = shallow(<RubricField {...DEFAULT_PROPS} />);

    // Radio Button
    const confirmCheckedRadioButton = wrapper
      .find('CheckedRadioButton')
      .first();
    expect(confirmCheckedRadioButton.props().checked).toBe(false);

    // Details
    const confirmDetails = wrapper.find('details').first();
    expect(confirmDetails.contains('Extensive Evidence')).toBe(true);
    expect(confirmDetails.contains('exceeded expectations')).toBe(true);
  });
  it('does not have a CheckedRadioButton when showFeedbackInputAreas is false', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} showFeedbackInputAreas={false} />
    );
    expect(wrapper.find('CheckedRadioButton')).toHaveLength(0);
  });
  it('has a radio button that is checked if currentlyChecked is true', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} currentlyChecked={true} />
    );

    const confirmCheckedRadioButton = wrapper
      .find('CheckedRadioButton')
      .first();
    expect(confirmCheckedRadioButton.props().checked).toBe(true);
  });
  it('has a disabled radio button if disabledMode is true.', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} disabledMode={true} />
    );

    const confirmCheckedRadioButton = wrapper
      .find('CheckedRadioButton')
      .first();
    expect(confirmCheckedRadioButton.props().disabledMode).toBe(true);
  });
});

import React from 'react';
import {shallow} from 'enzyme';
import {expect} from '../../../util/configuredChai';
import {UnconnectedRubricField as RubricField} from '@cdo/apps/templates/instructions/RubricField';

const DEFAULT_PROPS = {
  showFeedbackInputAreas: true,
  rubricLevel: 'exceeds',
  rubricValue: 'exceeded expectations',
  disabledMode: false,
  onChange: () => {},
  currentlyChecked: false
};

describe('RubricField', () => {
  it('Renders with the correct values', () => {
    const wrapper = shallow(<RubricField {...DEFAULT_PROPS} />);

    // Radio Button
    const confirmCheckedRadioButton = wrapper.find('CheckedRadioButton').at(0);
    expect(confirmCheckedRadioButton.props().checked).to.equal(false);

    // Details
    const confirmDetails = wrapper.find('details').at(0);
    expect(confirmDetails).to.contain('Exceeds');
    expect(confirmDetails).to.contain('exceeded expectations');
  });
  it('When showFeedbackInputAreas is false, there should not be a CheckedRadioButton', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} showFeedbackInputAreas={false} />
    );
    expect(wrapper.find('CheckedRadioButton')).to.have.lengthOf(0);
  });
  it('When that RubricField is the currently checked one', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} currentlyChecked={true} />
    );

    const confirmCheckedRadioButton = wrapper.find('CheckedRadioButton').at(0);
    expect(confirmCheckedRadioButton.props().checked).to.equal(true);
  });
  it('Disable mode - the Checked button also disabled ', () => {
    const wrapper = shallow(
      <RubricField {...DEFAULT_PROPS} disabledMode={true} />
    );

    const confirmCheckedRadioButton = wrapper.find('CheckedRadioButton').at(0);
    expect(confirmCheckedRadioButton.props().disabledMode).to.equal(true);
  });
  it('When hover, a border is added and tooltip shows', () => {
    // not sure how to do this
  });
});

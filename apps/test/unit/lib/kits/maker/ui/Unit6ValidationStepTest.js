import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../../../util/configuredChai';
import Unit6ValidationStep from '@cdo/apps/lib/kits/maker/ui/Unit6ValidationStep';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';

describe('Unit6ValidationStep', () => {
  const defaultProps = {
    showRadioButtons: true,
    stepStatus: Status.UNKNOWN,
    onSubmit: () => {}
  };

  it('does not show contents if showRadioButtons is false', () => {
    const wrapper = shallow(
      <Unit6ValidationStep
        {...defaultProps}
        showRadioButtons={false}
      />
    );
    assert.equal(wrapper.children().length, 0);
  });

  it('does show contents if showRadioButtons is true', () => {
    const wrapper = shallow(
      <Unit6ValidationStep
        {...defaultProps}
      />
    );
    assert.equal(wrapper.children().length, 1);
  });

  it('does not fill in unit 6 intentions if not provided', () => {
    const wrapper = shallow(
      <Unit6ValidationStep
        {...defaultProps}
      />
    );
    assert.equal(wrapper.find('input [checked="true"]').length, 0);
    wrapper.find('input [name="year"]').forEach(node => {
      assert.strictEqual(node.props().checked, false);
    });
    assert.equal(wrapper.find('Button').length, 1);
  });

  it('fills in unit 6 intentions when provided ineligible response', () => {
    const wrapper = shallow(
      <Unit6ValidationStep
        {...defaultProps}
        stepStatus={Status.FAILED}
        initialChoice="no"
      />
    );
    assert.equal(wrapper.find('input [value="no"]').props().checked, true);
    assert.equal(wrapper.find('Button').length, 0);
  });

  it('fills in unit 6 intentions when provided eligible response', () => {
    const wrapper = shallow(
      <Unit6ValidationStep
        {...defaultProps}
        stepStatus={Status.SUCCEEDED}
        initialChoice="yes1718"
      />
    );
    assert.equal(wrapper.find('input [value="yes1718"]').props().checked, true);
    assert.equal(wrapper.find('Button').length, 0);
  });
});

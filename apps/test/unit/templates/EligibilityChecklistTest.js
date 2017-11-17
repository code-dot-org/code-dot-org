import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../util/configuredChai';
import EligibilityChecklist from '@cdo/apps/templates/EligibilityChecklist';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';
import i18n from '@cdo/locale';

describe('EligibilityChecklist', () => {
  it('does not fill in unit 6 intentions if not provided', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        statusPD={Status.SUCCEEDED}
        statusStudentCount={Status.SUCCEEDED}
      />
    );
    assert.equal(wrapper.find('input [checked="true"]').length, 0);
    wrapper.find('input [name="year"]').forEach(node => {
      assert.strictEqual(node.props().checked, false);
    });
  });

  it('fills in unit 6 intentions when provided ineligible response', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        statusPD={Status.SUCCEEDED}
        statusStudentCount={Status.SUCCEEDED}
        unit6Intention="no"
      />
    );
    assert.equal(wrapper.find('ValidationStep').at(2).props().stepName, i18n.eligibilityReqYear());
    assert.equal(wrapper.find('ValidationStep').at(2).props().stepStatus, Status.FAILED);
    assert.equal(wrapper.find('input [value="no"]').props().checked, true);
    assert.equal(wrapper.find('Button [text="Submit"]').length, 0);
  });

  it('fills in unit 6 intentions when provided eligible response', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        statusPD={Status.SUCCEEDED}
        statusStudentCount={Status.SUCCEEDED}
        unit6Intention="yes1718"
      />
    );
    assert.equal(wrapper.find('ValidationStep').at(2).props().stepName, i18n.eligibilityReqYear());
    assert.equal(wrapper.find('ValidationStep').at(2).props().stepStatus, Status.SUCCEEDED);
    assert.equal(wrapper.find('input [value="yes1718"]').props().checked, true);
    assert.equal(wrapper.find('Button [text="Submit"]').length, 0);
  });
});

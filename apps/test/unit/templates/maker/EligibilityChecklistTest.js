import React from 'react';
import {shallow} from 'enzyme';
import {assert} from '../../../util/configuredChai';
import EligibilityChecklist from '@cdo/apps/templates/maker/EligibilityChecklist';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';

describe('EligibilityChecklist', () => {
  const defaultProps = {
    statusPD: Status.SUCCEEDED,
    statusStudentCount: Status.SUCCEEDED,
    hasConfirmedSchool: false,
  };

  it('renders', () => {
    const wrapper = shallow(
      <EligibilityChecklist
        {...defaultProps}
      />
    );
    assert(wrapper);
  });
});

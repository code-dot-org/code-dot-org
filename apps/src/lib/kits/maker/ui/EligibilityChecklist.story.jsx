import React from 'react';
import EligibilityChecklist from './EligibilityChecklist';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';
import {Unit6Intention} from '../util/discountLogic';

const defaultProps = {
  statusPD: Status.SUCCEEDED,
  statusStudentCount: Status.SUCCEEDED,
  hasConfirmedSchool: false,
  adminSetStatus: false,
  currentlyDistributingDiscountCodes: true
};

export default storybook => {
  return storybook
    .storiesOf('MakerToolkit/Discounts/EligibilityChecklist', module)
    .addStoryTable([
      {
        name: '2020: Initial view',
        description: 'New format for 2020',
        story: () => (
          <div style={{margin: '2em'}}>
            <EligibilityChecklist {...defaultProps} />
          </div>
        )
      },
      {
        name: '2020: School is not eligible',
        description: 'When your school does not qualify',
        story: () => (
          <div style={{margin: '2em'}}>
            <EligibilityChecklist
              {...defaultProps}
              schoolId="1234"
              schoolName="Code.org Junior Academy"
              hasConfirmedSchool={true}
              schoolHighNeedsEligible={false}
              getsFullDiscount={false}
            />
          </div>
        )
      },
      {
        name: '2020: Student count and facilitator failure',
        description: 'When your school does qualify',
        story: () => (
          <div style={{margin: '2em'}}>
            <EligibilityChecklist
              {...defaultProps}
              schoolId="1234"
              schoolName="Code.org Junior Academy"
              hasConfirmedSchool={true}
              schoolHighNeedsEligible={true}
              statusPD={Status.FAILED}
              statusStudentCount={Status.FAILED}
            />
          </div>
        )
      },
      {
        name: '2020: Student count and facilitator success',
        description: 'When your school does qualify',
        story: () => (
          <div style={{margin: '2em'}}>
            <EligibilityChecklist
              {...defaultProps}
              schoolId="1234"
              schoolName="Code.org Junior Academy"
              hasConfirmedSchool={true}
              schoolHighNeedsEligible={true}
            />
          </div>
        )
      },
      {
        name: '2020: Year choice failure',
        description: 'When you are not planning to teach this or next year',
        story: () => (
          <div style={{margin: '2em'}}>
            <EligibilityChecklist
              {...defaultProps}
              schoolId="1234"
              schoolName="Code.org Junior Academy"
              hasConfirmedSchool={true}
              schoolHighNeedsEligible={true}
              unit6Intention={Unit6Intention.NO}
            />
          </div>
        )
      },
      {
        name: '2020: Year choice success',
        description: 'When you are planning to teach this or next year',
        story: () => (
          <div style={{margin: '2em'}}>
            <EligibilityChecklist
              {...defaultProps}
              schoolId="1234"
              schoolName="Code.org Junior Academy"
              hasConfirmedSchool={true}
              schoolHighNeedsEligible={true}
              unit6Intention={Unit6Intention.YES_SPRING_2020}
            />
          </div>
        )
      }
    ]);
};

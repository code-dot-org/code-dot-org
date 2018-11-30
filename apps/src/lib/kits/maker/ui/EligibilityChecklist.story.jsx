import React from 'react';
import EligibilityChecklist from './EligibilityChecklist';
import {Status} from '@cdo/apps/lib/ui/ValidationStep';

const defaultProps = {
  statusPD: Status.SUCCEEDED,
  statusStudentCount: Status.SUCCEEDED,
  hasConfirmedSchool: false,
  adminSetStatus: false,
  currentlyDistributingDiscountCodes: true,
};

export default storybook => {
  return storybook
    .storiesOf('MakerToolkit/Discounts/EligibilityChecklist', module)
    .addStoryTable([
      {
        name: 'Failed Checklist',
        description: 'EligbilityChecklist where one of first list items failed',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            statusStudentCount={Status.FAILED}
          />
        )
      },
      {
        name: 'Check Year Checklist',
        description: 'First two items succeeded, third needs to be verified',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
          />
        )
      },
      {
        name: 'Ineligible year submitted',
        description: 'User had submitted an ineligible response for unit 6 intentions',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            unit6Intention="no"
          />
        )
      },
      {
        name: 'Eligible year submitted, user does not have a school',
        description: 'User had submitted an eligible response for unit 6 intentions',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            unit6Intention="yes1718"
          />
        )
      },

      // Ideally we would have a story here for when the user has a school, but has
      // not confirmed it for this application, however we dont end up with any schools
      // in our dropdown in storybook

      {
        name: 'User has confirmed school',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            unit6Intention="yes1718"
            schoolId="1234"
            schoolName="Code.org Junior Academy"
            hasConfirmedSchool={true}
          />
        )
      },

      {
        name: 'Admin override before user filled anything out',
        description: 'All bubbles should be green. We should have a get code button',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            unit6Intention=""
            schoolId=""
            schoolName=""
            getsFullDiscount={true}
            initialDiscountCode={null}
            adminSetStatus={true}
          />
        )
      },

      {
        name: 'Admin override after user answered unit6 intention',
        description: 'Should still have green bubbles because of override',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            unit6Intention="no"
            schoolId=""
            schoolName=""
            getsFullDiscount={false}
            initialDiscountCode={null}
            adminSetStatus={true}
          />
        )
      },
      {
        name: 'Not currently distributing discount codes',
        story: () => (
          <EligibilityChecklist
            {...defaultProps}
            currentlyDistributingDiscountCodes={false}
          />
        )
      },
    ]);
};

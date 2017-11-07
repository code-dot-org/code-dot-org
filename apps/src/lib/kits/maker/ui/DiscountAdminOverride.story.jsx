import React from 'react';
import DiscountAdminOverride from './DiscountAdminOverride';
import {Status} from '../../../../lib/ui/ValidationStep';

export default storybook => {
  return storybook
    .storiesOf('DiscountAdminOverride', module)
    .addStoryTable([
      {
        name: 'DiscountAdminOverride',
        description: 'Admin Override for maker discount code eligibility',
        story: () => (
          <DiscountAdminOverride
            statusPD={Status.SUCCEEDED}
            statusStudentCount={Status.FAILED}
          />
        )
      },
    ]);
};

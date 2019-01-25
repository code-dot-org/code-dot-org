import React from 'react';
import DiscountCodeInstructions from './DiscountCodeInstructions';

export default storybook => {
  return storybook
    .storiesOf('MakerToolkit/Discounts/Discount Code Instructions', module)
    .addStoryTable([
      {
        name: 'Full Discount',
        description: 'Discount Code Instructions when qualified for a full discount',
        story: () => (
          <DiscountCodeInstructions
            discountCode="123abc"
            expiration="2018-12-31T00:00:00.000Z"
          />
        )
      }
    ]);
};

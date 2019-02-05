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
            expiration="2034-12-31T00:00:00.000Z"
          />
        )
      },
      {
        name: 'Expired Discount',
        description: 'Discount Code Instructions when code is expired',
        story: () => (
          <DiscountCodeInstructions
            discountCode="123abc"
            expiration="2017-12-31T00:00:00.000Z"
          />
        )
      }
    ]);
};

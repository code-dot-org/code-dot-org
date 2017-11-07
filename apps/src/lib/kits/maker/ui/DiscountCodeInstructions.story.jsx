import React from 'react';
import DiscountCodeInstructions from './DiscountCodeInstructions';

export default storybook => {
  return storybook
    .storiesOf('Discount Code Instructions', module)
    .addStoryTable([
      {
        name: 'Full Discount',
        description: 'Discount Code Instructions when qualified for a full discount',
        story: () => (
          <DiscountCodeInstructions
            discountCode="123abc"
            fullDiscount={true}
          />
        )
      },
      {
        name: 'Partial Discount',
        description: 'Discount Code Insturctions when qualified for a partial discount',
        story: () => (
          <DiscountCodeInstructions
            discountCode="456def"
            fullDiscount={false}
          />
        )
      },
    ]);
};

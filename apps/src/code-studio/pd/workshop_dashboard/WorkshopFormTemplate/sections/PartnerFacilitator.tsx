import {Heading2} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import {SectionProps} from '../types';

export const PartnerFacilitator: FC<SectionProps> = ({state, handleChange}) => {
  return (
    <div>
      <Heading2 visualAppearance="heading-sm">
        Partner and Facilitator Information
      </Heading2>
    </div>
  );
};

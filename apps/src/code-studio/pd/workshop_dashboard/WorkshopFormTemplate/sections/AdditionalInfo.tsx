import {Heading2} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import {SectionProps} from '../types';

export const AdditionalInfo: FC<SectionProps> = ({state, handleChange}) => {
  return (
    <div>
      <Heading2 visualAppearance="heading-sm">Additional Info</Heading2>
    </div>
  );
};

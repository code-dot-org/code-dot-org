import {Heading2} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import {ScheduleProps} from '../types';

export const Schedule: FC<ScheduleProps> = ({state}) => {
  return (
    <div>
      <Heading2 visualAppearance="heading-sm">Schedule</Heading2>
    </div>
  );
};

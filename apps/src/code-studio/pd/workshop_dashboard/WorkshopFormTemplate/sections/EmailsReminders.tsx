import {Heading2} from '@code-dot-org/component-library/typography';
import React, {FC} from 'react';

import {SectionProps} from '../types';

export const EmailsReminders: FC<SectionProps> = ({dispatchWorkshop}) => {
  return (
    <div>
      <Heading2 visualAppearance="heading-sm">Emails & Reminders</Heading2>
    </div>
  );
};

import {Heading2} from '@code-dot-org/component-library/typography';
import React, {FC, memo} from 'react';

import {SectionProps} from '../types';

export const PublishSettings: FC<SectionProps> = () => {
  return (
    <div>
      <Heading2 visualAppearance="heading-sm">Publish Settings</Heading2>
    </div>
  );
};

export default memo(PublishSettings);

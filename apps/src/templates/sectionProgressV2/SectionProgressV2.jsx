import React from 'react';
import {Heading1} from '@cdo/apps/componentLibrary/typography';
import IconKey from './IconKey';

export default function SectionProgressV2() {
  return (
    <div>
      <Heading1>Progress</Heading1>
      <IconKey isViewingLevelProgress={true} hasLevelValidation={false} />
    </div>
  );
}

import React from 'react';
import {Heading1} from '@cdo/apps/componentLibrary/typography';
import ProgressTableV2 from './ProgressTableV2';
import IconKey from './IconKey';

export default function SectionProgressV2() {
  return (
    <div>
      <Heading1>Progress</Heading1>
      <IconKey isViewingLevelProgress={true} hasLevelValidation={false} />
      <ProgressTableV2 />
    </div>
  );
}

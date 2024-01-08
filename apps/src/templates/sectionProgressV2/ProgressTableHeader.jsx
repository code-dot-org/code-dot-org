import React from 'react';
import SortByNameDropdown from '../SortByNameDropdown';

const SECTION_PROGRESS_V2 = 'SectionProgressV2';

export default function ProgressTableHeader() {
  return (
    <div>
      <div>Progress Header</div>
      <SortByNameDropdown source={SECTION_PROGRESS_V2} />
    </div>
  );
}

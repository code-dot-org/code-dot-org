import React from 'react';
import PropTypes from 'prop-types';
import SortByNameDropdown from '../SortByNameDropdown';

const SECTION_PROGRESS_V2 = 'SectionProgressV2';

export default function ProgressTableHeader({unitName, sectionId}) {
  return (
    <div>
      <div>Students</div>
      <SortByNameDropdown
        sectionId={sectionId}
        unitName={unitName}
        source={SECTION_PROGRESS_V2}
      />
    </div>
  );
}

ProgressTableHeader.propTypes = {
  sectionId: PropTypes.number,
  unitName: PropTypes.string,
};

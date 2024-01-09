import React from 'react';
import PropTypes from 'prop-types';
import SortByNameDropdown from '../SortByNameDropdown';
import styles from './progress-header.module.scss';
import {Heading6} from '@cdo/apps/componentLibrary/typography';

const SECTION_PROGRESS_V2 = 'SectionProgressV2';

export default function ProgressTableHeader({unitName, sectionId}) {
  return (
    <div className={styles.header}>
      <div className={styles.sortDropdown}>
        <Heading6 className={styles.studentHeading}>Students</Heading6>
        <SortByNameDropdown
          sectionId={sectionId}
          unitName={unitName}
          source={SECTION_PROGRESS_V2}
        />
      </div>
    </div>
  );
}

ProgressTableHeader.propTypes = {
  sectionId: PropTypes.number,
  unitName: PropTypes.string,
};

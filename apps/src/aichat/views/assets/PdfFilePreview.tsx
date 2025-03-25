import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {StrongText} from '@code-dot-org/component-library/typography';
import React from 'react';

import styles from './staged-files-preview.module.scss';

const PdfFilePreview: React.FC<{
  filename: string;
  url: string;
}> = ({filename, url}) => {
  return (
    <div className={styles['preview-pdf']} title={filename}>
      <div className={styles.fileIcon}>
        <FontAwesomeV6Icon iconName="file" />
      </div>
      <div className={styles.filenameContainer}>
        <StrongText>{filename}</StrongText>
        <span>PDF</span>
      </div>
    </div>
  );
};

export default PdfFilePreview;

import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {ProjectFile} from '@codebridge/types';
import {getFileIconNameAndStyle} from '@codebridge/utils';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './codeWidget.module.scss';

interface FileTabProps {
  file: ProjectFile;
  isActive: boolean;
  onClick: () => void;
}

const FileTab: React.FC<FileTabProps> = ({file, isActive, onClick}) => {
  const {iconName, iconStyle, isBrand} = getFileIconNameAndStyle(file);
  const iconClassName = isBrand ? 'fa-brands' : undefined;

  return (
    <div
      onClick={onClick}
      className={`${styles.fileTab} ${isActive ? styles.active : ''}`}
    >
      <div className={styles.label}>
        <FontAwesomeV6Icon
          iconName={iconName}
          iconStyle={iconStyle}
          className={iconClassName}
        />
        <Typography component="p" variant="body4">
          {file.name}
        </Typography>
      </div>
    </div>
  );
};

export default FileTab;

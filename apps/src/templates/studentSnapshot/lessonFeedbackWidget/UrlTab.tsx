import CloseButton from '@code-dot-org/component-library/closeButton';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './lessonFeeedback.module.scss';

interface UrlTabProps {
  urlName: string;
  onClickHandler: () => void;
}

const UrlTab: React.FC<UrlTabProps> = ({urlName, onClickHandler}) => {
  return (
    <div className={`${styles.fileTab} ${styles.active}`}>
      <div className={styles.label}>
        <FontAwesomeV6Icon iconName={'link'} iconStyle={'regular'} />
        <Typography component="p" variant="body4">
          {urlName}
        </Typography>
      </div>
      <CloseButton
        onClick={onClickHandler}
        color={'light'}
        aria-label={'remove resource link'}
        size="s"
      />
    </div>
  );
};

export default UrlTab;

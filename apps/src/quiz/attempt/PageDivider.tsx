import Divider from '@code-dot-org/component-library/divider';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Typography} from '@mui/material';
import React from 'react';

import styles from './page-divider.module.scss';

export interface PageDividerProps {
  pageNumber: number;
  totalPages: number;
  firstQuestionNumber: number;
  lastQuestionNumber: number;
}

// Results view after an attempt collapses every page onto one scrollable view.
const PageDivider: React.FunctionComponent<PageDividerProps> = ({
  pageNumber,
  totalPages,
  firstQuestionNumber,
  lastQuestionNumber,
}) => (
  <div className={styles.pageDivider}>
    <Divider className={styles.rule} />
    <Typography variant="overline2" component="span" className={styles.label}>
      Page {pageNumber} of {totalPages}
    </Typography>
    <FontAwesomeV6Icon
      iconName="circle"
      iconStyle="solid"
      className={styles.dot}
    />
    <Typography variant="overline2" component="span" className={styles.label}>
      {firstQuestionNumber === lastQuestionNumber
        ? `Question ${firstQuestionNumber}`
        : `Questions ${firstQuestionNumber}–${lastQuestionNumber}`}
    </Typography>
    <Divider className={styles.rule} />
  </div>
);

export default PageDivider;

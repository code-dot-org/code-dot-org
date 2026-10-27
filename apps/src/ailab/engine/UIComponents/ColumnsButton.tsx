import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button} from '@mui/material';
import React from 'react';

import styles from './columnsButton.module.scss';

interface ColumnsButtonProps {
  showAllColumns: boolean;
  onToggle: () => void;
}

const ColumnsButton = ({showAllColumns, onToggle}: ColumnsButtonProps) => (
  <Button
    variant="outlined"
    color="tertiary"
    size="extraSmall"
    className={styles.button}
    startIcon={
      showAllColumns ? (
        <FontAwesomeV6Icon
          iconName="arrows-to-line"
          className="fa-rotate-90"
          aria-hidden="true"
        />
      ) : (
        <FontAwesomeV6Icon
          iconName="arrows-left-right-to-line"
          aria-hidden="true"
        />
      )
    }
    onClick={onToggle}
  >
    {showAllColumns ? 'Collapse columns' : 'Expand columns'}
  </Button>
);

export default ColumnsButton;

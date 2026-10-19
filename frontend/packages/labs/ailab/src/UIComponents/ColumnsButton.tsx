import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip} from '@mui/material';
import React from 'react';

interface ColumnsButtonProps {
  showAllColumns: boolean;
  onToggle: () => void;
}

const ColumnsButton = ({showAllColumns, onToggle}: ColumnsButtonProps) => {
  const label = showAllColumns
    ? 'Show only features and label'
    : 'Show all columns';

  return (
    <Tooltip title={label}>
      <IconButton
        aria-label={label}
        onClick={onToggle}
        size="extraSmall"
        color="tertiary"
        variant="outlined"
      >
        <FontAwesomeV6Icon
          iconName="arrows-left-right-to-line"
          aria-hidden="true"
        />
      </IconButton>
    </Tooltip>
  );
};

export default ColumnsButton;

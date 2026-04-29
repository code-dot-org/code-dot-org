import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip, Typography} from '@mui/material';
import {useReactFlow} from '@xyflow/react';
import React from 'react';

import styles from './element-toolbar.module.scss';

interface ActionsGroupProps {
  nodeId: string;
}

export default function ActionsGroup({nodeId}: ActionsGroupProps) {
  const {deleteElements} = useReactFlow();

  const handleDelete = () => {
    deleteElements({nodes: [{id: nodeId}]});
  };

  return (
    <div className={styles.group} role="group" aria-label="Actions">
      <Typography
        variant="overline3"
        className={styles.groupLabel}
        aria-hidden="true"
      >
        Actions
      </Typography>
      <div className={styles.fontSizeButtons}>
        <Tooltip title="Delete" placement="top">
          <IconButton
            size="small"
            className={styles.fontSizeButton}
            aria-label="Delete"
            onClick={handleDelete}
          >
            <FontAwesomeV6Icon iconName="trash" />
          </IconButton>
        </Tooltip>
      </div>
    </div>
  );
}

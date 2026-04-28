import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip, Typography} from '@mui/material';
import {useReactFlow} from '@xyflow/react';
import React from 'react';

import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';

import {SketchLabNode} from '../types';

import {useNodeToolbarData} from './useNodeToolbarData';

import styles from './element-toolbar.module.scss';

interface ActionsGroupProps {
  nodeId: string;
}

export default function ActionsGroup({nodeId}: ActionsGroupProps) {
  const {deleteElements} = useReactFlow();
  const {patchNodeData} = useNodeToolbarData<SketchLabNode>(nodeId);
  const isStartMode = getIsStartMode();

  const handleDelete = () => {
    deleteElements({nodes: [{id: nodeId}]});
  };

  const handleLock = () => {
    patchNodeData({locked: true});
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
        {isStartMode && (
          <Tooltip title="Lock node" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Lock node"
              onClick={handleLock}
            >
              <FontAwesomeV6Icon iconName="lock" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

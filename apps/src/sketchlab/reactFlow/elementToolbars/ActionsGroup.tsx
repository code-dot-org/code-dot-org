import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip, Typography} from '@mui/material';
import React from 'react';

import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';

import {useClipboard} from '../context';

import styles from './element-toolbar.module.scss';

interface ActionsGroupProps {
  nodeId?: string;
  lineEdgeId?: string;
  onDelete?: () => void;
  onLock?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
}

export default function ActionsGroup({
  nodeId,
  lineEdgeId,
  onDelete,
  onLock,
  onBringToFront,
  onSendToBack,
}: ActionsGroupProps) {
  const isStartMode = getIsStartMode();
  const {duplicateNode, duplicateLine} = useClipboard();

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
        {nodeId && (
          <Tooltip title="Duplicate" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Duplicate"
              onClick={() => duplicateNode(nodeId)}
            >
              <FontAwesomeV6Icon iconName="copy" />
            </IconButton>
          </Tooltip>
        )}
        {lineEdgeId && (
          <Tooltip title="Duplicate" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Duplicate"
              onClick={() => duplicateLine(lineEdgeId)}
            >
              <FontAwesomeV6Icon iconName="copy" />
            </IconButton>
          </Tooltip>
        )}
        {onDelete && (
          <Tooltip title="Delete" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Delete"
              onClick={onDelete}
            >
              <FontAwesomeV6Icon iconName="trash" />
            </IconButton>
          </Tooltip>
        )}
        {isStartMode && onLock && (
          <Tooltip title="Lock element" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Lock element"
              onClick={onLock}
            >
              <FontAwesomeV6Icon iconName="lock" />
            </IconButton>
          </Tooltip>
        )}
        {onBringToFront && (
          <Tooltip title="Bring to front" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Bring to front"
              onClick={onBringToFront}
            >
              <FontAwesomeV6Icon iconName="bring-front" />
            </IconButton>
          </Tooltip>
        )}
        {onSendToBack && (
          <Tooltip title="Send to back" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Send to back"
              onClick={onSendToBack}
            >
              <FontAwesomeV6Icon iconName="send-back" />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

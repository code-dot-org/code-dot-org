import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Tooltip, Typography} from '@mui/material';
import React from 'react';

import {getIsStartMode} from '@cdo/apps/lab2/projects/utils';

import styles from './element-toolbar.module.scss';

interface HandlesToggle {
  visible: boolean;
  onToggle: () => void;
}

interface ActionsGroupProps {
  onDelete?: () => void;
  onLock?: () => void;
  onBringToFront?: () => void;
  onSendToBack?: () => void;
  onDuplicate?: () => void;
  // Bundled so the `visible` boolean can't be supplied without an
  // `onToggle` handler (which previously left aria-pressed undefined).
  handlesToggle?: HandlesToggle;
}

export default function ActionsGroup({
  onDelete,
  onLock,
  onBringToFront,
  onSendToBack,
  onDuplicate,
  handlesToggle,
}: ActionsGroupProps) {
  const isStartMode = getIsStartMode();

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
        {onDuplicate && (
          <Tooltip title="Duplicate" placement="top">
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label="Duplicate"
              onClick={onDuplicate}
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
        {handlesToggle && (
          <Tooltip
            title={
              handlesToggle.visible
                ? 'Hide connection handles'
                : 'Show connection handles'
            }
            placement="top"
          >
            <IconButton
              size="small"
              className={styles.fontSizeButton}
              aria-label={
                handlesToggle.visible
                  ? 'Hide connection handles'
                  : 'Show connection handles'
              }
              aria-pressed={handlesToggle.visible}
              onClick={handlesToggle.onToggle}
            >
              <FontAwesomeV6Icon
                iconName={
                  handlesToggle.visible ? 'handles-hidden' : 'handles-visible'
                }
                iconStyle={'regular'}
                iconFamily={'kit'}
              />
            </IconButton>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

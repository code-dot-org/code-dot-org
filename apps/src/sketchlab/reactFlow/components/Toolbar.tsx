import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Divider, IconButton, Paper, Tooltip} from '@mui/material';
import React, {ChangeEvent, useCallback, useId} from 'react';

import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import {SafeAndSupportedImageTypes} from '@cdo/generated-scripts/sharedConstants';

import {TOUR_GROUP, TOUR_GROUP_ATTR} from '../constants';
import {DEFAULT_STROKE_COLOR} from '../elementToolbars/toolbarPalettes';
import {ModeratedImageUploader} from '../hooks/useModeratedImageUpload';
import {AddNodeRequest, CanvasTool, ShapeType} from '../types';

import styles from './toolbar.module.scss';

interface ToolbarProps {
  onAddNode: (request: AddNodeRequest) => void;
  uploadImage: ModeratedImageUploader;
  onImageUploadError: () => void;
  canvasTool: CanvasTool;
  onSetCanvasTool: (tool: CanvasTool) => void;
}

export default function Toolbar({
  onAddNode,
  uploadImage,
  onImageUploadError,
  canvasTool,
  onSetCanvasTool,
}: ToolbarProps) {
  // Use a stable ID prefix for accessibility.
  const uid = useId();

  const addShape = useCallback(
    (shapeType: ShapeType) => {
      onAddNode({type: 'shape', data: {shapeType, label: ''}});
    },
    [onAddNode]
  );

  const onFileSelected = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      await uploadImage({
        file,
        onUploaded: src =>
          onAddNode({
            type: 'image',
            data: {src, altText: file.name.replace(/\.[^.]+$/, '')},
          }),
        onError: onImageUploadError,
      });
    },
    [uploadImage, onAddNode, onImageUploadError]
  );

  const [openFileInput, FileInput] = useHiddenFileInput(
    onFileSelected,
    SafeAndSupportedImageTypes.join(','),
    false
  );

  return (
    <Paper
      className={styles.toolbar}
      elevation={3}
      role="toolbar"
      aria-label="Canvas tools"
      aria-orientation="vertical"
    >
      <div
        className={styles.toolbarGroup}
        role="group"
        aria-label="Selection tools"
        {...{[TOUR_GROUP_ATTR]: TOUR_GROUP.selectionTools}}
      >
        <Tooltip title="Select" placement="right">
          <IconButton
            aria-label="Select tool"
            aria-pressed={canvasTool === 'cursor'}
            onClick={() => onSetCanvasTool('cursor')}
            size="small"
            color={canvasTool === 'cursor' ? 'primary' : 'tertiary'}
            variant={canvasTool === 'cursor' ? 'contained' : 'outlined'}
          >
            <FontAwesomeV6Icon iconName="arrow-pointer" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Hand Tool" placement="right">
          <IconButton
            aria-label="Hand Tool"
            aria-pressed={canvasTool === 'grab'}
            onClick={() => onSetCanvasTool('grab')}
            size="small"
            color={canvasTool === 'grab' ? 'primary' : 'tertiary'}
            variant={canvasTool === 'grab' ? 'contained' : 'outlined'}
          >
            <FontAwesomeV6Icon iconName="hand" />
          </IconButton>
        </Tooltip>
      </div>

      <Divider className={styles.divider} />

      <div
        className={styles.toolbarGroup}
        role="group"
        aria-label="Shape tools"
        {...{[TOUR_GROUP_ATTR]: TOUR_GROUP.shapeTools}}
      >
        <Tooltip title="Add rectangle" placement="right">
          <IconButton
            aria-label="Add rectangle"
            id={`${uid}-rect`}
            onClick={() => addShape('rectangle')}
            size="small"
            color="tertiary"
            variant="outlined"
          >
            <FontAwesomeV6Icon iconName="square" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add triangle" placement="right">
          <IconButton
            aria-label="Add triangle"
            id={`${uid}-tri`}
            onClick={() => addShape('triangle')}
            size="small"
            color="tertiary"
            variant="outlined"
          >
            <FontAwesomeV6Icon iconName="triangle" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add circle" placement="right">
          <IconButton
            aria-label="Add circle"
            id={`${uid}-circle`}
            onClick={() => addShape('circle')}
            size="small"
            color="tertiary"
            variant="outlined"
          >
            <FontAwesomeV6Icon iconName="circle" />
          </IconButton>
        </Tooltip>

        <Tooltip title="Add diamond" placement="right">
          <IconButton
            aria-label="Add diamond"
            id={`${uid}-diamond`}
            onClick={() => addShape('diamond')}
            size="small"
            color="tertiary"
            variant="outlined"
          >
            <FontAwesomeV6Icon iconName="diamond" />
          </IconButton>
        </Tooltip>
      </div>

      <Tooltip title="Add text" placement="right">
        <IconButton
          aria-label="Add text"
          id={`${uid}-text`}
          onClick={() =>
            onAddNode({
              type: 'text',
              data: {text: '', strokeColor: DEFAULT_STROKE_COLOR},
            })
          }
          size="small"
          color="tertiary"
          variant="outlined"
        >
          <FontAwesomeV6Icon iconName="font" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add arrow" placement="right">
        <IconButton
          aria-label="Add arrow"
          id={`${uid}-arrow`}
          onClick={() => onAddNode({type: 'line'})}
          size="small"
          color="tertiary"
          variant="outlined"
        >
          <FontAwesomeV6Icon iconName="arrow-right-long" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add image" placement="right">
        <IconButton
          aria-label="Add image"
          id={`${uid}-image`}
          onClick={openFileInput}
          size="small"
          color="tertiary"
          variant="outlined"
        >
          <FontAwesomeV6Icon iconName="image" />
        </IconButton>
      </Tooltip>
      <FileInput />
    </Paper>
  );
}

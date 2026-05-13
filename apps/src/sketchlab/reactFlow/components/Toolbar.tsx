import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {IconButton, Paper, Tooltip} from '@mui/material';
import React, {ChangeEvent, useCallback, useId} from 'react';

import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';
import {createUuid} from '@cdo/apps/utils';

import {ASSET_PATH_PREFIX} from '../constants';
import {AddNodeRequest, ShapeType} from '../types';

import styles from './toolbar.module.scss';

interface ToolbarProps {
  onAddNode: (request: AddNodeRequest) => void;
}

export default function Toolbar({onAddNode}: ToolbarProps) {
  const channelId = useAppSelector(state => state.lab.channel?.id) ?? '';
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
      if (!file || !channelId) {
        return;
      }

      const extension = file.name.split('.').pop() ?? 'png';
      const filename = `${createUuid()}.${extension}`;
      const uploadUrl = `${ASSET_PATH_PREFIX}/${channelId}/${filename}`;

      try {
        await HttpClient.put(uploadUrl, file);
        onAddNode({
          type: 'image',
          data: {src: uploadUrl, altText: file.name.replace(/\.[^.]+$/, '')},
        });
      } catch (error) {
        console.error('Failed to upload image:', error);
      }
    },
    [channelId, onAddNode]
  );

  const [openFileInput, FileInput] = useHiddenFileInput(
    onFileSelected,
    'image/*',
    false
  );

  return (
    <Paper
      className={styles.toolbar}
      elevation={3}
      role="toolbar"
      aria-label="Add shapes, lines, and images"
      aria-orientation="vertical"
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

      <Tooltip title="Add text" placement="right">
        <IconButton
          aria-label="Add text"
          id={`${uid}-text`}
          onClick={() => onAddNode({type: 'text', data: {text: ''}})}
          size="small"
          color="tertiary"
          variant="outlined"
        >
          <FontAwesomeV6Icon iconName="font" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add line" placement="right">
        <IconButton
          aria-label="Add line"
          id={`${uid}-line`}
          onClick={() => onAddNode({type: 'line'})}
          size="small"
          color="tertiary"
          variant="outlined"
        >
          <FontAwesomeV6Icon iconName="minus" />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add arrow" placement="right">
        <IconButton
          aria-label="Add arrow"
          id={`${uid}-arrow`}
          onClick={() => onAddNode({type: 'arrow'})}
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

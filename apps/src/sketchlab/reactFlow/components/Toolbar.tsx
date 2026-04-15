import {IconButton, Paper, Tooltip} from '@mui/material';
import {useReactFlow} from '@xyflow/react';
import React, {ChangeEvent, useCallback, useId} from 'react';

import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';
import useHiddenFileInput from '@cdo/apps/util/hooks/useHiddenFileInput';
import HttpClient from '@cdo/apps/util/HttpClient';
import {useAppSelector} from '@cdo/apps/util/reduxHooks';

import {
  ASSET_PATH_PREFIX,
  DEFAULT_NODE_HEIGHT,
  DEFAULT_NODE_WIDTH,
} from '../constants';
import {ShapeType} from '../types';

import styles from './toolbar.module.scss';

// SVG icons for each shape type.
function RectIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <rect x="2" y="5" width="16" height="10" fill="currentColor" />
    </svg>
  );
}

function TriangleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <polygon points="10,2 18,18 2,18" fill="currentColor" />
    </svg>
  );
}

function CircleIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <circle cx="10" cy="10" r="8" fill="currentColor" />
    </svg>
  );
}

function ImageIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <rect
        x="2"
        y="3"
        width="16"
        height="14"
        rx="1"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="7" cy="8" r="1.5" fill="currentColor" />
      <polyline
        points="2,15 7,10 11,14 14,11 18,15"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function TextIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <text
        x="10"
        y="15"
        textAnchor="middle"
        fontSize="16"
        fontWeight="bold"
        fill="currentColor"
      >
        T
      </text>
    </svg>
  );
}

interface ToolbarProps {
  onAddNode: (
    type: 'shape' | 'image' | 'text',
    data: SketchlabReactFlowNode['data']
  ) => void;
}

export default function Toolbar({onAddNode}: ToolbarProps) {
  const {screenToFlowPosition} = useReactFlow();
  const channelId = useAppSelector(state => state.lab.channel?.id) ?? '';
  // Use a stable ID prefix for accessibility.
  const uid = useId();

  const addShape = useCallback(
    (shapeType: ShapeType) => {
      // Place the new node near the center of the visible viewport.
      const position = screenToFlowPosition({
        x: window.innerWidth / 2 - DEFAULT_NODE_WIDTH / 2,
        y: window.innerHeight / 2 - DEFAULT_NODE_HEIGHT / 2,
      });
      const data: SketchlabReactFlowNode['data'] = {
        shapeType,
        label: '',
      };
      onAddNode('shape', data);
      // Return position so the caller can use it — but we pass through onAddNode.
      // The caller receives the position via the shape type + default sizes.
      // (Position is computed fresh per click; small offset added per node in the view.)
      void position;
    },
    [onAddNode, screenToFlowPosition]
  );

  const onFileSelected = useCallback(
    async (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file || !channelId) {
        return;
      }

      const extension = file.name.split('.').pop() ?? 'png';
      const filename = `${crypto.randomUUID()}.${extension}`;
      const uploadUrl = `${ASSET_PATH_PREFIX}/${channelId}/${filename}`;

      try {
        await HttpClient.put(uploadUrl, file);
        const imageData: SketchlabReactFlowNode['data'] = {
          src: uploadUrl,
          altText: file.name.replace(/\.[^.]+$/, ''),
        };
        onAddNode('image', imageData);
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
      aria-label="Add shapes and images"
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
          <RectIcon />
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
          <TriangleIcon />
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
          <CircleIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Add text" placement="right">
        <IconButton
          aria-label="Add text"
          id={`${uid}-text`}
          onClick={() => onAddNode('text', {text: ''})}
          size="small"
          color="tertiary"
          variant="outlined"
        >
          <TextIcon />
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
          <ImageIcon />
        </IconButton>
      </Tooltip>

      <FileInput />
    </Paper>
  );
}

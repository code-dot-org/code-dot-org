import {IconButton, Tooltip, Typography} from '@mui/material';
import classNames from 'classnames';
import React from 'react';

import {SketchlabReactFlowEdge} from '@cdo/apps/lab2/types';

import SwatchGroup from './SwatchGroup';
import {
  DEFAULT_LINE_STROKE_STYLE,
  DEFAULT_LINE_WIDTH,
  DEFAULT_STROKE_COLOR,
  LineStrokeStyleValue,
  LINE_STROKE_STYLE_OPTIONS,
  LINE_WIDTH_OPTIONS,
  strokeStyleFromDasharray,
  STROKE_FONT_PALETTE,
} from './toolbarPalettes';
import ToolbarShell from './ToolbarShell';

import styles from './element-toolbar.module.scss';

interface LineEdgeToolbarProps {
  edge: SketchlabReactFlowEdge;
  anchorNodeId: string;
  onSelectColor: (value: string) => void;
  onSelectWidth: (value: number) => void;
  onSelectStrokeStyle: (value: LineStrokeStyleValue) => void;
}

export default function LineEdgeToolbar({
  edge,
  anchorNodeId,
  onSelectColor,
  onSelectWidth,
  onSelectStrokeStyle,
}: LineEdgeToolbarProps) {
  const selectedValue =
    (typeof edge.style?.stroke === 'string' && edge.style.stroke) ||
    DEFAULT_STROKE_COLOR;
  const selectedWidth = Number(edge.style?.strokeWidth);
  const selectedWidthValue = LINE_WIDTH_OPTIONS.some(
    option => option.value === selectedWidth
  )
    ? selectedWidth
    : DEFAULT_LINE_WIDTH;
  const selectedStrokeStyle = strokeStyleFromDasharray(
    edge.style?.strokeDasharray
  );
  const selectedStrokeStyleValue = LINE_STROKE_STYLE_OPTIONS.some(
    option => option.value === selectedStrokeStyle
  )
    ? selectedStrokeStyle
    : DEFAULT_LINE_STROKE_STYLE;

  return (
    <ToolbarShell
      target={{type: 'edge', id: edge.id}}
      anchorNodeId={anchorNodeId}
      ariaLabel="Line style"
    >
      <SwatchGroup
        groupLabel="Line color"
        swatches={STROKE_FONT_PALETTE}
        selectedValue={selectedValue}
        onSelect={onSelectColor}
      />
      <div className={styles.group} role="group" aria-label="Line width">
        <Typography
          variant="overline3"
          className={styles.groupLabel}
          aria-hidden="true"
        >
          Line width
        </Typography>
        <div className={styles.lineStyleButtons}>
          {LINE_WIDTH_OPTIONS.map(option => {
            const isSelected = selectedWidthValue === option.value;
            return (
              <Tooltip key={option.value} title={option.label} placement="top">
                <IconButton
                  size="small"
                  className={classNames(styles.lineStyleButton, {
                    [styles.lineStyleButtonSelected]: isSelected,
                  })}
                  aria-label={`Line width: ${option.label}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectWidth(option.value)}
                >
                  {option.value}
                </IconButton>
              </Tooltip>
            );
          })}
        </div>
      </div>
      <div className={styles.group} role="group" aria-label="Stroke style">
        <Typography
          variant="overline3"
          className={styles.groupLabel}
          aria-hidden="true"
        >
          Stroke style
        </Typography>
        <div className={styles.lineStyleButtons}>
          {LINE_STROKE_STYLE_OPTIONS.map(option => {
            const isSelected = selectedStrokeStyleValue === option.value;
            return (
              <Tooltip key={option.value} title={option.label} placement="top">
                <IconButton
                  size="small"
                  className={classNames(styles.lineStyleButton, {
                    [styles.lineStyleButtonSelected]: isSelected,
                  })}
                  aria-label={`Stroke style: ${option.label}`}
                  aria-pressed={isSelected}
                  onClick={() => onSelectStrokeStyle(option.value)}
                >
                  {option.label}
                </IconButton>
              </Tooltip>
            );
          })}
        </div>
      </div>
    </ToolbarShell>
  );
}

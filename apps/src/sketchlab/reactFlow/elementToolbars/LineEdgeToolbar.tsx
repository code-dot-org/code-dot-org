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

interface LineOption {
  value: string | number;
  label: string;
}

type LinePreviewStyle = 'solid' | 'dashed' | 'dotted';

interface LineOptionGroupProps {
  groupLabel: string;
  options: readonly LineOption[];
  selectedValue: string | number;
  onSelect: (value: string | number) => void;
  ariaLabelPrefix: string;
  getButtonContent?: (option: LineOption) => React.ReactNode;
}

function LineOptionGroup({
  groupLabel,
  options,
  selectedValue,
  onSelect,
  ariaLabelPrefix,
  getButtonContent,
}: LineOptionGroupProps) {
  return (
    <div className={styles.group} role="group" aria-label={groupLabel}>
      <Typography
        variant="overline3"
        className={styles.groupLabel}
        aria-hidden="true"
      >
        {groupLabel}
      </Typography>
      <div className={styles.lineStyleButtons}>
        {options.map(option => {
          const isSelected = selectedValue === option.value;
          return (
            <Tooltip key={option.value} title={option.label} placement="top">
              <IconButton
                size="small"
                className={classNames(styles.lineStyleButton, {
                  [styles.lineStyleButtonSelected]: isSelected,
                })}
                aria-label={`${ariaLabelPrefix}: ${option.label}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(option.value)}
              >
                {getButtonContent ? getButtonContent(option) : option.label}
              </IconButton>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

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
  const renderLinePreview = (
    width: number,
    lineStyle: LinePreviewStyle
  ): React.ReactNode => (
    <span
      aria-hidden="true"
      className={styles.linePreview}
      style={{
        borderTopWidth: width,
        borderTopStyle: lineStyle,
      }}
    />
  );

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
      <LineOptionGroup
        groupLabel="Line width"
        options={LINE_WIDTH_OPTIONS}
        selectedValue={selectedWidthValue}
        onSelect={value => onSelectWidth(value as number)}
        ariaLabelPrefix="Line width"
        getButtonContent={option =>
          renderLinePreview(option.value as number, 'solid')
        }
      />
      <LineOptionGroup
        groupLabel="Stroke style"
        options={LINE_STROKE_STYLE_OPTIONS}
        selectedValue={selectedStrokeStyleValue}
        onSelect={value => onSelectStrokeStyle(value as LineStrokeStyleValue)}
        ariaLabelPrefix="Stroke style"
        getButtonContent={option =>
          renderLinePreview(2, option.value as LinePreviewStyle)
        }
      />
    </ToolbarShell>
  );
}

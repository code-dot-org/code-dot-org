import {Paper, Tooltip} from '@mui/material';
import {NodeToolbar, Position, useReactFlow} from '@xyflow/react';
import React, {useCallback} from 'react';

import {SketchlabReactFlowNode} from '@cdo/apps/lab2/types';

import {useSketchLabReadOnly} from '../context';

import {
  BACKGROUND_PALETTE,
  ColorSwatch,
  FONT_SIZE_OPTIONS,
  STROKE_FONT_PALETTE,
} from './shapePalettes';

import styles from './shape-node-toolbar.module.scss';

const TOOLBAR_OFFSET_PX = 8;

interface ShapeNodeToolbarProps {
  nodeId: string;
  data: SketchlabReactFlowNode['data'];
}

export default function ShapeNodeToolbar({
  nodeId,
  data,
}: ShapeNodeToolbarProps) {
  const readOnly = useSketchLabReadOnly();
  const {updateNodeData} = useReactFlow();

  const backgroundColor = data.backgroundColor as string | undefined;
  const strokeColor = data.strokeColor as string | undefined;
  const fontSize = data.fontSize as string | undefined;
  const fontColor = data.fontColor as string | undefined;

  const setPatch = useCallback(
    (patch: Record<string, string>) => {
      updateNodeData(nodeId, patch);
    },
    [nodeId, updateNodeData]
  );

  if (readOnly) {
    return null;
  }

  return (
    <NodeToolbar
      nodeId={nodeId}
      position={Position.Left}
      offset={TOOLBAR_OFFSET_PX}
    >
      <Paper
        className={styles.toolbar}
        elevation={3}
        role="toolbar"
        aria-label="Shape style"
      >
        <SwatchGroup
          groupLabel="Background"
          swatches={BACKGROUND_PALETTE}
          selectedValue={backgroundColor}
          onSelect={value => setPatch({backgroundColor: value})}
        />
        <SwatchGroup
          groupLabel="Stroke"
          swatches={STROKE_FONT_PALETTE}
          selectedValue={strokeColor}
          onSelect={value => setPatch({strokeColor: value})}
        />
        <FontSizeGroup
          selectedValue={fontSize}
          onSelect={value => setPatch({fontSize: value})}
        />
        <SwatchGroup
          groupLabel="Font color"
          swatches={STROKE_FONT_PALETTE}
          selectedValue={fontColor}
          onSelect={value => setPatch({fontColor: value})}
        />
      </Paper>
    </NodeToolbar>
  );
}

interface SwatchGroupProps {
  groupLabel: string;
  swatches: ColorSwatch[];
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

function SwatchGroup({
  groupLabel,
  swatches,
  selectedValue,
  onSelect,
}: SwatchGroupProps) {
  return (
    <div className={styles.group} role="group" aria-label={groupLabel}>
      <span className={styles.groupLabel} aria-hidden="true">
        {groupLabel}
      </span>
      <div className={styles.swatches}>
        {swatches.map(swatch => {
          const isSelected = selectedValue === swatch.value;
          const ariaLabel = `${groupLabel}: ${swatch.label}`;
          return (
            <Tooltip key={swatch.value} title={swatch.label} placement="top">
              <button
                type="button"
                className={`${styles.swatch} ${
                  isSelected ? styles.swatchSelected : ''
                } ${swatch.transparent ? styles.swatchTransparent : ''}`}
                style={
                  swatch.transparent
                    ? undefined
                    : {backgroundColor: swatch.value}
                }
                aria-label={ariaLabel}
                aria-pressed={isSelected}
                onClick={() => onSelect(swatch.value)}
              />
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

interface FontSizeGroupProps {
  selectedValue: string | undefined;
  onSelect: (value: string) => void;
}

function FontSizeGroup({selectedValue, onSelect}: FontSizeGroupProps) {
  return (
    <div className={styles.group} role="group" aria-label="Font size">
      <span className={styles.groupLabel} aria-hidden="true">
        Font size
      </span>
      <div className={styles.fontSizeButtons}>
        {FONT_SIZE_OPTIONS.map(option => {
          const isSelected = selectedValue === option.value;
          return (
            <Tooltip key={option.value} title={option.label} placement="top">
              <button
                type="button"
                className={`${styles.fontSizeButton} ${
                  isSelected ? styles.fontSizeButtonSelected : ''
                }`}
                aria-label={`Font size: ${option.label}`}
                aria-pressed={isSelected}
                onClick={() => onSelect(option.value)}
              >
                {option.label.charAt(0)}
              </button>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}

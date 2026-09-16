import React, {FC} from 'react';

import {DrawingTool} from './types';

import styles from './svg-canvas.module.scss';

const TOOLS: {id: DrawingTool; label: string; symbol: string}[] = [
  {id: 'select', label: 'Select', symbol: '↖'},
  {id: 'rectangle', label: 'Rectangle', symbol: '▭'},
  {id: 'circle', label: 'Circle', symbol: '○'},
  {id: 'triangle', label: 'Triangle', symbol: '△'},
  {id: 'text', label: 'Text', symbol: 'T'},
  {id: 'line', label: 'Line', symbol: '╱'},
  {id: 'freedraw', label: 'Free draw', symbol: '✏'},
];

// Named colors with accessible labels for the color palette.
const COLORS: {value: string; label: string}[] = [
  {value: '#e74c3c', label: 'Red'},
  {value: '#e67e22', label: 'Orange'},
  {value: '#f1c40f', label: 'Yellow'},
  {value: '#2ecc71', label: 'Green'},
  {value: '#3498db', label: 'Blue'},
  {value: '#9b59b6', label: 'Purple'},
  {value: '#1a1a1a', label: 'Black'},
  {value: '#ffffff', label: 'White'},
];

interface ToolbarProps {
  tool: DrawingTool;
  color: string;
  selectedId: string | null;
  onToolChange: (t: DrawingTool) => void;
  onColorChange: (c: string) => void;
  onDeleteSelected: () => void;
}

const Toolbar: FC<ToolbarProps> = ({
  tool,
  color,
  selectedId,
  onToolChange,
  onColorChange,
  onDeleteSelected,
}) => (
  <div role="toolbar" aria-label="Drawing tools" className={styles.toolbar}>
    {TOOLS.map(t => (
      <button
        key={t.id}
        type="button"
        aria-label={t.label}
        aria-pressed={tool === t.id}
        onClick={() => onToolChange(t.id)}
        className={`${styles.toolButton} ${
          tool === t.id ? styles.toolButtonActive : ''
        }`}
        title={t.label}
      >
        <span aria-hidden="true">{t.symbol}</span>
      </button>
    ))}

    <div role="separator" aria-hidden="true" className={styles.toolbarSep} />

    {COLORS.map(c => (
      <button
        key={c.value}
        type="button"
        aria-label={`${c.label}${color === c.value ? ' (selected)' : ''}`}
        aria-pressed={color === c.value}
        onClick={() => onColorChange(c.value)}
        className={styles.colorSwatch}
        style={{
          backgroundColor: c.value,
          boxShadow: color === c.value ? '0 0 0 3px #4A90E2' : undefined,
        }}
        title={c.label}
      />
    ))}

    {selectedId !== null && (
      <>
        <div
          role="separator"
          aria-hidden="true"
          className={styles.toolbarSep}
        />
        <button
          type="button"
          aria-label="Delete selected object"
          onClick={onDeleteSelected}
          className={styles.toolButton}
          title="Delete"
        >
          <span aria-hidden="true">✕</span>
        </button>
      </>
    )}
  </div>
);

export default Toolbar;

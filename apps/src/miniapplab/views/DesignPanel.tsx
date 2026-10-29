import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useCallback} from 'react';

import {AppDesign, AppElement, ElementType} from '../types';

import moduleStyles from './design-panel.module.scss';

interface DesignPanelProps {
  design: AppDesign;
  selectedId?: string;
  onAdd: (type: ElementType) => void;
  onChange: (id: string, changes: Partial<AppElement>) => void;
  onRename: (id: string, newId: string) => boolean;
  onDelete: (id: string) => void;
}

const paletteEntries: {type: ElementType; label: string; icon: string}[] = [
  {type: 'label', label: 'Text', icon: 'font'},
  {type: 'input', label: 'Input', icon: 'i-cursor'},
  {type: 'button', label: 'Button', icon: 'hand-pointer'},
  {type: 'output', label: 'Output', icon: 'message'},
];

const textLabels: Record<ElementType, string> = {
  label: 'Text',
  input: 'Placeholder',
  button: 'Label',
  output: 'Starting text',
};

/** The palette of elements to add, and the properties of the selected one. */
const DesignPanel: React.FunctionComponent<DesignPanelProps> = ({
  design,
  selectedId,
  onAdd,
  onChange,
  onRename,
  onDelete,
}) => {
  const selected = design.find(element => element.id === selectedId);

  const onIdBlur = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      if (selected && !onRename(selected.id, event.target.value)) {
        event.target.value = selected.id;
      }
    },
    [selected, onRename]
  );

  const numberField = (key: 'x' | 'y' | 'width' | 'height', label: string) =>
    selected && (
      <label className={moduleStyles.field}>
        <span>{label}</span>
        <input
          type="number"
          value={selected[key]}
          onChange={event =>
            onChange(selected.id, {[key]: Number(event.target.value) || 0})
          }
        />
      </label>
    );

  return (
    <div className={moduleStyles.panel}>
      <h3>Add to the screen</h3>
      <div className={moduleStyles.palette}>
        {paletteEntries.map(entry => (
          <MuiButton
            key={entry.type}
            variant="outlined"
            color="primary"
            size="small"
            startIcon={<FontAwesomeV6Icon iconName={entry.icon} />}
            onClick={() => onAdd(entry.type)}
          >
            {entry.label}
          </MuiButton>
        ))}
      </div>

      <h3>Properties</h3>
      {selected ? (
        <div className={moduleStyles.properties} key={selected.id}>
          <label className={moduleStyles.field}>
            <span>ID</span>
            <input
              type="text"
              defaultValue={selected.id}
              onBlur={onIdBlur}
              onKeyDown={event =>
                event.key === 'Enter' && event.currentTarget.blur()
              }
            />
          </label>
          <label className={moduleStyles.field}>
            <span>{textLabels[selected.type]}</span>
            {selected.type === 'output' || selected.type === 'label' ? (
              <textarea
                rows={3}
                value={selected.text}
                onChange={event =>
                  onChange(selected.id, {text: event.target.value})
                }
              />
            ) : (
              <input
                type="text"
                value={selected.text}
                onChange={event =>
                  onChange(selected.id, {text: event.target.value})
                }
              />
            )}
          </label>
          <div className={moduleStyles.row}>
            {numberField('x', 'X')}
            {numberField('y', 'Y')}
          </div>
          <div className={moduleStyles.row}>
            {numberField('width', 'Width')}
            {numberField('height', 'Height')}
          </div>
          <MuiButton
            variant="outlined"
            color="error"
            size="small"
            startIcon={<FontAwesomeV6Icon iconName="trash" />}
            onClick={() => onDelete(selected.id)}
          >
            Delete
          </MuiButton>
        </div>
      ) : (
        <p className={moduleStyles.hint}>
          Select an element on the screen to change it, or drag it to move it.
        </p>
      )}
    </div>
  );
};

export default DesignPanel;

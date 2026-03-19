import Alert from '@code-dot-org/component-library/alert';
import FontAwesomeV6Icon from '@code-dot-org/component-library/fontAwesomeV6Icon';
import {Button as MuiButton} from '@mui/material';
import React, {useEffect, useState} from 'react';

import moduleStyles from './edit-music-level-data.module.scss';

interface RawJsonEditorProps {
  fieldName: string;
  currentValue?: object;
  onChange: (newValue: object) => void;
}

const RawJsonEditor: React.FunctionComponent<RawJsonEditorProps> = ({
  fieldName,
  currentValue,
  onChange,
}) => {
  const [status, setStatus] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [currentValueString, setCurrentValueString] = useState<string>(
    currentValue ? JSON.stringify(currentValue, null, 2) : ''
  );

  const onUpdate = (newValue: string, closeEditor = false) => {
    try {
      onChange(JSON.parse(newValue));
      setStatus(`Updated at ${new Date().toLocaleTimeString()}`);
      if (closeEditor) {
        setEditing(false);
      }
    } catch (error) {
      setStatus(`ERROR: ${(error as Error).message}`);
    }
  };

  useEffect(() => {
    if (currentValue) {
      setCurrentValueString(JSON.stringify(currentValue, null, 2));
    }
  }, [currentValue]);

  return (
    <div className={moduleStyles.section}>
      <div className={moduleStyles.row}>
        <MuiButton
          variant="contained"
          color="primary"
          size="small"
          onClick={() => {
            editing ? onUpdate(currentValueString, true) : setEditing(true);
          }}
          type="button"
          startIcon={
            <FontAwesomeV6Icon iconName={editing ? 'circle-check' : 'edit'} />
          }
        >
          {editing ? 'Done' : 'Edit'}
        </MuiButton>
        {editing && (
          <MuiButton
            variant="outlined"
            color="tertiary"
            size="small"
            loadingPosition="start"
            onClick={() => onUpdate(currentValueString)}
            type="button"
            startIcon={<FontAwesomeV6Icon iconName="upload" />}
          >
            {'Update'}
          </MuiButton>
        )}
        {status && (
          <Alert
            text={status}
            type={status.includes('ERROR') ? 'danger' : 'success'}
            size="xs"
          />
        )}
      </div>
      {editing ? (
        <textarea
          name={fieldName}
          value={currentValueString}
          onChange={event => setCurrentValueString(event.target.value)}
          className={moduleStyles.textarea}
        />
      ) : (
        <p className={moduleStyles.renderedJson}>{currentValueString}</p>
      )}
    </div>
  );
};

export default RawJsonEditor;

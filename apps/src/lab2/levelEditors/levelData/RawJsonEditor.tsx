import React, {useEffect, useState} from 'react';

import Alert from '@cdo/apps/componentLibrary/alert/Alert';
import {Button} from '@cdo/apps/componentLibrary/button';

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
      <div className={moduleStyles.row}>
        <Button
          text={editing ? 'Done' : 'Edit'}
          onClick={() => {
            editing ? onUpdate(currentValueString, true) : setEditing(true);
          }}
          size="s"
          iconLeft={{iconName: editing ? 'circle-check' : 'edit'}}
        />
        {editing && (
          <Button
            text="Update"
            onClick={() => onUpdate(currentValueString)}
            size="s"
            iconLeft={{iconName: 'upload'}}
            color="gray"
            type="secondary"
          />
        )}
        {status && (
          <Alert
            text={status}
            type={status.includes('ERROR') ? 'danger' : 'success'}
            size="xs"
          />
        )}
      </div>
    </div>
  );
};

export default RawJsonEditor;

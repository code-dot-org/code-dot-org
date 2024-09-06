import React, {useState} from 'react';

import {Button} from '@cdo/apps/componentLibrary/button';
import {BodyThreeText} from '@cdo/apps/componentLibrary/typography';

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
  const [currentValueString, setCurrentValueString] = useState<string>(
    currentValue ? JSON.stringify(currentValue, null, 2) : ''
  );

  const onUpdate = (newValue: string) => {
    try {
      onChange(JSON.parse(newValue));
      setStatus(`Updated at ${new Date().toLocaleTimeString()}`);
    } catch (error) {
      setStatus(`ERROR: ${(error as Error).message}`);
    }
  };

  return (
    <div className={moduleStyles.section}>
      <textarea
        name={fieldName}
        value={currentValueString}
        onChange={event => setCurrentValueString(event.target.value)}
        className={moduleStyles.textarea}
      />
      <div className={moduleStyles.row}>
        <Button
          text="Update"
          onClick={() => onUpdate(currentValueString)}
          size="s"
        />
        <BodyThreeText className={moduleStyles.noMargin}>
          {status}
        </BodyThreeText>
      </div>
    </div>
  );
};

export default RawJsonEditor;

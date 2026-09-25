import {Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {parseMode, serializeMode, withDefaultTrainer} from './ailabMode';
import AilabModeFields, {AilabDataset} from './AilabModeFields';

import moduleStyles from './edit-ailab-mode.module.scss';

function addDefaultTrainer(rawMode: string): string {
  const mode = parseMode(rawMode);
  return mode && mode.trainer === undefined
    ? serializeMode(withDefaultTrainer(mode))
    : rawMode;
}

interface EditAilabModeProps {
  initialMode: string | null;
  datasets: AilabDataset[];
  initialUsesLab2: boolean;
  // Calls back with the Lab 2 checkbox's new state; returns an unsubscribe.
  subscribeToUsesLab2?: (onChange: (usesLab2: boolean) => void) => () => void;
}

const EditAilabMode: React.FunctionComponent<EditAilabModeProps> = ({
  initialMode,
  datasets,
  initialUsesLab2,
  subscribeToUsesLab2,
}) => {
  // Decided only when Lab 2 is toggled, so typing valid JSON does not swap out the text area.
  const [showFields, setShowFields] = useState(
    () => initialUsesLab2 && parseMode(initialMode) !== null
  );
  // Rewritten only by a field edit or by adding the default trainer; otherwise saved byte-for-byte.
  const [rawMode, setRawMode] = useState(() =>
    showFields ? addDefaultTrainer(initialMode ?? '') : initialMode ?? ''
  );
  const [usesLab2, setUsesLab2] = useState(initialUsesLab2);
  const rawModeRef = useRef(rawMode);
  rawModeRef.current = rawMode;

  useEffect(
    () =>
      subscribeToUsesLab2?.(checked => {
        const canShowFields = checked && parseMode(rawModeRef.current) !== null;
        setUsesLab2(checked);
        setShowFields(canShowFields);
        if (canShowFields) {
          setRawMode(addDefaultTrainer(rawModeRef.current));
        }
      }),
    [subscribeToUsesLab2]
  );

  const parsedMode = showFields ? parseMode(rawMode) : null;
  if (parsedMode) {
    return (
      <div>
        <input
          id="level_mode"
          name="level[mode]"
          type="hidden"
          value={rawMode}
        />
        <AilabModeFields
          mode={parsedMode}
          datasets={datasets}
          onChange={newMode => setRawMode(serializeMode(newMode))}
        />
      </div>
    );
  }

  return (
    <div>
      {usesLab2 && (
        <Typography variant="body3" className={moduleStyles.warningText}>
          This mode is not a valid JSON object, so it cannot be shown as fields.
          Fix the JSON below, save the level, and reload this page.
        </Typography>
      )}
      <label className={moduleStyles.fieldArea}>
        <div className={moduleStyles.label}>Mode JSON</div>
        <textarea
          id="level_mode"
          name="level[mode]"
          placeholder="Insert JSON Data"
          rows={10}
          value={rawMode}
          onChange={e => setRawMode(e.target.value)}
          className="input-block-level"
        />
      </label>
    </div>
  );
};

export default EditAilabMode;

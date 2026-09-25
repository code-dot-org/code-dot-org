import React, {useEffect, useRef, useState} from 'react';

import {
  cleanMode,
  parseMode,
  serializeMode,
  withDefaultTrainer,
} from './ailabMode';
import AilabModeFields, {AilabDataset} from './AilabModeFields';

import moduleStyles from './edit-ailab-mode.module.scss';

interface EditAilabModeProps {
  initialMode: string | null;
  datasets: AilabDataset[];
  initialUsesLab2: boolean;
  // Calls back with the Lab 2 checkbox's new state; returns an unsubscribe.
  subscribeToUsesLab2?: (onChange: (usesLab2: boolean) => void) => () => void;
}

interface FieldsState {
  rawMode: string;
  removed: string[];
}

// The fields show only what Lab 2 AI Lab reads, so the saved mode is cleaned to match.
function prepareForFields(
  rawMode: string,
  knownDatasetIds: string[]
): FieldsState {
  const parsedMode = parseMode(rawMode);
  const {mode, removed} = cleanMode(parsedMode ?? {}, knownDatasetIds);
  return {
    rawMode: serializeMode(withDefaultTrainer(mode)),
    removed: parsedMode ? removed : ['the saved mode, which is not valid JSON'],
  };
}

const EditAilabMode: React.FunctionComponent<EditAilabModeProps> = ({
  initialMode,
  datasets,
  initialUsesLab2,
  subscribeToUsesLab2,
}) => {
  const knownDatasetIds = datasets.map(dataset => dataset.id);
  const [usesLab2, setUsesLab2] = useState(initialUsesLab2);
  const [state, setState] = useState<FieldsState>(() =>
    initialUsesLab2
      ? prepareForFields(initialMode ?? '', knownDatasetIds)
      : {rawMode: initialMode ?? '', removed: []}
  );
  const rawModeRef = useRef(state.rawMode);
  rawModeRef.current = state.rawMode;
  const knownDatasetIdsRef = useRef(knownDatasetIds);
  knownDatasetIdsRef.current = knownDatasetIds;

  useEffect(
    () =>
      subscribeToUsesLab2?.(checked => {
        setUsesLab2(checked);
        if (checked) {
          setState(
            prepareForFields(rawModeRef.current, knownDatasetIdsRef.current)
          );
        } else {
          setState({rawMode: rawModeRef.current, removed: []});
        }
      }),
    [subscribeToUsesLab2]
  );

  const setRawMode = (rawMode: string) =>
    setState(current => ({...current, rawMode}));

  if (usesLab2) {
    return (
      <div>
        <input
          id="level_mode"
          name="level[mode]"
          type="hidden"
          value={state.rawMode}
        />
        <AilabModeFields
          mode={parseMode(state.rawMode) ?? {}}
          datasets={datasets}
          removed={state.removed}
          onChange={newMode => setRawMode(serializeMode(newMode))}
        />
      </div>
    );
  }

  return (
    <label className={moduleStyles.fieldArea}>
      <div className={moduleStyles.label}>Mode JSON</div>
      <textarea
        id="level_mode"
        name="level[mode]"
        placeholder="Insert JSON Data"
        rows={10}
        value={state.rawMode}
        onChange={e => setRawMode(e.target.value)}
        className="input-block-level"
      />
    </label>
  );
};

export default EditAilabMode;

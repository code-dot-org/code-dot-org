import type {InstructionsKey} from '@code-dot-org/ailab';
import {Typography} from '@mui/material';
import React, {useEffect, useRef, useState} from 'react';

import {
  ACTION_FIELDS,
  cleanDynamicInstructions,
  DynamicInstructions,
  DynamicInstructionsField,
  parseDynamicInstructions,
  SCREEN_FIELDS,
  serializeDynamicInstructions,
  setInstructionsText,
} from './ailabDynamicInstructions';

import moduleStyles from './edit-ailab-dynamic-instructions.module.scss';

interface EditAilabDynamicInstructionsProps {
  initialDynamicInstructions: string | null;
  // Text shown when a key has no level-specific instructions.
  defaults: Partial<Record<InstructionsKey, string>>;
  initialUsesLab2: boolean;
  // Calls back with the Lab 2 checkbox's new state; returns an unsubscribe.
  subscribeToUsesLab2?: (onChange: (usesLab2: boolean) => void) => () => void;
}

interface FieldsState {
  rawDynamicInstructions: string;
  removed: string[];
}

const TEXT_AREA_ROWS = 3;

// The fields show only what Lab 2 AI Lab reads, so the saved value is cleaned to match.
function prepareForFields(rawDynamicInstructions: string): FieldsState {
  const parsed = parseDynamicInstructions(rawDynamicInstructions);
  const {dynamicInstructions, removed} = cleanDynamicInstructions(parsed ?? {});
  return {
    rawDynamicInstructions: serializeDynamicInstructions(dynamicInstructions),
    removed: parsed
      ? removed
      : ['the saved dynamic instructions, which are not valid JSON'],
  };
}

const EditAilabDynamicInstructions: React.FunctionComponent<
  EditAilabDynamicInstructionsProps
> = ({
  initialDynamicInstructions,
  defaults,
  initialUsesLab2,
  subscribeToUsesLab2,
}) => {
  const [usesLab2, setUsesLab2] = useState(initialUsesLab2);
  const [state, setState] = useState<FieldsState>(() =>
    initialUsesLab2
      ? prepareForFields(initialDynamicInstructions ?? '')
      : {rawDynamicInstructions: initialDynamicInstructions ?? '', removed: []}
  );
  const rawRef = useRef(state.rawDynamicInstructions);
  rawRef.current = state.rawDynamicInstructions;

  useEffect(
    () =>
      subscribeToUsesLab2?.(checked => {
        setUsesLab2(checked);
        if (checked) {
          setState(prepareForFields(rawRef.current));
        } else {
          setState({rawDynamicInstructions: rawRef.current, removed: []});
        }
      }),
    [subscribeToUsesLab2]
  );

  const setRawDynamicInstructions = (rawDynamicInstructions: string) =>
    setState(current => ({...current, rawDynamicInstructions}));

  if (!usesLab2) {
    return (
      <label className={moduleStyles.fieldArea}>
        <div className={moduleStyles.label}>Dynamic instructions JSON</div>
        <textarea
          id="level_dynamic_instructions"
          name="level[dynamic_instructions]"
          placeholder="Insert JSON Data"
          rows={10}
          value={state.rawDynamicInstructions}
          onChange={e => setRawDynamicInstructions(e.target.value)}
          className={moduleStyles.textArea}
        />
      </label>
    );
  }

  const dynamicInstructions = (parseDynamicInstructions(
    state.rawDynamicInstructions
  ) ?? {}) as DynamicInstructions;

  const renderField = ({key, label}: DynamicInstructionsField) => (
    <label key={key} className={moduleStyles.fieldArea}>
      <div className={moduleStyles.label}>{label}</div>
      <textarea
        name={`ailab_dynamic_instructions_${key}`}
        placeholder={defaults[key]}
        rows={TEXT_AREA_ROWS}
        value={dynamicInstructions[key] ?? ''}
        onChange={e =>
          setRawDynamicInstructions(
            serializeDynamicInstructions(
              setInstructionsText(dynamicInstructions, key, e.target.value)
            )
          )
        }
        className={moduleStyles.textArea}
      />
    </label>
  );

  return (
    <div>
      <input
        id="level_dynamic_instructions"
        name="level[dynamic_instructions]"
        type="hidden"
        value={state.rawDynamicInstructions}
      />
      <Typography variant="body4" className={moduleStyles.descriptionText}>
        Markdown shown in the instructions panel as students work. Leave a field
        blank to show the default text, which appears greyed out.
      </Typography>
      {state.removed.length > 0 && (
        <Typography variant="body4" className={moduleStyles.warningText}>
          These saved values are not valid for Lab 2 AI Lab and will be removed
          when you save: {state.removed.join('; ')}
        </Typography>
      )}
      <Typography variant="body2" className={moduleStyles.sectionHeading}>
        Screens
      </Typography>
      {SCREEN_FIELDS.map(renderField)}
      <Typography variant="body2" className={moduleStyles.sectionHeading}>
        Student actions
      </Typography>
      {ACTION_FIELDS.map(renderField)}
    </div>
  );
};

export default EditAilabDynamicInstructions;

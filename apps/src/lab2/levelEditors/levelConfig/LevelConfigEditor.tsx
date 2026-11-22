// The level edit page's editor for a lab whose settings are a zod schema:
// the schema form, a list of what is wrong, the value as JSON for reading,
// and a hidden input that the level form saves.

import {Button as MuiButton, Typography as MuiTypography} from '@mui/material';
import React, {useMemo, useState} from 'react';
import type {ZodType} from 'zod';

import {CHECKLIST_WIDGET} from '@cdo/apps/lab2/checklist/checklistSchema';

import {ChecklistWidget} from '../checklist/ChecklistEditor';
import IconPickerWidget, {ICON_WIDGET} from '../iconPicker/IconPickerWidget';
import SchemaForm, {
  problemsFrom,
  ReferenceOption,
  Widget,
} from '../schemaForm/SchemaForm';

import styles from './level-config-editor.module.scss';

export interface LevelConfigEditorProps {
  schema: ZodType;
  /** The stored value; undefined for a level not yet using the schema. */
  initialValue: unknown;
  /** The level form's name for the property, e.g. "level[level_config]". */
  inputName: string;
  /** Writes a level's older settings as a value of the schema, with a
      line for each one that could not be carried over. */
  convert?: () => {value: unknown; dropped: string[]};
  /** The value a feature starts with when it is switched on, by path. */
  featureStart?: (path: string, value: unknown) => unknown;
  /** Draws the level as the current value would run it. */
  renderPreview?: (value: unknown, valid: boolean) => React.ReactNode;
  widgets?: Record<string, Widget>;
  /** Lists of choices for fields whose options name them as "@name". */
  suppliedOptions?: Record<string, ReferenceOption[]>;
}

const LevelConfigEditor: React.FunctionComponent<LevelConfigEditorProps> = ({
  schema,
  initialValue,
  inputName,
  convert,
  featureStart,
  renderPreview,
  widgets,
  suppliedOptions,
}) => {
  const [value, setValue] = useState<unknown>(initialValue);
  const [dropped, setDropped] = useState<string[]>([]);
  const [showJson, setShowJson] = useState(false);
  const issues = useMemo(() => {
    if (value === undefined) {
      return [];
    }
    const result = schema.safeParse(value);
    return result.success ? [] : result.error.issues;
  }, [schema, value]);
  const problems = useMemo(() => problemsFrom(issues), [issues]);

  if (value === undefined) {
    return (
      <div className={styles.editor} data-level-config-active="false">
        <p>
          This level&apos;s settings are still in the older properties, which
          the form below edits.
        </p>
        {convert && (
          <MuiButton
            variant="contained"
            onClick={() => {
              const converted = convert();
              setDropped(converted.dropped);
              setValue(converted.value);
            }}
          >
            Convert to the new settings
          </MuiButton>
        )}
      </div>
    );
  }

  return (
    <div className={styles.editor} data-level-config-active="true">
      <input type="hidden" name={inputName} value={JSON.stringify(value)} />
      {dropped.length > 0 && (
        <div className={styles.notice} role="status">
          Not carried over: {dropped.join('; ')}
        </div>
      )}
      {renderPreview?.(value, issues.length === 0)}
      <div className={styles.status} role="status" aria-live="polite">
        {issues.length === 0 ? (
          <span className={styles.ok}>The settings are valid.</span>
        ) : (
          <span className={styles.bad}>
            {issues.length === 1 ? '1 problem' : `${issues.length} problems`} to
            fix before the level will use these settings:{' '}
            {issues
              .map(
                issue =>
                  `${issue.path.join('.') || 'settings'}: ${issue.message}`
              )
              .join('; ')}
          </span>
        )}
      </div>
      <SchemaForm
        schema={schema}
        value={value}
        onChange={setValue}
        problems={problems}
        widgets={{
          [CHECKLIST_WIDGET]: ChecklistWidget,
          [ICON_WIDGET]: IconPickerWidget,
          ...widgets,
        }}
        featureStart={featureStart && (path => featureStart(path, value))}
        suppliedOptions={suppliedOptions}
      />
      <div>
        <MuiButton size="small" onClick={() => setShowJson(!showJson)}>
          {showJson ? 'Hide the JSON' : 'Show the JSON'}
        </MuiButton>
        {showJson && (
          <>
            <MuiTypography variant="body3" component="p">
              What the level file will hold.
            </MuiTypography>
            <pre className={styles.json}>{JSON.stringify(value, null, 2)}</pre>
          </>
        )}
      </div>
    </div>
  );
};

export default LevelConfigEditor;

// The levelbuilder editor for a level's checklist (checklistSchema.ts), for
// any Lab2 lab.

import {Button as MuiButton} from '@mui/material';
import React, {useMemo} from 'react';
import type {ZodType} from 'zod';

import {
  Path,
  problemsFrom,
  SchemaField,
  SchemaFormScope,
  WidgetProps,
} from '../schemaForm/SchemaForm';
import {elementOf, shapeOf, startValue} from '../schemaForm/schemaNodes';

import styles from './checklist-editor.module.scss';

interface Step {
  text?: string;
  check?: {kind?: string};
  shownWhen?: unknown;
  id?: string;
}

interface Checklist {
  title?: string;
  steps?: Step[];
  collapsedText?: string;
}

/** The checklist's parts, drawn from its schema with steps as cards. */
const ChecklistFields: React.FunctionComponent<WidgetProps> = ({
  schema,
  value,
  onChange,
  path,
}) => {
  const shape = shapeOf(schema);
  const checklist = (value ?? {}) as Checklist;
  const steps = checklist.steps ?? [];
  const stepSchema = elementOf(shape.steps);
  const stepShape = shapeOf(stepSchema);
  const set = (key: keyof Checklist, next: unknown) => {
    const updated: Record<string, unknown> = {...checklist};
    if (next === undefined) {
      delete updated[key];
    } else {
      updated[key] = next;
    }
    onChange(updated);
  };
  const setSteps = (next: Step[]) =>
    set('steps', next.length ? next : undefined);
  const setStep = (index: number, key: keyof Step, next: unknown) =>
    setSteps(
      steps.map((step, i) => {
        if (i !== index) {
          return step;
        }
        const updated: Record<string, unknown> = {...step};
        if (next === undefined) {
          delete updated[key];
        } else {
          updated[key] = next;
        }
        return updated as Step;
      })
    );
  const move = (from: number, to: number) => {
    const next = [...steps];
    const [moved] = next.splice(from, 1);
    next.splice(to, 0, moved);
    setSteps(next);
  };
  const stepPath = (index: number, key: string): Path => [
    ...path,
    'steps',
    index,
    key,
  ];
  return (
    <div className={styles.checklist}>
      <SchemaField
        schema={shape.title}
        value={checklist.title}
        path={[...path, 'title']}
        onChange={next => set('title', next)}
      />
      <ol className={styles.steps} aria-label="Steps">
        {steps.map((step, index) => (
          <li key={index} className={styles.step}>
            <div className={styles.stepHeader}>
              <span className={styles.stepNumber}>Step {index + 1}</span>
              <span>
                <MuiButton
                  size="small"
                  disabled={index === 0}
                  onClick={() => move(index, index - 1)}
                  aria-label={`Move step ${index + 1} up`}
                >
                  Up
                </MuiButton>
                <MuiButton
                  size="small"
                  disabled={index === steps.length - 1}
                  onClick={() => move(index, index + 1)}
                  aria-label={`Move step ${index + 1} down`}
                >
                  Down
                </MuiButton>
                <MuiButton
                  size="small"
                  color="error"
                  onClick={() => setSteps(steps.filter((_, i) => i !== index))}
                  aria-label={`Remove step ${index + 1}`}
                >
                  Remove
                </MuiButton>
              </span>
            </div>
            {(['text', 'check', 'shownWhen', 'id'] as const).map(key => (
              <SchemaField
                key={key}
                schema={stepShape[key]}
                value={step[key]}
                path={stepPath(index, key)}
                onChange={next => setStep(index, key, next)}
              />
            ))}
          </li>
        ))}
      </ol>
      <div>
        <MuiButton
          variant="outlined"
          size="small"
          onClick={() => setSteps([...steps, startValue(stepSchema) as Step])}
        >
          Add step
        </MuiButton>
      </div>
      <SchemaField
        schema={shape.collapsedText}
        value={checklist.collapsedText}
        path={[...path, 'collapsedText']}
        onChange={next => set('collapsedText', next)}
      />
    </div>
  );
};

export const ChecklistWidget = ChecklistFields;

interface ChecklistEditorProps {
  /** The lab's checklist schema, from checklistSchema(). */
  schema: ZodType;
  value: unknown;
  onChange: (value: unknown) => void;
}

/** The checklist editor on its own, outside a schema form. */
const ChecklistEditor: React.FunctionComponent<ChecklistEditorProps> = ({
  schema,
  value,
  onChange,
}) => {
  const problems = useMemo(() => {
    const result = schema.safeParse(value ?? {});
    return problemsFrom(result.success ? [] : result.error.issues);
  }, [schema, value]);
  return (
    <SchemaFormScope problems={problems}>
      <ChecklistFields
        schema={schema}
        value={value}
        onChange={onChange}
        path={[]}
      />
    </SchemaFormScope>
  );
};

export default ChecklistEditor;

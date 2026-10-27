// One of a rule's steps, on a page of its own (specs/RULE_EDITOR_PLAN.md,
// step 5): its name and the moment it runs in, above the workspace of what it
// does, which hangs below a head that says that moment.
//
// A NEW NAME IS FOLLOWED ON LEAVING, as a member's words are: whatever orders
// itself against the step names it, and a rename rewrites the project.

import {Typography} from '@mui/material';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
} from 'react';

import SimpleDropdown from '@code-dot-org/component-library/dropdown/simpleDropdown';
import TextField from '@code-dot-org/component-library/textField';

import {without} from '../../actors/editor/memberEdits';
import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import type {RuleData} from '../ruleData';
import {
  phasesOf,
  setStep,
  stepDocument,
  stepOf,
  stepProblem,
  withStepDocument,
  type StepAt,
} from '../ruleSteps';

import styles from './ruleEditor.module.css';

export interface StepPageProps {
  data: RuleData;
  place: StepAt;
  fileId: string;
  isReadOnly: boolean;
  /** Change the rule's data as the file now holds it. */
  onUpdate: (change: (data: RuleData) => RuleData) => void;
  /** The page is left: the step's name as it was opened and as it is now. */
  onLeave: (from: string, to: string) => void;
}

/** The phase a rule's own step takes when it names none: every tick. */
const EVERY_TICK = '';

export const StepPage = ({
  data,
  place,
  fileId,
  isReadOnly,
  onUpdate,
  onLeave,
}: StepPageProps) => {
  const step = stepOf(data, place);
  const opened = useRef(step?.name ?? '');
  const latest = useRef(step?.name ?? '');
  latest.current = step?.name ?? '';
  const leave = useRef(onLeave);
  leave.current = onLeave;
  useEffect(
    () => () => {
      if (latest.current !== opened.current) {
        leave.current(opened.current, latest.current);
      }
    },
    [],
  );

  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  const [draft, setDraft] = useState(step?.name ?? '');
  useEffect(() => setDraft(step?.name ?? ''), [step?.name]);
  const problem =
    draft.trim() === step?.name ? undefined : stepProblem(data, place, draft);

  if (!step) {
    return null;
  }
  const commit = () => {
    if (!problem && draft.trim() !== step.name) {
      onUpdate(now =>
        setStep(now, place, one => ({...one, name: draft.trim()})),
      );
    }
  };
  const phases = phasesOf(data, place.owner);
  const id = `${fileId}-step`;

  return (
    <div className={styles.stepPage}>
      <div
        className={styles.stepBar}
        role="group"
        aria-labelledby={`${id}-heading`}
      >
        <Typography
          ref={heading}
          id={`${id}-heading`}
          tabIndex={-1}
          variant="h5"
          component="h2"
          className={styles.heading}
        >
          Step: {step.name}
        </Typography>
        <TextField
          name={`${id}-name`}
          label="Name"
          size="s"
          readOnly={isReadOnly}
          value={draft}
          errorMessage={problem}
          onChange={(event: ChangeEvent<HTMLInputElement>) =>
            setDraft(event.target.value)
          }
          onBlur={commit}
          onKeyDown={(event: KeyboardEvent<HTMLInputElement>) => {
            if (event.key === 'Enter') {
              commit();
            } else if (event.key === 'Escape') {
              setDraft(step.name);
            }
          }}
        />
        <SimpleDropdown
          name={`${id}-phase`}
          labelText="Runs"
          size="s"
          disabled={isReadOnly}
          selectedValue={step.phase ?? EVERY_TICK}
          items={[
            ...phases.map(phase => ({
              value: phase.id,
              text: `during ${phase.name}`,
            })),
            ...(place.owner === null
              ? [{value: EVERY_TICK, text: 'every tick, in no set order'}]
              : []),
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) => {
            const phase = event.target.value;
            onUpdate(now =>
              setStep(now, place, one => {
                const rest = without(one, 'phase');
                return phase === EVERY_TICK ? rest : {...rest, phase};
              }),
            );
          }}
        />
        <Typography variant="body3" component="p" className={styles.note}>
          {phases.find(phase => phase.id === step.phase)?.summary ??
            'Runs once a frame, before or after the rule’s other steps.'}
        </Typography>
      </div>
      <div className={styles.codeBlocks}>
        <BlocklyFileEditor
          // Its head says the moment, so a new one is a new workspace.
          key={`${place.owner ?? ''}#${place.at}:${step.phase ?? EVERY_TICK}`}
          fileId={fileId}
          language="rule"
          isReadOnly={isReadOnly}
          initialContents={stepDocument(data, place)}
          memberHead={{}}
          onChange={saved =>
            onUpdate(now => withStepDocument(now, place, saved))
          }
        />
      </div>
    </div>
  );
};

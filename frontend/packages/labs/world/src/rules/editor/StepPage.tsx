// A step on a page of its own (specs/RULE_EDITOR_PLAN.md, step 5;
// specs/DRAWING_PAGE_PLAN.md): its name and the moment it runs in, above
// the workspace of what it does, which hangs below a head that says that
// moment. A rule's steps and an actor's are written on the same page.
//
// A NEW NAME IS FOLLOWED ON LEAVING, as a member's words are: whatever orders
// itself against a rule's step names it, and a rename rewrites the project.

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
import {PageDelete} from '../../actors/editor/PageDelete';
import {BlocklyFileEditor} from '../../blockly/BlocklyFileEditor';
import type {PhaseDef} from '../../engine/core/phases';
import {TrailActions} from '../../layout/TrailContext';
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

/** The phase a rule's own step takes when it names none: every tick. */
const EVERY_TICK = '';

export interface StepPageViewProps {
  name: string;
  phase?: string;
  /** The moments it may run in. */
  phases: readonly PhaseDef[];
  /** Whether it may run in no set moment, as only a rule's own step may. */
  everyTick: boolean;
  /** Why it cannot be called this, or nothing. */
  problem: (name: string) => string | undefined;
  fileId: string;
  language: 'rule' | 'actor';
  isReadOnly: boolean;
  /** Changes when the head must be built again: a new moment is a new head. */
  editorKey: string;
  /** The workspace its body is written on, read when the editor mounts. */
  document: string;
  onRename: (name: string) => void;
  onPhase: (phase: string | undefined) => void;
  onDocument: (saved: string) => void;
  /** Delete it, asked and done by the page's owner; absent, no Delete. */
  onDelete?: () => void;
}

export const StepPageView = ({
  name,
  phase,
  phases,
  everyTick,
  problem: problemOf,
  fileId,
  language,
  isReadOnly,
  editorKey,
  document,
  onRename,
  onPhase,
  onDocument,
  onDelete,
}: StepPageViewProps) => {
  const heading = useRef<HTMLHeadingElement>(null);
  useEffect(() => heading.current?.focus(), []);

  const [draft, setDraft] = useState(name);
  useEffect(() => setDraft(name), [name]);
  const problem = draft.trim() === name ? undefined : problemOf(draft);

  const commit = () => {
    if (!problem && draft.trim() !== name) {
      onRename(draft.trim());
    }
  };
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
          Step: {name}
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
              setDraft(name);
            }
          }}
        />
        <SimpleDropdown
          name={`${id}-phase`}
          labelText="Runs"
          size="s"
          disabled={isReadOnly}
          selectedValue={phase ?? EVERY_TICK}
          items={[
            ...phases.map(one => ({
              value: one.id,
              text: `during ${one.name}`,
            })),
            ...(everyTick
              ? [{value: EVERY_TICK, text: 'every tick, in no set order'}]
              : []),
          ]}
          onChange={(event: ChangeEvent<HTMLSelectElement>) =>
            onPhase(event.target.value || undefined)
          }
        />
        <Typography variant="body3" component="p" className={styles.note}>
          {phases.find(one => one.id === phase)?.summary ??
            'Runs once a frame, before or after the other steps.'}
        </Typography>
        {onDelete && !isReadOnly && (
          <TrailActions fallback={button => button}>
            <PageDelete what="step" onDelete={onDelete} />
          </TrailActions>
        )}
      </div>
      <div className={styles.codeBlocks}>
        <BlocklyFileEditor
          key={editorKey}
          fileId={fileId}
          language={language}
          isReadOnly={isReadOnly}
          initialContents={document}
          memberHead={{}}
          onChange={onDocument}
        />
      </div>
    </div>
  );
};

export interface StepPageProps {
  data: RuleData;
  place: StepAt;
  fileId: string;
  isReadOnly: boolean;
  /** Change the rule's data as the file now holds it. */
  onUpdate: (change: (data: RuleData) => RuleData) => void;
  /** The page is left: the step's name as it was opened and as it is now. */
  onLeave: (from: string, to: string) => void;
  onDelete?: () => void;
}

/** One of a rule's steps. */
export const StepPage = ({
  data,
  place,
  fileId,
  isReadOnly,
  onUpdate,
  onLeave,
  onDelete,
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

  if (!step) {
    return null;
  }
  return (
    <StepPageView
      name={step.name}
      phase={step.phase}
      phases={phasesOf(data, place.owner)}
      everyTick={place.owner === null}
      problem={name => stepProblem(data, place, name)}
      fileId={fileId}
      language="rule"
      isReadOnly={isReadOnly}
      editorKey={`${place.owner ?? ''}#${place.at}:${step.phase ?? EVERY_TICK}`}
      document={stepDocument(data, place)}
      onRename={name =>
        onUpdate(now => setStep(now, place, one => ({...one, name})))
      }
      onPhase={phase =>
        onUpdate(now =>
          setStep(now, place, one => {
            const rest = without(one, 'phase');
            return phase === undefined ? rest : {...rest, phase};
          }),
        )
      }
      onDocument={saved => onUpdate(now => withStepDocument(now, place, saved))}
      onDelete={onDelete}
    />
  );
};

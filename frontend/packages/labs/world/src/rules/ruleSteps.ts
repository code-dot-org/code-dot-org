// A rule's steps on a page of their own (specs/RULE_EDITOR_PLAN.md, step 5).
//
// A step is named by its owner and its place among the owner's steps: it
// has no id of its own, and its name, which it is exported under
// (`<Rule>.steps.<id>`), is what the page edits. The page's workspace is the
// step's head (`stepHead`) with its body below, and the rule's variables.

import type {MultiFileSource} from '@code-dot-org/core/api';

import type {Block} from '../actors/actorData';
import {without} from '../actors/editor/memberEdits';
import {STEP_HEAD, STEP_HEAD_ID} from '../blockly/bodySurfaces';
import {renameMemberInSource} from '../blockly/renameRule';
import {pascal, slug} from '../blockly/ruleMeta';
import {phasesFor, PHASES, type PhaseDef} from '../engine/core/phases';

import type {RuleData, RuleStep, RuleTrait} from './ruleData';
import type {Owner} from './ruleEdits';

/** A step's place: its owner, and where it is among the owner's steps. */
export interface StepAt {
  owner: Owner;
  at: number;
}

/** The step id the trail names a step by: `Holds Keys#0`, or `#0`. */
export const stepId = ({owner, at}: StepAt): string => `${owner ?? ''}#${at}`;

/** …and back, or nothing for an id that names no step of the rule. */
export function stepAtOf(data: RuleData, id: string): StepAt | undefined {
  const hash = id.lastIndexOf('#');
  const owner = id.slice(0, hash) || null;
  const at = Number(id.slice(hash + 1));
  return hash >= 0 && Number.isInteger(at) && stepsOf(data, owner)[at]
    ? {owner, at}
    : undefined;
}

const traitOf = (data: RuleData, owner: Owner): RuleTrait | undefined =>
  (data.traits ?? []).find(trait => trait.name === owner);

/** An owner's steps: the rule's own, or a trait's. */
export const stepsOf = (data: RuleData, owner: Owner): readonly RuleStep[] =>
  (owner === null ? data.steps : traitOf(data, owner)?.steps) ?? [];

export const stepOf = (data: RuleData, {owner, at}: StepAt) =>
  stepsOf(data, owner)[at];

/**
 * The moments an owner's step may run in: a trait's are its subject's, and
 * the world's that runs through a pause; the rule's own, any.
 */
export function phasesOf(data: RuleData, owner: Owner): readonly PhaseDef[] {
  if (owner === null) {
    return PHASES;
  }
  return phasesFor(
    traitOf(data, owner)?.subject === 'camera' ? 'camera' : 'actor',
  );
}

/** What a step's head says: when it runs, for whom. */
export function momentOf(
  data: RuleData,
  {owner}: StepAt,
  step: RuleStep,
): string {
  const phase = PHASES.find(one => one.id === step.phase);
  const when = phase ? `during ${phase.name}` : 'every tick';
  if (owner === null) {
    return phase ? `every frame, ${when}` : when;
  }
  const holder =
    traitOf(data, owner)?.subject === 'camera' ? 'camera' : 'actor';
  return `each frame, ${when}, for each ${holder} with ${owner}`;
}

/** The data with one owner's steps replaced. */
function withSteps(data: RuleData, owner: Owner, steps: RuleStep[]): RuleData {
  const listed = <T extends {steps?: RuleStep[]}>(definition: T): T => {
    const next = {...definition};
    if (steps.length) {
      next.steps = steps;
    } else {
      delete next.steps;
    }
    return next;
  };
  if (owner === null) {
    return listed(data);
  }
  return {
    ...data,
    traits: (data.traits ?? []).map(trait =>
      trait.name === owner ? listed(trait) : trait,
    ),
  };
}

/** The data with one step changed. */
export function setStep(
  data: RuleData,
  place: StepAt,
  change: (step: RuleStep) => RuleStep,
): RuleData {
  const steps = [...stepsOf(data, place.owner)];
  const was = steps[place.at];
  if (!was) {
    return data;
  }
  const next = change(was);
  if (JSON.stringify(next) === JSON.stringify(was)) {
    return data;
  }
  steps[place.at] = next;
  return withSteps(data, place.owner, steps);
}

/**
 * Why a step cannot be called this, or nothing. A step is named twice over
 * in its rule's code — by its id, and by an export made from its name
 * (`TickStep`) — and both are one list across the rule and its traits.
 */
export function stepProblem(
  data: RuleData,
  place: StepAt | undefined,
  name: string,
): string | undefined {
  const trimmed = name.trim();
  if (!slug(trimmed).replaceAll('_', '')) {
    return 'A step needs a name.';
  }
  const clashes = (other: string) =>
    slug(other) === slug(trimmed) || pascal(other) === pascal(trimmed);
  const owners: Owner[] = [null, ...(data.traits ?? []).map(one => one.name)];
  const taken = owners.some(owner =>
    stepsOf(data, owner).some(
      (step, at) =>
        !(place && place.owner === owner && place.at === at) &&
        clashes(step.name),
    ),
  );
  return taken ? `This rule already has a step called ${trimmed}.` : undefined;
}

/**
 * The data with a new step for `owner`, and where it is. Named so no other
 * step of the rule is, and run in the owner's first moment of deciding.
 */
export function addStep(
  data: RuleData,
  owner: Owner,
): {data: RuleData; place: StepAt} {
  let name = 'do something';
  for (let n = 2; stepProblem(data, undefined, name); n += 1) {
    name = `do something ${n}`;
  }
  const phases = phasesOf(data, owner);
  const phase = (phases.find(one => one.id === 'decide') ?? phases[0]).id;
  const steps = [...stepsOf(data, owner), {name, phase}];
  return {
    data: withSteps(data, owner, steps),
    place: {owner, at: steps.length - 1},
  };
}

export const removeStep = (data: RuleData, {owner, at}: StepAt): RuleData =>
  withSteps(
    data,
    owner,
    stepsOf(data, owner).filter((_, i) => i !== at),
  );

/** The workspace a step's body is written on. */
export function stepDocument(data: RuleData, place: StepAt): string {
  const step = stepOf(data, place);
  const head: Block = {
    type: STEP_HEAD,
    id: STEP_HEAD_ID,
    x: 20,
    y: 20,
    fields: {MOMENT: step ? momentOf(data, place, step) : ''},
    ...(step?.body ? {next: {block: step.body}} : {}),
  };
  return JSON.stringify(
    {
      blocks: {languageVersion: 0, blocks: [head]},
      ...(data.variables ? {variables: data.variables} : {}),
    },
    null,
    2,
  );
}

/** The data with what that workspace saved: the step's body, and the variables. */
export function withStepDocument(
  data: RuleData,
  place: StepAt,
  saved: string,
): RuleData {
  let document: {
    blocks?: {blocks?: Array<Block & {next?: {block?: Block}}>};
    variables?: unknown[];
  };
  try {
    document = JSON.parse(saved);
  } catch {
    return data;
  }
  const head = (document.blocks?.blocks ?? []).find(
    root => root.type === STEP_HEAD,
  );
  if (!head) {
    return data;
  }
  const body = head.next?.block;
  const next = setStep(data, place, step => {
    const rest = without(step, 'body');
    return body ? {...rest, body} : rest;
  });
  if (!document.variables) {
    return next;
  }
  return JSON.stringify(document.variables) === JSON.stringify(next.variables)
    ? next
    : {...next, variables: document.variables};
}

/**
 * The project with a step's new name followed: whatever orders itself
 * against it (`<Rule>#<id>`). The same project when the id is unchanged.
 */
export function renameStep(
  source: MultiFileSource,
  rule: string,
  from: string,
  to: string,
): MultiFileSource {
  const was = slug(from);
  const now = slug(to);
  return was === now || !now
    ? source
    : renameMemberInSource(source, rule, was, now);
}

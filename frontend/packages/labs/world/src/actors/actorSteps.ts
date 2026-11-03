// An actor's steps on a page of their own (specs/DRAWING_PAGE_PLAN.md), as a
// rule's are (`rules/ruleSteps`). A step is named by its place among the
// actor's steps; its name is the id it is defined under
// (`ActorBuilder.defineStep`), so two may not share one.

import {STEP_HEAD, STEP_HEAD_ID} from '../blockly/pageHeads';
import {slug} from '../blockly/ruleMeta';
import {phasesFor, PHASES} from '../engine/core/phases';

import type {ActorData, ActorStep, Block} from './actorData';
import {without} from './editor/memberEdits';

/** The moments an actor's step may run in. */
export const ACTOR_PHASES = phasesFor('actor');

/** What a step runs in when it names no moment: `defineStep`'s default. */
export const DEFAULT_PHASE = 'decide';

/** The trail's id for the step at `at`. */
export const actorStepId = (at: number): string => `#${at}`;

/** …and back, or nothing for an id that names no step of the actor. */
export function actorStepAt(data: ActorData, id: string): number | undefined {
  const at = Number(id.replace(/^#/, ''));
  return id.startsWith('#') && Number.isInteger(at) && data.steps?.[at]
    ? at
    : undefined;
}

/** What a step's head says. */
export function actorMoment(step: ActorStep): string {
  const phase = PHASES.find(one => one.id === (step.phase ?? DEFAULT_PHASE));
  return `each frame, during ${phase?.name ?? step.phase}`;
}

function withSteps(data: ActorData, steps: ActorStep[]): ActorData {
  if (steps.length) {
    return {...data, steps};
  }
  const rest = {...data};
  delete rest.steps;
  return rest;
}

/** The data with one step changed. */
export function setActorStep(
  data: ActorData,
  at: number,
  change: (step: ActorStep) => ActorStep,
): ActorData {
  const steps = [...(data.steps ?? [])];
  const was = steps[at];
  if (!was) {
    return data;
  }
  const next = change(was);
  if (JSON.stringify(next) === JSON.stringify(was)) {
    return data;
  }
  steps[at] = next;
  return withSteps(data, steps);
}

/** Why a step of this actor cannot be called this, or nothing. */
export function actorStepProblem(
  data: ActorData,
  at: number | undefined,
  name: string,
): string | undefined {
  const id = slug(name.trim());
  if (!id.replaceAll('_', '')) {
    return 'A step needs a name.';
  }
  return (data.steps ?? []).some(
    (step, i) => i !== at && slug(step.name) === id,
  )
    ? `${data.name} already has a step called ${name.trim()}.`
    : undefined;
}

/** The data with a new step, and where it is. */
export function addActorStep(data: ActorData): {data: ActorData; at: number} {
  let name = 'do something';
  for (let n = 2; actorStepProblem(data, undefined, name); n += 1) {
    name = `do something ${n}`;
  }
  const steps = [...(data.steps ?? []), {name, phase: DEFAULT_PHASE}];
  return {data: withSteps(data, steps), at: steps.length - 1};
}

export const removeActorStep = (data: ActorData, at: number): ActorData =>
  withSteps(
    data,
    (data.steps ?? []).filter((_, i) => i !== at),
  );

/** The workspace a step's body is written on. */
export function actorStepDocument(data: ActorData, at: number): string {
  const step = data.steps?.[at];
  const variables = data.blocks?.variables;
  return JSON.stringify(
    {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: STEP_HEAD,
            id: STEP_HEAD_ID,
            x: 20,
            y: 20,
            fields: {MOMENT: step ? actorMoment(step) : ''},
            ...(step?.body ? {next: {block: step.body}} : {}),
          },
        ],
      },
      ...(variables ? {variables} : {}),
    },
    null,
    2,
  );
}

/** The data with what that workspace saved: the step's body, and the variables. */
export function withActorStepDocument(
  data: ActorData,
  at: number,
  saved: string,
): ActorData {
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
  const next = setActorStep(data, at, step => {
    const rest = without(step, 'body');
    return body ? {...rest, body} : rest;
  });
  return withVariables(next, document.variables);
}

/** The data with the workspace's variables, when it saved any that differ. */
export function withVariables(
  data: ActorData,
  variables: unknown[] | undefined,
): ActorData {
  return !variables ||
    JSON.stringify(variables) === JSON.stringify(data.blocks?.variables)
    ? data
    : {...data, blocks: {...data.blocks, variables}};
}

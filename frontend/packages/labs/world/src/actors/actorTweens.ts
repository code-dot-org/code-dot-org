// An actor's tweens on pages of their own (specs/TWEENS_AS_DATA_PLAN.md). A
// tween is named on the trail and by `play tween` by its id, which is minted
// once from its first name and kept; its name is what the page edits.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {TWEEN_HEAD, TWEEN_HEAD_ID} from '../blockly/pageHeads';
import {tweenValue} from '../blockly/tweens';

import type {ActorData, ActorTween, Block, Socket} from './actorData';
import {withVariables} from './actorSteps';

const second = (): Socket => ({
  shadow: {type: 'math_number', fields: {NUM: 1}},
});

/** The tween with this id, and where it is. */
export function actorTweenAt(
  data: ActorData,
  id: string,
): {tween: ActorTween; at: number} | undefined {
  const at = (data.tweens ?? []).findIndex(one => one.id === id);
  return at < 0 ? undefined : {tween: data.tweens![at], at};
}

function withTweens(data: ActorData, tweens: ActorTween[]): ActorData {
  if (tweens.length) {
    return {...data, tweens};
  }
  const rest = {...data};
  delete rest.tweens;
  return rest;
}

/** The data with one tween changed. */
export function setActorTween(
  data: ActorData,
  id: string,
  change: (tween: ActorTween) => ActorTween,
): ActorData {
  const found = actorTweenAt(data, id);
  if (!found) {
    return data;
  }
  const next = change(found.tween);
  if (JSON.stringify(next) === JSON.stringify(found.tween)) {
    return data;
  }
  const tweens = [...data.tweens!];
  tweens[found.at] = next;
  return withTweens(data, tweens);
}

/** Why a tween of this actor cannot be called this, or nothing. */
export function actorTweenProblem(
  data: ActorData,
  id: string | undefined,
  name: string,
): string | undefined {
  const trimmed = name.trim();
  if (!trimmed) {
    return 'A tween needs a name.';
  }
  return (data.tweens ?? []).some(one => one.id !== id && one.name === trimmed)
    ? `${data.name} already has a tween called ${trimmed}.`
    : undefined;
}

/** An id from a name: its words, lower case, joined by hyphens. */
const idFrom = (name: string): string =>
  name
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .join('-') || 'tween';

/** The data with a new tween, and its id. */
export function addActorTween(data: ActorData): {data: ActorData; id: string} {
  let name = 'move';
  for (let n = 2; actorTweenProblem(data, undefined, name); n += 1) {
    name = `move ${n}`;
  }
  const ids = new Set((data.tweens ?? []).map(one => one.id));
  let id = idFrom(name);
  for (let n = 2; ids.has(id); n += 1) {
    id = `${idFrom(name)}-${n}`;
  }
  const tween: ActorTween = {id, name, seconds: second(), curve: 'linear'};
  return {data: withTweens(data, [...(data.tweens ?? []), tween]), id};
}

export const removeActorTween = (data: ActorData, id: string): ActorData =>
  withTweens(
    data,
    (data.tweens ?? []).filter(one => one.id !== id),
  );

/** The ids of the files whose code plays this tween. */
export function tweenUses(
  source: MultiFileSource,
  module: string,
  id: string,
): string[] {
  const named = JSON.stringify(tweenValue(module, id));
  return Object.entries(source.files)
    .filter(([, file]) => file.contents.includes(named))
    .map(([fileId]) => fileId);
}

/** The workspace a tween is written on. */
export function actorTweenDocument(data: ActorData, id: string): string {
  const tween = actorTweenAt(data, id)?.tween;
  const variables = data.blocks?.variables;
  return JSON.stringify(
    {
      blocks: {
        languageVersion: 0,
        blocks: [
          {
            type: TWEEN_HEAD,
            id: TWEEN_HEAD_ID,
            x: 20,
            y: 20,
            fields: {NAME: tween?.name ?? '', CURVE: tween?.curve ?? 'linear'},
            inputs: {SECONDS: tween?.seconds ?? second()},
            ...(tween?.body ? {next: {block: tween.body}} : {}),
          },
        ],
      },
      ...(variables ? {variables} : {}),
    },
    null,
    2,
  );
}

/** A tween head as a workspace saves it, as far as it is read. */
interface SavedHead {
  type: string;
  fields?: {CURVE?: string};
  inputs?: {SECONDS?: Socket};
  next?: {block?: Block};
}

/** The data with what that workspace saved: the time, the curve, the body. */
export function withActorTweenDocument(
  data: ActorData,
  id: string,
  saved: string,
): ActorData {
  let document: {blocks?: {blocks?: SavedHead[]}; variables?: unknown[]};
  try {
    document = JSON.parse(saved);
  } catch {
    return data;
  }
  const head = (document.blocks?.blocks ?? []).find(
    root => root.type === TWEEN_HEAD,
  );
  if (!head) {
    return data;
  }
  const body = head.next?.block;
  const next = setActorTween(data, id, tween => {
    const rest = {...tween};
    delete rest.body;
    return {
      ...rest,
      seconds: head.inputs?.SECONDS ?? second(),
      curve: head.fields?.CURVE ?? 'linear',
      ...(body ? {body} : {}),
    };
  });
  return withVariables(next, document.variables);
}

// An actor's file, written as its data (`actorData`): for the stock shelf,
// the fixtures, the lessons and what an enhancement makes.

import type {Timeline} from '../engine/core/keyframes';

import {
  ACTOR_DOCUMENT,
  MAIN_ANIMATION,
  stillAnimation,
  type ActorData,
  type ActorDrawing,
  type ActorEffect,
  type ActorMember,
  type ActorProperty,
  type ActorStep,
  type ActorTween,
  type ActorValue,
  type Block,
} from './actorData';

/** What an actor is, as its file says it. */
export interface ActorSpec {
  name: string;
  for?: ActorData['for'];
  actsLike?: string;
  isData?: true;
  icon?: string;
  traits?: string[];
  properties?: ActorProperty[];
  values?: ActorValue[];
  effects?: ActorEffect[];
  /** Its blocks and events; one given no id is numbered by where it is. */
  members?: Array<Omit<ActorMember, 'id'> & {id?: string}>;
  /** A still picture: its Main animation, one sprite. */
  sprite?: string;
  animations?: Record<string, Timeline>;
  drawing?: ActorDrawing;
  steps?: ActorStep[];
  tweens?: ActorTween[];
  /** Its handlers, in reading order. */
  code?: Block[];
  /** The variables its code's blocks name. */
  variables?: ReadonlyArray<{id: string; name: string; type: string}>;
}

/** How far apart the roots are listed; the editor arranges them on open (`tidyLayout`). */
const ROOT_STEP = 40;

/** The actor as data. */
export function actorData({
  sprite,
  animations,
  code = [],
  variables,
  members,
  ...rest
}: ActorSpec): ActorData {
  const played = {
    ...(sprite === undefined ? {} : {[MAIN_ANIMATION]: stillAnimation(sprite)}),
    ...animations,
  };
  return {
    type: ACTOR_DOCUMENT,
    ...rest,
    ...(Object.keys(played).length ? {animations: played} : {}),
    ...(members?.length
      ? {
          members: members.map((member, index) => ({
            ...member,
            id: member.id ?? `${member.kind}-${index}`,
          })),
        }
      : {}),
    blocks: {
      blocks: {
        languageVersion: 0,
        blocks: code.map((root, index) => ({
          ...root,
          x: 20,
          y: 20 + index * ROOT_STEP,
        })),
      },
      ...(variables?.length ? {variables: [...variables]} : {}),
    },
  };
}

/** The actor's file. */
export const actorDocument = (spec: ActorSpec): string =>
  JSON.stringify(actorData(spec), null, 2);

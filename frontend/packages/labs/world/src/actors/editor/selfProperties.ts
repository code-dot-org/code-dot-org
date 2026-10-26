// A property of an actor's own, renamed or deleted across the project
// (specs/ACTOR_EDITOR_PLAN.md, step 6; SIMPLE_INTERFACE.md, "An actor is data
// and events").
//
// A property's blocks are named after it: `lives` on `actors/player` is read
// by `world_get_ActorsPlayer_LivesProperty` and set by `world_set_…`. So a
// rename that did not follow them would leave each one meaning nothing, and
// a delete leaves them so; the rename rewrites every one, in every file, and
// the delete first says where they are.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {
  mapWorkspaces,
  rewriteWorkspace,
  WORKSPACE_FILE,
} from '../../blockly/rewriteWorkspaces';
import {pascal} from '../../blockly/ruleMeta';
import {pathSlug} from '../../blockly/ruleRegistry';
import {MEMBER_TYPE} from '../../files/renameThing';
import {resolveRuleContents} from '../../rules/ruleReference';
import {isActorData, viewOf, type ActorData} from '../actorData';

/** What a property's blocks are named by: `lives` → `LivesProperty`. */
export const propertyKey = (name: string): string => `${pascal(name)}Property`;

/** Whether a block type is one of this property's: get, set, change, … */
const isTheProperty = (type: string, slug: string, key: string): boolean => {
  const parts = MEMBER_TYPE.exec(type);
  return Boolean(parts && parts[2] === slug && parts[3] === key);
};

/** The files whose code uses the property, by file id. */
export function propertyUses(
  source: MultiFileSource,
  modulePath: string,
  name: string,
): string[] {
  const slug = pathSlug(modulePath);
  const key = propertyKey(name);
  const own = `${modulePath.split('/').pop()}.actor`;
  return Object.entries(source.files)
    .filter(([, file]) => WORKSPACE_FILE.test(file.name))
    .filter(([, file]) => {
      let uses = false;
      rewriteWorkspace(viewOf(resolveRuleContents(file.contents ?? '')), {
        type(type) {
          // Its own `set` rows are the values it starts at, not uses.
          if (
            isTheProperty(type, slug, key) &&
            !(file.name === own && type.startsWith('world_set_'))
          ) {
            uses = true;
          }
          return type;
        },
        fields() {},
      });
      return uses;
    })
    .map(([id]) => id);
}

/** Why a property cannot be called this, or nothing. */
export function renameProblem(
  data: ActorData,
  from: string,
  to: string,
): string | undefined {
  const name = to.trim();
  if (!name) {
    return 'A property needs a name.';
  }
  if (
    name !== from &&
    (data.properties ?? []).some(
      one => one.name !== from && propertyKey(one.name) === propertyKey(name),
    )
  ) {
    return `This actor already has a property called ${name}.`;
  }
  return undefined;
}

/**
 * The project with the actor's property `from` called `to`: the declaration
 * in its data, and every block that reads or sets it, in every file. The
 * same project when nothing changed or the name will not do.
 */
export function renameProperty(
  source: MultiFileSource,
  fileId: string,
  modulePath: string,
  from: string,
  to: string,
): MultiFileSource {
  const file = source.files[fileId];
  let data: unknown;
  try {
    data = JSON.parse(file?.contents ?? '');
  } catch {
    return source;
  }
  const name = to.trim();
  if (
    !isActorData(data) ||
    name === from ||
    renameProblem(data, from, name) ||
    !(data.properties ?? []).some(one => one.name === from)
  ) {
    return source;
  }
  const renamed: ActorData = {
    ...data,
    properties: data.properties!.map(one =>
      one.name === from ? {...one, name} : one,
    ),
  };
  const declared: MultiFileSource = {
    ...source,
    files: {
      ...source.files,
      [fileId]: {...file, contents: JSON.stringify(renamed, null, 2)},
    },
  };
  const slug = pathSlug(modulePath);
  const fromKey = propertyKey(from);
  const toKey = propertyKey(name);
  return mapWorkspaces(declared, contents =>
    rewriteWorkspace(contents, {
      type(type) {
        const parts = MEMBER_TYPE.exec(type);
        return parts && parts[2] === slug && parts[3] === fromKey
          ? `${parts[1]}_${slug}_${toKey}`
          : type;
      },
      fields() {},
    }),
  );
}

/**
 * The data without the property, and without the value it starts at: its
 * blocks elsewhere are left, and say so in their own editors.
 */
export function deleteProperty(
  data: ActorData,
  modulePath: string,
  name: string,
): ActorData {
  const setter = `world_set_${pathSlug(modulePath)}_${propertyKey(name)}`;
  const next = {...data};
  const properties = (data.properties ?? []).filter(one => one.name !== name);
  const values = (data.values ?? []).filter(one => one.setter !== setter);
  if (properties.length) next.properties = properties;
  else delete next.properties;
  if (values.length) next.values = values;
  else delete next.values;
  return next;
}

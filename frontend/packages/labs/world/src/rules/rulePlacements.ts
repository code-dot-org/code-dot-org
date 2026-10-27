// What a placed actor says about a rule's traits, followed when one is
// renamed or deleted (specs/RULE_EDITOR_PLAN.md, step 6), and about a kind's
// own properties, which a placement overrides the same way.
//
// A placement in a map, a screen or a world overrides a trait's properties
// for that one instance, keyed by the trait's id and then the property's
// (`{Can_Move: {velocity: …}}`, `mapEditor/mapModel`); both ids are slugs of
// names (`ruleMeta.slug`). And a list in such a file may name a trait whole,
// as `<Rule>#<Export>Trait`. Neither is a workspace, so the rewrites that
// follow block types and fields do not reach them; this does.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {slug} from '../blockly/ruleMeta';

/** The files that place actors. */
const PLACES = /\.(map|screen|world)$/;

type Overrides = Record<string, Record<string, unknown>>;

const isObject = (value: unknown): value is Record<string, unknown> =>
  Boolean(value) && typeof value === 'object' && !Array.isArray(value);

/** Whether a value is a placement's overrides: owners of values. */
const isOverrides = (value: unknown): value is Overrides =>
  isObject(value) && Object.values(value).every(isObject);

/**
 * Every placement's overrides, and every string, in each file that places
 * actors, offered to `change`; the project with what it changed.
 */
function rewritePlaces(
  source: MultiFileSource,
  change: {
    overrides?: (overrides: Overrides) => boolean;
    text?: (text: string) => string;
  },
): MultiFileSource {
  let files: MultiFileSource['files'] | undefined;
  for (const [id, file] of Object.entries(source.files)) {
    if (!PLACES.test(file.name)) {
      continue;
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(file.contents ?? '');
    } catch {
      continue;
    }
    let changed = false;
    const walk = (node: unknown): unknown => {
      if (typeof node === 'string') {
        const next = change.text?.(node) ?? node;
        changed ||= next !== node;
        return next;
      }
      if (Array.isArray(node)) {
        return node.map(walk);
      }
      if (!isObject(node)) {
        return node;
      }
      for (const [key, value] of Object.entries(node)) {
        node[key] = walk(value);
      }
      if (
        typeof node.type === 'string' &&
        isOverrides(node.properties) &&
        change.overrides?.(node.properties)
      ) {
        changed = true;
      }
      return node;
    };
    const next = walk(parsed);
    if (changed) {
      files ??= {...source.files};
      files[id] = {...file, contents: JSON.stringify(next, null, 2)};
    }
  }
  return files ? {...source, files} : source;
}

/**
 * The project with every placement's override of a property renamed: a
 * trait's, or a kind's own, by the name of what declared it.
 */
export const renamePlacedProperty = (
  source: MultiFileSource,
  declarer: string,
  from: string,
  to: string,
): MultiFileSource => {
  const owner = slug(declarer);
  const was = slug(from);
  const now = slug(to);
  return was === now
    ? source
    : rewritePlaces(source, {
        overrides(overrides) {
          const values = overrides[owner];
          if (!values || !(was in values)) {
            return false;
          }
          const {[was]: value, ...rest} = values;
          overrides[owner] = {...rest, [now]: value};
          return true;
        },
      });
};

/** …and without it, which a deleted property leaves nothing to say. */
export const forgetPlacedProperty = (
  source: MultiFileSource,
  declarer: string,
  name: string,
): MultiFileSource => {
  const owner = slug(declarer);
  const id = slug(name);
  return rewritePlaces(source, {
    overrides(overrides) {
      const values = overrides[owner];
      if (!values || !(id in values)) {
        return false;
      }
      const rest = Object.fromEntries(
        Object.entries(values).filter(([key]) => key !== id),
      );
      if (Object.keys(rest).length) {
        overrides[owner] = rest;
      } else {
        delete overrides[owner];
      }
      return true;
    },
  });
};

/**
 * The project with a trait renamed where actors are placed: its overrides'
 * owner, and every list that names it (`<Rule>#<Export>Trait`).
 */
export const renamePlacedTrait = (
  source: MultiFileSource,
  reference: {from: string; to: string},
  id: {from: string; to: string},
): MultiFileSource => {
  const was = slug(id.from);
  const now = slug(id.to);
  return rewritePlaces(source, {
    text: text => (text === reference.from ? reference.to : text),
    overrides(overrides) {
      if (was === now || !(was in overrides)) {
        return false;
      }
      overrides[now] = overrides[was];
      delete overrides[was];
      return true;
    },
  });
};

/** The files that place actors and override or name the trait, by id. */
export function placedTraitUses(
  source: MultiFileSource,
  reference: string,
  name: string,
): string[] {
  const owner = slug(name);
  return Object.entries(source.files)
    .filter(([, file]) => PLACES.test(file.name))
    .filter(([, file]) => {
      const contents = file.contents ?? '';
      return (
        contents.includes(JSON.stringify(reference)) ||
        contents.includes(`${JSON.stringify(owner)}:`)
      );
    })
    .map(([id]) => id);
}

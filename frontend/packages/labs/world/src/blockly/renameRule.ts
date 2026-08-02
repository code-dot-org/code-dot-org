// Renaming a rule, everywhere it is named.
//
// A rule is referred to by NAME (ruleRegistry): a world's `use rule Gravity`, an
// actor's `use trait Gravity#AffectedByGravityTrait`, a step anchored on
// `Gravity#land`, and the very block types of its members
// (`world_get_Gravity_StrengthProperty`). Nothing records where the rule lives,
// which is what lets its file move — and it is also what makes the name itself
// load-bearing: change it and every one of those references is left naming a
// rule that no longer exists.
//
// So the rename carries. This is the transform that carries it: a pure rewrite
// of the project's saved workspaces, given the old name and the new one. It is
// deliberately structural rather than a text substitution — "Gravity" occurs in
// plenty of places a rename must not touch (a `log` block's message, an actor
// named Gravity, a comment explaining gravity) and in exactly four places it
// must: the reference fields, and the member block types.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {ruleSlug} from './ruleRegistry';

/**
 * Fields whose value names a rule.
 *
 * `RULE` holds a bare name (`use rule`); the rest hold `<RuleName>#<member>` —
 * a trait, an event, or a step to order against.
 */
const NAME_FIELDS = ['RULE'] as const;
const QUALIFIED_FIELDS = ['TRAIT', 'EVENT', 'STEP'] as const;

/** File kinds that are Blockly workspaces, and so can hold a reference. */
const WORKSPACE_FILE = /\.(rule|actor|world)$/;

/** The block-type prefixes a rule's members are generated under (domainBlocks). */
const MEMBER_TYPE = /^(world_(?:get|set|do|query|on))_([A-Za-z0-9]+)_(.+)$/;

/**
 * Rewrite one saved workspace, renaming every reference to `from` as `to` — and
 * the rule's own `define rule` block, if this is the file that declares it.
 *
 * Returns the rewritten JSON, or undefined if the file holds no reference to
 * that rule (or is not valid JSON — a file mid-edit is left exactly as it is).
 */
export function renameRuleReferences(
  contents: string,
  from: string,
  to: string,
): string | undefined {
  let parsed: unknown;
  try {
    parsed = JSON.parse(contents);
  } catch {
    return undefined;
  }
  const fromSlug = ruleSlug(from);
  const toSlug = ruleSlug(to);
  let changed = false;

  const rewriteType = (type: string): string => {
    const parts = MEMBER_TYPE.exec(type);
    if (!parts || parts[2] !== fromSlug) {
      return type;
    }
    changed = true;
    return `${parts[1]}_${toSlug}_${parts[3]}`;
  };

  const rewriteFields = (
    fields: Record<string, unknown>,
    blockType: string | undefined,
  ): void => {
    // The declaration itself, when the rename comes from somewhere other than
    // the field being edited. `NAME` is not a reference field — a trait, a step
    // and an actor all have one — so it is rewritten on this block alone.
    if (blockType === 'world_rule' && fields.NAME === from) {
      fields.NAME = to;
      changed = true;
    }
    for (const name of NAME_FIELDS) {
      if (fields[name] === from) {
        fields[name] = to;
        changed = true;
      }
    }
    for (const name of QUALIFIED_FIELDS) {
      const value = fields[name];
      if (typeof value === 'string' && value.startsWith(`${from}#`)) {
        fields[name] = `${to}#${value.slice(from.length + 1)}`;
        changed = true;
      }
    }
  };

  // Walk everything rather than the block tree specifically: a block can hang
  // off `next`, an input, a shadow, or a mutator's `extraState`, and a walk that
  // knows the shape is a walk that misses the next shape somebody adds.
  const walk = (value: unknown): void => {
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (!value || typeof value !== 'object') {
      return;
    }
    const node = value as Record<string, unknown>;
    const blockType = typeof node.type === 'string' ? node.type : undefined;
    if (blockType !== undefined) {
      node.type = rewriteType(blockType);
    }
    if (node.fields && typeof node.fields === 'object') {
      rewriteFields(node.fields as Record<string, unknown>, blockType);
    }
    for (const child of Object.values(node)) {
      walk(child);
    }
  };
  walk(parsed);

  return changed ? `${JSON.stringify(parsed, null, 2)}` : undefined;
}

/**
 * The project with every reference to `from` renamed to `to`.
 *
 * Only saved workspaces are touched. A `.js` file that imports a rule imports it
 * from a module path, which a rename does not change — the name and the file
 * were never the same thing, which is the point.
 *
 * Returns the same source object when nothing referred to the rule, so a caller
 * can skip the write.
 */
export function renameRuleInSource(
  source: MultiFileSource,
  from: string,
  to: string,
): MultiFileSource {
  const files = {...source.files};
  let changed = false;
  for (const [id, file] of Object.entries(source.files)) {
    if (!WORKSPACE_FILE.test(file.name)) {
      continue;
    }
    const renamed = renameRuleReferences(file.contents, from, to);
    if (renamed !== undefined) {
      files[id] = {...file, contents: renamed};
      changed = true;
    }
  }
  return changed ? {...source, files} : source;
}

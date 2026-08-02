// Renaming, everywhere the name is.
//
// A rule is referred to by NAME and its members by the export names their own
// names derive (ruleRegistry): a world's `use rule Gravity`, an actor's `use
// trait Gravity#AffectedByGravityTrait`, a step anchored on `Gravity#land`, and
// the very block types of a rule's members
// (`world_get_Gravity_StrengthProperty`). Nothing records where any of it lives,
// which is what lets a rule's file move — and it is also what makes the names
// themselves load-bearing: change one and every reference to it is left naming
// something that no longer exists.
//
// So a rename carries. This is the transform that carries it: a pure rewrite of
// the project's saved workspaces, given what was renamed and to what. What is a
// reference to a rule is the whole of what this module knows — the walk itself
// is in rewriteWorkspaces, shared with the other things that get renamed. For a
// rule, references are of exactly two kinds: the reference fields, and the
// member block types.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {mapWorkspaces, rewriteWorkspace} from './rewriteWorkspaces';
import type {RuleMeta} from './ruleMeta';
import {ruleSlug} from './ruleRegistry';

/**
 * Fields whose value names a rule.
 *
 * `RULE` holds a bare name (`use rule`); the rest hold `<RuleName>#<member>` —
 * a trait, an event, or a step to order against.
 */
const NAME_FIELDS = ['RULE'] as const;
const QUALIFIED_FIELDS = ['TRAIT', 'EVENT', 'STEP'] as const;

/** The block-type prefixes a rule's members are generated under (domainBlocks). */
const MEMBER_TYPE = /^(world_(?:get|set|do|query|on))_([A-Za-z0-9]+)_(.+)$/;

/**
 * Rewrite one saved workspace, renaming every reference to the rule `from` as
 * `to` — and the rule's own `define rule` block, if this is the file that
 * declares it.
 */
export function renameRuleReferences(
  contents: string,
  from: string,
  to: string,
): string | undefined {
  const fromSlug = ruleSlug(from);
  const toSlug = ruleSlug(to);
  return rewriteWorkspace(contents, {
    type(type) {
      const parts = MEMBER_TYPE.exec(type);
      return parts && parts[2] === fromSlug
        ? `${parts[1]}_${toSlug}_${parts[3]}`
        : type;
    },
    fields(fields, blockType) {
      // The declaration itself, when the rename comes from somewhere other than
      // the field being edited. `NAME` is not a reference field — a trait, a
      // step and an actor all have one — so it is rewritten on this block alone.
      if (blockType === 'world_rule' && fields.NAME === from) {
        fields.NAME = to;
      }
      for (const name of NAME_FIELDS) {
        if (fields[name] === from) {
          fields[name] = to;
        }
      }
      for (const name of QUALIFIED_FIELDS) {
        const value = fields[name];
        if (typeof value === 'string' && value.startsWith(`${from}#`)) {
          fields[name] = `${to}#${value.slice(from.length + 1)}`;
        }
      }
    },
  });
}

/**
 * Rewrite one saved workspace, renaming references to a MEMBER of `rule`.
 *
 * `from` and `to` are the keys a member is referred to by: the export name its
 * own name derives (`StrengthProperty`, `AffectedByGravityTrait`) or, for a
 * step, its id. What names the member is left alone — the `define` block that
 * declares it has already been edited, which is what started this.
 */
export function renameMemberReferences(
  contents: string,
  rule: string,
  from: string,
  to: string,
): string | undefined {
  const slug = ruleSlug(rule);
  return rewriteWorkspace(contents, {
    type(type) {
      const parts = MEMBER_TYPE.exec(type);
      return parts && parts[2] === slug && parts[3] === from
        ? `${parts[1]}_${slug}_${to}`
        : type;
    },
    fields(fields) {
      for (const name of QUALIFIED_FIELDS) {
        if (fields[name] === `${rule}#${from}`) {
          fields[name] = `${rule}#${to}`;
        }
      }
    },
  });
}

/**
 * The project with every reference to the rule `from` renamed to `to`.
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
  return mapWorkspaces(source, contents =>
    renameRuleReferences(contents, from, to),
  );
}

/** The project with every reference to a member of `rule` renamed. */
export function renameMemberInSource(
  source: MultiFileSource,
  rule: string,
  from: string,
  to: string,
): MultiFileSource {
  return mapWorkspaces(source, contents =>
    renameMemberReferences(contents, rule, from, to),
  );
}

// ── What a rule's members are called, and what changed ───────────────────────

/** A member's reference key, and the kind of member it belongs to. */
export interface MemberKey {
  readonly key: string;
  readonly kind: 'trait' | 'property' | 'event' | 'action' | 'query' | 'step';
}

/**
 * Every key a rule's members are referred to by.
 *
 * Derived from the parsed rule rather than from its blocks, so it is the same
 * derivation the references themselves come from: a member renamed is a member
 * whose key changed, whatever was edited to change it — a NAME field, or the
 * wording of a designed block's signature.
 */
export function memberKeys(meta: RuleMeta): MemberKey[] {
  const keys: MemberKey[] = [];
  const add = (key: string, kind: MemberKey['kind']): void => {
    if (key) {
      keys.push({key, kind});
    }
  };
  meta.traits.forEach(trait => add(trait.ref.exportName, 'trait'));
  meta.properties.forEach(property => add(property.ref.exportName, 'property'));
  meta.events.forEach(event => add(event.ref.exportName, 'event'));
  meta.actions.forEach(action => add(action.ref.exportName, 'action'));
  meta.queries.forEach(query => add(query.ref.exportName, 'query'));
  meta.steps.forEach(step => add(step.id, 'step'));
  return keys;
}

/** Keys claimed by more than one member — each an ambiguous reference. */
export function duplicateMemberKeys(keys: readonly MemberKey[]): string[] {
  const seen = new Set<string>();
  const duplicated = new Set<string>();
  for (const {key} of keys) {
    if (seen.has(key)) {
      duplicated.add(key);
    }
    seen.add(key);
  }
  return [...duplicated];
}

/**
 * The rename between two states of a rule, if that is what happened.
 *
 * One key gone and one arrived, of the same kind: that is a member that was
 * renamed, and its references can follow. Anything else — a member added, one
 * deleted, two edits at once, or a `define block` that went from doing something
 * to reporting something (an action's key leaving as a query's arrives) — is not
 * a rename, and guessing that it was would rewrite references to point at the
 * wrong member, or at a block shape that cannot go where the old one did.
 */
export function renamedMember(
  before: readonly MemberKey[],
  after: readonly MemberKey[],
): {from: string; to: string} | undefined {
  const had = new Set(before.map(member => member.key));
  const has = new Set(after.map(member => member.key));
  const gone = before.filter(member => !has.has(member.key));
  const arrived = after.filter(member => !had.has(member.key));
  if (gone.length !== 1 || arrived.length !== 1) {
    return undefined;
  }
  const [from] = gone;
  const [to] = arrived;
  return from.kind === to.kind ? {from: from.key, to: to.key} : undefined;
}

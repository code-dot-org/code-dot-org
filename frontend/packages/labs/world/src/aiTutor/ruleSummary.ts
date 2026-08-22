// A rule, as much of it as the tutor needs.
//
// A `.rule` is the one file kind whose JSON cannot be sent. The stock rules a
// project imports are machine-generated from `scripts/rules/*.mjs`, and they
// are enormous: `solid.rule` alone serializes to 390,000 characters, and the
// starter project's rules come to 950,000 between them. That is twenty times
// its generated code and past any context worth spending.
//
// It is also the wrong thing to send. What a student needs from `Gravity` is
// that it exists, that electing "Falls" makes a thing fall, that it has a
// `gravity` and a `terminal speed`, and that it raises `starts falling` — not
// the four hundred blocks that implement it. That is exactly `RuleMeta`, which
// the editor already builds to fill its palette, so this is a rendering of
// something the project has rather than a second description of it.
//
// WHAT THE GAME DOES, NOT HOW IT WORKS.

import type {RuleMeta} from '../blockly/ruleMeta';

const list = (items: readonly string[]): string =>
  items.length ? items.join(', ') : '—';

/** `name (type)`, or `name (type, read-only)`. */
const property = (p: {name: string; type: string; readonly: boolean}): string =>
  `${p.name} (${p.type}${p.readonly ? ', read-only' : ''})`;

/**
 * The words a member is spelled with, as the block says them.
 *
 * An action's `parts` are what the block reads on screen — `take ⟨amount⟩
 * damage` — which is both shorter than a signature and the thing the student
 * is looking at. Falls back to the id for a member with no parts.
 */
const says = (m: {
  name: string;
  parts?: readonly unknown[];
  description?: string;
}): string => {
  const parts = (m.parts ?? [])
    .map(part =>
      typeof part === 'string'
        ? part
        : `⟨${(part as {name?: string}).name ?? '…'}⟩`,
    )
    .join(' ');
  const said = parts || m.name;
  return m.description ? `${said} — ${m.description}` : said;
};

/**
 * One rule, in a few lines.
 *
 * Traits first, because electing a trait is the only way an actor gets any of
 * the rest, and a tutor that names the members without naming the trait has
 * told the student about a door with no handle.
 */
export const summarizeRule = (rule: RuleMeta): string => {
  const lines = [`## ${rule.name} — ${rule.ability}`];

  if (rule.requires.length) {
    lines.push(`requires: ${list([...rule.requires])}`);
  }
  // WHOSE trait, not just which. A camera trait goes on a CAMERA, and a model
  // told only the name assumed importing the rule was enough — leaving the
  // camera doing nothing, with a correct-looking project and no error.
  const held = (subject: 'actor' | 'camera') =>
    rule.traits.filter(trait => (trait.subject ?? 'actor') === subject);
  if (held('actor').length) {
    lines.push(
      `traits an actor can elect: ${list(held('actor').map(t => t.name))}`,
    );
  }
  if (held('camera').length) {
    lines.push(
      'traits a CAMERA elects, not an actor: ' +
        `${list(held('camera').map(t => t.name))}`,
    );
  }
  if (rule.properties.length) {
    lines.push(`properties: ${list(rule.properties.map(property))}`);
  }
  if (rule.actions.length) {
    lines.push(`actions: ${list(rule.actions.map(says))}`);
  }
  if (rule.queries.length) {
    lines.push(`questions: ${list(rule.queries.map(says))}`);
  }
  if (rule.events.length) {
    lines.push(`events: ${list(rule.events.map(says))}`);
  }
  if (rule.enums.length) {
    lines.push(
      // The LABEL of each option, which is what the student reads on the
      // dropdown; the value behind it is the engine's business.
      `choices: ${list(
        rule.enums.map(
          e => `${e.name} (${e.options.map(([label]) => label).join('/')})`,
        ),
      )}`,
    );
  }
  return lines.join('\n');
};

/** Every rule the project has, summarized, in a stable order. */
export const summarizeRules = (rules: readonly RuleMeta[]): string =>
  [...rules]
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(summarizeRule)
    .join('\n\n');

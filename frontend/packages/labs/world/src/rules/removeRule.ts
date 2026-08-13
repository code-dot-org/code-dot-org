// Taking a rule back out of a project.
//
// The other half of `importStockRule`, and a pure transform for the same
// reason: what makes it interesting is which files go and what breaks when they
// do, and both are far easier to keep right without a React tree in the way.
//
// REMOVING A RULE IS NOW A REAL ACT. It used to be that a project could hold a
// rule and not run it — a `.rule` with no `use rule` naming it was a file
// sitting there doing nothing — so deleting it was housekeeping. Holding one is
// what puts it in play (blockly/projectModules), so deleting is how a world
// stops having gravity. That is the whole point of the panel this serves, and
// it is also why it needs to say what else was relying on it.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {parseRuleMeta, type RuleMeta} from '../blockly/ruleMeta';

/** Where rules live, by the lab's directory convention (GLOSSARY.md). */
const RULES_FOLDER = 'rules';

/** One rule the project holds, as the panel lists it. */
export interface HeldRule {
  /** The extension-less module path — `rules/gravity`. */
  path: string;
  /** The file it is in — `gravity.rule`, which is what a learner deletes. */
  fileName: string;
  /** Its id in `source.files`. */
  fileId: string;
  /**
   * What it calls itself, or the file's stem for one that declares no name.
   *
   * A `.js` rule has no `define rule` block to read, and is referred to by its
   * module everywhere else; the panel says the file rather than inventing one.
   */
  name: string;
  /** What a world has by holding it — "Has Gravity". Absent for a `.js` rule. */
  ability?: string;
  /** The traits it gives actors, for the same reason the import dialog says so. */
  provides: readonly string[];
}

const RULE_FILE = /\.(rule|js|ts)$/;

/** The id of the `rules/` folder, if the project has one. */
function rulesFolderId(source: MultiFileSource): string | undefined {
  return Object.values(source.folders).find(
    folder => folder.name === RULES_FOLDER && folder.parentId === '0',
  )?.id;
}

/**
 * Every rule the project holds — which is every rule in play.
 *
 * In the order the files come back, then by name, so the panel does not
 * reshuffle itself when an unrelated file is added.
 */
export function heldRules(source: MultiFileSource): HeldRule[] {
  const folderId = rulesFolderId(source);
  if (folderId === undefined) {
    return [];
  }
  const held: HeldRule[] = [];
  for (const [fileId, file] of Object.entries(source.files)) {
    if (file.folderId !== folderId || !RULE_FILE.test(file.name)) {
      continue;
    }
    const stem = file.name.replace(RULE_FILE, '');
    const path = `${RULES_FOLDER}/${stem}`;
    const meta = file.name.endsWith('.rule')
      ? parseRuleMeta(path, file.contents)
      : undefined;
    held.push({
      path,
      fileName: file.name,
      fileId,
      name: meta?.name ?? stem,
      ability: meta?.ability,
      provides: meta?.traits.map(trait => trait.name) ?? [],
    });
  }
  return held.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * The rules that require `rule`, by name — what breaks if it goes.
 *
 * A mechanic is written against other mechanics: gravity against collision's
 * traits and motion's step. Deleting the one underneath leaves the one on top
 * naming a rule the project has not got, which fails at COMPILE time with
 * nothing on screen to explain it — so the panel says who needs it before the
 * learner decides, rather than after.
 *
 * By name, because that is what a `use rule` dependency stores and what
 * survives the file being renamed.
 */
export function rulesRequiring(
  source: MultiFileSource,
  rule: HeldRule,
): string[] {
  const metas: RuleMeta[] = [];
  for (const [, file] of Object.entries(source.files)) {
    if (!file.name.endsWith('.rule')) {
      continue;
    }
    const stem = file.name.replace(RULE_FILE, '');
    const meta = parseRuleMeta(`${RULES_FOLDER}/${stem}`, file.contents);
    if (meta && meta.modulePath !== rule.path) {
      metas.push(meta);
    }
  }
  return metas
    .filter(meta => meta.requires.includes(rule.name))
    .map(meta => meta.name)
    .sort((a, b) => a.localeCompare(b));
}

/**
 * The project's other files that REFER to this rule, by file name.
 *
 * The second way a rule is load-bearing, and the commoner one: an actor elects
 * "Affected by Gravity", a world reads `amount of gravity`, and both store the
 * reference as `<RuleName>#<Export>`. Deleting the rule under them fails at
 * compile with `cannot resolve 'rules/gravity' from 'actors/player.actor'` —
 * the same wreckage `rulesRequiring` exists to prevent, arriving from a
 * different direction.
 *
 * Found by looking for the reference form in the file's text rather than by
 * walking its blocks. Every reference to a member is `Rule#Export` wherever it
 * appears — a trait election, a property getter's field, an event hat — and a
 * block TYPE built from a rule's name spells it `Gravity_`, so the `#` is
 * exactly what tells a reference from a name that merely looks like one.
 */
export function filesUsing(source: MultiFileSource, rule: HeldRule): string[] {
  const marker = `${rule.name}#`;
  return Object.values(source.files)
    .filter(
      file =>
        file.name !== rule.fileName &&
        BLOCKLY_FILE.test(file.name) &&
        file.contents.includes(marker),
    )
    .map(file => file.name)
    .sort((a, b) => a.localeCompare(b));
}

const BLOCKLY_FILE = /\.(actor|world|rule)$/;

/**
 * Delete a rule's file from the project.
 *
 * Only its own file: the rules it brought in when it was imported stay, because
 * by now they may be holding somebody else up — and a delete that quietly took
 * three files with it would be a worse surprise than one that leaves two the
 * learner can delete themselves.
 *
 * The tab goes with the file. A file id left in `openFiles` is a tab pointing at
 * nothing, and the editor would try to open it on the next load.
 */
export function removeRule(
  source: MultiFileSource,
  rule: HeldRule,
): MultiFileSource {
  const files = {...source.files};
  delete files[rule.fileId];
  return {
    ...source,
    files,
    ...(source.openFiles
      ? {openFiles: source.openFiles.filter(id => id !== rule.fileId)}
      : {}),
  };
}

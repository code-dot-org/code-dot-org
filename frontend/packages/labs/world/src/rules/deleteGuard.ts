// Why a rule file cannot be deleted, for the file browser.
//
// The rules panel already refuses to remove a rule another rule requires, and
// says which (`rulesRequiring`, RulesInPlayDialog). The FILE TREE beside it is
// a second way to do the same thing, and it had no idea: deleting
// `rules/motion.rule` there took Physics out from under Gravity, Arrow Keys,
// Collisions and Solid Bodies at once, with nothing on screen to say so.
//
// Nothing breaks any more — a dead reference generates nothing and its blocks
// wear a warning (blockly/standInBlocks, extensions/missingRule) — but four
// mechanics quietly stopping is not a thing to find out by playing. So the two
// routes ask one question, which is this one.
//
// ONLY the rule-to-rule case, which is the one the panel refuses. A rule whose
// traits an ACTOR elected is warned about there and not blocked, because a
// learner taking gravity out of their game means it and the actors are theirs
// to fix; the tree cannot say that as gracefully, so it says nothing and lets
// the deletion through, exactly as the panel's Delete does.

import type {MultiFileSource, ProjectFile} from '@code-dot-org/core/api';

import {heldRules, rulesRequiring} from './removeRule';

/**
 * The reason `file` cannot be deleted, or undefined if it may be.
 *
 * Shaped for `CodebridgeConfig.blockFileDeletion`, which shows the sentence in
 * place of the delete confirmation.
 */
export function whyKeepFile(
  file: ProjectFile,
  source: MultiFileSource,
): string | undefined {
  const rule = heldRules(source).find(held => held.fileName === file.name);
  if (!rule) {
    return undefined; // not a rule, or not one in `rules/`
  }
  const needed = rulesRequiring(source, rule);
  // "Required by", not "{names} needs" — the list may be one rule or five, and
  // a sentence whose verb has to agree with it reads wrong half the time. It is
  // also word for word what the panel puts in the row, so the two routes give
  // one answer rather than two phrasings of it.
  //
  // Not translated here: it is handed to a dialog, so it becomes DOM text where
  // LocalizeJS finds it. The rule names inside it cannot be masked the way the
  // panel masks them (this is a string, not markup), which is the price of the
  // file browser's alert taking a message rather than a node.
  return needed.length
    ? `Required by ${needed.join(', ')}. Remove those first, or use the rules panel on the world block.`
    : undefined;
}

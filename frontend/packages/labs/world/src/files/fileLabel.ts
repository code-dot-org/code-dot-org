// What a file is called wherever the lab names it: what it declares, else
// its own stem titled, which is what every dropdown does for a file that
// declares nothing (`config.fileLabel`, the breadcrumb, the map editor's
// toolbar).

import {label} from '../blockly/label';
import {authoredName} from '../blockly/projectModules';
import {resolveRuleContents} from '../rules/ruleReference';

export const fileLabel = (file: {name?: string; contents?: string}): string =>
  // Resolved: a rule nobody has edited holds a reference to the library's
  // and declares nothing of its own (rules/ruleReference), so without this
  // every unedited rule reads as its stem — the one place in the lab saying
  // something else.
  authoredName(resolveRuleContents(file.contents ?? '')) ??
  label((file.name ?? '').replace(/\.[^.]+$/, ''));

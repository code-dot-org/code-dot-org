// The events an actor of one kind can hear, for every menu that adds a
// handler for one: the map's quick add, and the "+" between sections in the
// kind's own file and in a placed actor's code (specs/LAZY_WORKSPACE_PLAN.md,
// "Adding a section").
//
// Read from the project as it is when the menu opens, so a trait the learner
// has just elected brings its events with it.

import {BUILTIN_RULE_META} from './builtinMeta';
import {
  eventChoicesForKind,
  kindDeclaredEvents,
  kindFactsFrom,
  type EventChoice,
} from './eventChoices';
import {FOUNDATION_TRAIT_VALUES} from './foundation';
import {projectOwnMetas, projectRuleMetas} from './projectModules';

/** A narrowing of event choices to what one kind can hear. */
export type NarrowEvents = (
  choices: readonly EventChoice[],
  kind: string,
) => EventChoice[];

/**
 * What narrows a list of choices to one kind, for these project files.
 *
 * The project is read once per call of this, not per menu: a caller keeps
 * the result while the files are the same.
 */
export function eventsNarrowerFor(
  files: Readonly<Record<string, string>>,
): NarrowEvents {
  const owns = projectOwnMetas(files as Record<string, string>);
  const facts = kindFactsFrom(files, owns as never);
  const rules = [
    ...BUILTIN_RULE_META,
    ...projectRuleMetas(files as Record<string, string>),
  ];
  const declared = kindDeclaredEvents(owns as never);
  return (choices, kind) =>
    eventChoicesForKind(
      choices,
      kind,
      facts,
      rules,
      FOUNDATION_TRAIT_VALUES,
      declared,
    );
}

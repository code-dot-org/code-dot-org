// The events an actor of one kind can hear, for everywhere a handler for one
// is offered: the map's quick add, the "+" between sections, and the toolbox,
// in the kind's own file and in a placed actor's code
// (specs/LAZY_WORKSPACE_PLAN.md, "Adding a section").
//
// Read from the project as it is when the menu opens, so a trait the learner
// has just elected brings its events with it.

import type {Toolbox} from '@code-dot-org/blockly';

import {BUILTIN_RULE_META} from './builtinMeta';
import {
  eventChoicesForKind,
  eventChoicesIn,
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

/**
 * The event hats in `toolbox` that an actor of `kind` cannot hear, for the
 * toolbox to leave out.
 *
 * A handler's subject is the actor the code is about and nothing else
 * (`eventSubject`), so a hat for an event that never reaches it is a block
 * that can only be a mistake — a Button's file offered the List's events in
 * the List drawer. Only the toolbox: the blocks stay defined, so a file
 * already holding one still loads, and says it is misplaced.
 */
export function eventsUnheardBy(
  toolbox: Toolbox,
  definitions: ReadonlyArray<object>,
  narrow: NarrowEvents,
  kind: string,
): Set<string> {
  const offered = eventChoicesIn(toolbox, definitions);
  const heard = new Set(narrow(offered, kind).map(choice => choice.type));
  return new Set(
    offered.map(choice => choice.type).filter(type => !heard.has(type)),
  );
}

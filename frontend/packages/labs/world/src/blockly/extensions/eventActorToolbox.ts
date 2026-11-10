// The `+` on a hat: a flyout holding what the handler can name.
//
// Three things, in order, each only where the event has it
// (specs/PROPERTY_SUBJECTS_PLAN.md):
//
//   - the SUBJECT, the actor the event happened to: `this actor` where the
//     hat is about this actor, and `subject actor` where it is about a kind
//     or a property;
//   - the OBJECT, the one actor the event carries: `object actor`;
//   - the values the event's author named, one ordinary getter each
//     (specs/EVENT_VALUES_PLAN.md).
//
// These are blocks a learner could find in their categories. This is for the
// one who does not — looking at `when ⟨this actor⟩ starts touching ⟨Brick ▾⟩`,
// wanting to remove the brick, with no reason to guess where the way to name
// it lives. The affordance belongs on the block that knows the answer.
//
// The mechanism is `addMiniToolbox` in `@code-dot-org/blockly` — the same one
// Sprite Lab's `when ⟨sprite⟩ created` has used for years. A real flyout
// inside the block, pointed at the block's own workspace, so a block dragged
// out of it lands in the program. The flyout reads its list each time it
// opens, so the list is kept here and rewritten when the hat's subject
// changes.
//
// NOT a mutator, though Blockly's mutator also puts a `+` on a block and opens
// a flyout. A mutator's bubble targets its own hidden workspace, so nothing can
// be dragged out of one — that version was built and rejected for exactly that.

import {defineExtension, type Extension} from '@code-dot-org/blockly';
import {
  addMiniToolbox,
  type MiniToolboxBlock,
} from '@code-dot-org/blockly/fields/miniToolbox';

import {blockResized} from '../blockResized';
import {SUBJECT_FIELD} from '../eventSubject';
import {localFieldName} from '../fields/eventLocal';

import {addOnChange} from './onChange';

/** What a hat's `+` can offer, by hat type. */
interface HatFlyout {
  /** The event happens to an actor, which the handler can name. */
  subject: boolean;
  /** It carries one actor, `object actor`. */
  object: boolean;
  /** …or values its author named, a getter each. */
  values: readonly MiniToolboxBlock[];
}

/**
 * What a hat's `+` offers, by hat type.
 *
 * A REGISTRY RATHER THAN A PER-EVENT EXTENSION. An extension is registered
 * under a name once and a second registration of the same name keeps the
 * first body (`@code-dot-org/blockly`, `Registry.registerExtension`), so an
 * extension minted per event would go stale the moment its signature was
 * edited — which is a thing a learner does while the lab is running. This is
 * one shared extension that asks, at the moment a hat is built, what that
 * hat's event has.
 */
const flyouts = new Map<string, HatFlyout>();

/** Say what the `+` on `hatType` offers. Called wherever a hat is minted. */
export const registerEventFlyout = (hatType: string, flyout: HatFlyout) => {
  flyouts.set(hatType, flyout);
};

/** The named values the `+` on `hatType` offers — empty when none. */
export const eventFlyoutBlocks = (
  hatType: string,
): readonly MiniToolboxBlock[] => flyouts.get(hatType)?.values ?? [];

/**
 * Everything the `+` offers on this hat as it stands now. `idAt` gives the
 * hat's own variable for each value, so a getter taken out reads this hat's
 * and not another of the same name (specs/VARIABLE_OWNERSHIP_PLAN.md).
 */
export const hatFlyoutBlocks = (
  hatType: string,
  subject: string,
  idAt: (at: number) => string | undefined = () => undefined,
): MiniToolboxBlock[] => {
  const flyout = flyouts.get(hatType);
  if (!flyout) {
    return [];
  }
  return [
    ...(flyout.subject
      ? [subject ? 'world_subject_actor' : 'world_this_actor']
      : []),
    ...(flyout.object ? ['world_object_actor'] : []),
    ...flyout.values.map((value, at) => {
      const id = idAt(at);
      if (!id || typeof value === 'string') {
        return value;
      }
      const held = (value.fields?.VAR ?? {}) as object;
      return {...value, fields: {...value.fields, VAR: {...held, id}}};
    }),
  ];
};

export const EVENT_HAT_TOOLBOX_EXTENSION = 'world_event_hat_toolbox';

export const eventHatToolboxExtension: Extension = defineExtension(
  EVENT_HAT_TOOLBOX_EXTENSION,
  {
    extension() {
      const subject = () => String(this.getFieldValue?.(SUBJECT_FIELD) ?? '');
      const idAt = (at: number) => {
        const id = this.getFieldValue?.(localFieldName(at));
        return typeof id === 'string' && id ? id : undefined;
      };
      const live = hatFlyoutBlocks(this.type, subject(), idAt);
      if (live.length === 0) {
        return;
      }
      addMiniToolbox(this, {
        blocks: live,
        tooltip: 'What this event is about',
        // An extension may not add the hooks that would save it open.
        remembersOpen: false,
        onToggle: () => blockResized(this),
      });
      // The list the flyout reads, rewritten in place: a subject set from
      // this actor to a kind turns `this actor` into `subject actor`.
      addOnChange(this, () => {
        live.splice(
          0,
          live.length,
          ...hatFlyoutBlocks(this.type, subject(), idAt),
        );
      });
    },
  },
);

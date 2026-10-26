// The menu a getter actually offers.
//
// `variableScope` decides what a block can see and is tested on its own; this
// is the other half of the same claim — that the decision reaches the dropdown
// a learner opens. The two are worth separating because the wiring is where it
// went wrong: the scope rule can be perfect while the getters go on using
// Blockly's own field, and nothing about the editor would look different.

import * as Blockly from 'blockly/core';
import {beforeEach, describe, expect, it} from 'vitest';

import {
  SCOPED_DEFAULT_EXTENSION,
  scopedVariableDefaultExtension,
} from '../extensions/scopedVariableDefault';
import {
  markPreviewWorkspace,
  SCOPED_VARIABLE_FIELD,
  UNNAMED,
} from '../fields/scopedVariable';
import {
  ActorVariable,
  ListVariable,
  NumberVariable,
  StringVariable,
  VectorVariable,
} from '../typedVariables';

/** A getter of our own, defined the way the real ones are. */
const GETTER = 'test_get_number';
/** Something with a socket, so plugging a reader in counts as moving it. */
const HOLDER = 'test_holds';
/** …and a block that WRITES one, which is what makes a name the file's. */
const USER = 'variables_set_Number';

const options = (field: Blockly.Field): string[] =>
  (field as Blockly.FieldDropdown)
    .getOptions(false)
    .map(([, id]) => String(id));

/**
 * The messages, the extension and the two blocks these cases build.
 *
 * Hoisted so every group is self-contained: they were in one group's setup and
 * the others were quietly relying on having run after it.
 */
const define = () => {
  // The two entries Blockly's own menu ends with, which it reads the moment
  // a field takes a value.
  Blockly.Msg.RENAME_VARIABLE = 'Rename…';
  Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
  if (!Blockly.Extensions.isRegistered(SCOPED_DEFAULT_EXTENSION)) {
    Blockly.Extensions.register(
      SCOPED_DEFAULT_EXTENSION,
      scopedVariableDefaultExtension.extension as never,
    );
  }
  Blockly.defineBlocksWithJsonArray([
    {
      type: GETTER,
      message0: '%1',
      args0: [
        {
          type: SCOPED_VARIABLE_FIELD,
          name: 'VAR',
          variableTypes: ['Number'],
          defaultType: 'Number',
        },
      ],
      // The real getter carries this through `createTypedVariable`; a block
      // defined here has to name it, and it has to be registered with
      // Blockly first — the driver does that in the app, and these cases
      // build blocks straight onto a workspace (`defineExtension` returns
      // the definition rather than registering it).
      extensions: [SCOPED_DEFAULT_EXTENSION],
      output: 'Number',
    },
    {
      // Something to plug a reader into, so connecting it is a real move —
      // Blockly drops a `BlockMove` whose start and end are the same place.
      type: HOLDER,
      message0: 'holds %1',
      args0: [{type: 'input_value', name: 'IN'}],
      previousStatement: true,
      nextStatement: true,
    },
    {
      // A block that WRITES the name, which is what makes one the file's.
      type: USER,
      message0: 'set %1 to something',
      args0: [
        {
          type: 'field_variable',
          name: 'VAR',
          variableTypes: ['Number'],
          defaultType: 'Number',
        },
      ],
      previousStatement: true,
      nextStatement: true,
    },
  ]);
};

describe('every flavour', () => {
  it('reads a name with the scoped field and declares one with Blockly’s', () => {
    // TWO KINDS OF FIELD, and the difference is which side of a name the block
    // is on. A loop and a `let` DECLARE — such a block always has a variable,
    // and Blockly inventing one for it is right. A getter READS: it may name
    // nothing, and what it can name depends on where it sits.
    //
    // Getting this wrong is what made every loop variable vanish: the scoped
    // field starts empty, so a `for each` that used it bound nothing at all.
    for (const flavour of [
      NumberVariable,
      StringVariable,
      ActorVariable,
      VectorVariable,
      ListVariable,
    ]) {
      expect((flavour.field('VAR') as unknown as {type: string}).type).toBe(
        'field_variable',
      );
      const getter = flavour.getterBlock as unknown as {
        args0: Array<{type: string}>;
      };
      expect(getter.args0[0].type).toBe(SCOPED_VARIABLE_FIELD);
    }
  });
});

describe('a getter’s menu', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    define();
    workspace = new Blockly.Workspace();
  });

  it('leaves out a name nothing in the file uses', () => {
    // THE BUG THIS WAS FOUND BY. Every block in the toolbox carries a default
    // name and Blockly makes the variable so the flyout can draw it, so the
    // map is full of names before anything has been dragged out. A getter
    // offering one reads a variable nothing ever sets.
    const ghost = workspace.getVariableMap().createVariable('amount', 'Number');
    const getter = workspace.newBlock(GETTER);

    expect(options(getter.getField('VAR')!)).not.toContain(ghost.getId());
  });

  it('names nothing until it is told, and says so', () => {
    // A stock variable field invents a variable the moment it has none, which
    // is what put `flag` and `amount` in the drawer and let a getter be
    // dragged out reading a name nothing declares and nothing ever sets.
    const getter = workspace.newBlock(GETTER);

    // `getFieldValue` answers null for a field holding nothing, which is the
    // same fact said in Blockly's words.
    expect(getter.getFieldValue('VAR')).toBeFalsy();
    expect(getter.getField('VAR')!.getText()).toBe(UNNAMED);
    expect(options(getter.getField('VAR')!)).toEqual(['']);
  });

  it('offers a name once one is in scope', () => {
    // The other half: `???` is what an empty scope looks like, not what the
    // field always looks like.
    const seen = workspace.getVariableMap().createVariable('tally', 'Number');
    const user = workspace.newBlock(USER);
    user.setFieldValue(seen.getId(), 'VAR');
    const getter = workspace.newBlock(GETTER);

    expect(options(getter.getField('VAR')!)).toContain(seen.getId());
  });
});

// WHAT IT DRAWS, which has to agree with what it offers.
//
// A getter dragged out of the drawer holds Blockly's default for its flavour —
// the field invents one the moment it has none — so it drew `flag` while its
// own menu offered only `???`. Both halves were seen in the browser before
// they were written down here: the menu said one thing and the block said
// another, and picking the menu's answer changed nothing.
describe('a name the block cannot see', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    define();
    workspace = new Blockly.Workspace();
  });

  it('draws `???`, not the name it happens to hold', () => {
    const stray = workspace.getVariableMap().createVariable('flag', 'Number');
    const getter = workspace.newBlock(GETTER);
    getter.setFieldValue(stray.getId(), 'VAR');

    // It holds the id — nothing has taken it away — and shows the absence,
    // because nothing in the file writes that name.
    expect(getter.getFieldValue('VAR')).toBe(stray.getId());
    expect(getter.getField('VAR')!.getText()).toBe(UNNAMED);
  });

  it('draws the name once the file writes it', () => {
    // The other half: `???` is what being out of scope looks like, not what
    // the field always looks like.
    const seen = workspace.getVariableMap().createVariable('tally', 'Number');
    workspace.newBlock(USER).setFieldValue(seen.getId(), 'VAR');
    const getter = workspace.newBlock(GETTER);
    getter.setFieldValue(seen.getId(), 'VAR');

    expect(getter.getField('VAR')!.getText()).toBe('tally');
  });

  it('draws what it holds in a `define block`’s preview', () => {
    // A preview is a PICTURE of the block a definition will add, with a getter
    // in each socket naming the argument that goes there
    // (`FieldBlockPreview`). Those getters are a sample in exactly the sense a
    // flyout's are — nobody runs them, and there is no program around them to
    // be in the scope of — but they are not in a flyout, so the scope walk
    // found nothing and every parameter in every preview drew `???` while the
    // field underneath held the right variable all along.
    markPreviewWorkspace(workspace);
    const amount = workspace
      .getVariableMap()
      .createVariable('amount', 'Number');
    const getter = workspace.newBlock(GETTER);
    getter.setFieldValue(amount.getId(), 'VAR');

    expect(getter.getField('VAR')!.getText()).toBe('amount');
  });

  it('can be cleared by choosing `???`', () => {
    // Blockly's validation looks an id up and answers null when it finds
    // nothing, which leaves the old value in place — so choosing the empty
    // entry did nothing at all.
    const stray = workspace.getVariableMap().createVariable('flag', 'Number');
    const getter = workspace.newBlock(GETTER);
    getter.setFieldValue(stray.getId(), 'VAR');

    getter.setFieldValue('', 'VAR');

    expect(getter.getFieldValue('VAR')).toBeFalsy();
    expect(getter.getField('VAR')!.getText()).toBe(UNNAMED);
  });
});

// WHAT THE MENU REMEMBERS, which for a scoped list is nothing.
//
// `FieldDropdown` caches what a generator last returned, and both the menu and
// the checkmark beside an entry are drawn from that memory. A list that
// depends on where the block SITS is wrong the moment it is dragged: a field
// built in the flyout cached an empty scope, and one built beside a name it
// could see goes on offering that name after it is carried away.
describe('the option list', () => {
  it('is regenerated, never remembered', () => {
    Blockly.Msg.RENAME_VARIABLE = 'Rename…';
    Blockly.Msg.DELETE_VARIABLE = 'Delete %1';
    const workspace = new Blockly.Workspace();
    const getter = workspace.newBlock(GETTER);
    const field = getter.getField('VAR') as Blockly.FieldDropdown;

    // Nothing in scope yet, so nothing to offer.
    expect(field.getOptions().map(([, id]) => String(id))).toEqual(['']);

    // …and now a name the file writes.
    const seen = workspace.getVariableMap().createVariable('tally', 'Number');
    workspace.newBlock(USER).setFieldValue(seen.getId(), 'VAR');

    // Asked WITH the cache, which is what the menu does. A remembered list
    // would still be the empty one.
    expect(field.getOptions().map(([, id]) => String(id))).toEqual([
      seen.getId(),
    ]);
  });
});

// `???` MEANS ONE THING: there is nothing here to name.
//
// It should not also mean "you have not picked yet". A reader dropped into a
// body with one name in it wants that name, and making somebody open a menu
// with a single entry to say so is a step that teaches nothing.
//
// The difficulty is WHEN. Coercing during validation would rewrite a whole
// file on load — every block is created before it is connected, so every
// reader is briefly floating and sees an empty scope. So it happens when a
// block is somewhere: it was MOVED, or the file finished loading
// (`extensions/scopedVariableDefault`).
describe('a reader with nothing chosen', () => {
  let workspace: Blockly.Workspace;

  beforeEach(() => {
    define();
    workspace = new Blockly.Workspace();
  });

  /**
   * Tell the block it has come to rest somewhere.
   *
   * THE HANDLER DIRECTLY, not through Blockly's dispatch. A bare
   * `Blockly.Workspace` delivers nothing to its change listeners in this
   * harness — a real connection fires no event a listener hears — so going
   * through `Events.fire` would be testing Blockly's plumbing and finding it
   * absent. What is this module's to get right is what the handler DOES with
   * an event, and that is what these cases drive.
   *
   * What they therefore do NOT cover is that a drag produces this event. That
   * is Blockly's, and it wants a browser.
   */
  const deliver = (reader: Blockly.Block, type: string) => {
    const onchange = (
      reader as unknown as {
        onchange?: (event: {type: string; blockId: string}) => void;
      }
    ).onchange;
    onchange?.call(reader, {type, blockId: reader.id});
  };

  /** The block was made, which is not the same as the block being anywhere. */
  const created = (reader: Blockly.Block) =>
    deliver(reader, Blockly.Events.BLOCK_CREATE);

  const settled = (reader: Blockly.Block) =>
    deliver(reader, Blockly.Events.BLOCK_MOVE);

  it('takes the one name in scope rather than saying `???`', () => {
    const seen = workspace.getVariableMap().createVariable('tally', 'Number');
    workspace.newBlock(USER).setFieldValue(seen.getId(), 'VAR');
    const getter = workspace.newBlock(GETTER);
    expect(getter.getFieldValue('VAR')).toBeFalsy();
    settled(getter);

    expect(getter.getFieldValue('VAR')).toBe(seen.getId());
    expect(getter.getField('VAR')!.getText()).toBe('tally');
  });

  it('still says `???` when there is nothing to take', () => {
    // The empty answer is reserved for a scope that really is empty.
    const getter = workspace.newBlock(GETTER);

    settled(getter);

    expect(getter.getFieldValue('VAR')).toBeFalsy();
    expect(getter.getField('VAR')!.getText()).toBe(UNNAMED);
  });

  it('does nothing when a block is merely CREATED', () => {
    // THE LOAD HAZARD, and the reason this listens for a move rather than a
    // creation. Every block in a file is created before it is connected, so on
    // load every reader is briefly floating with an empty scope — and would be
    // "corrected" to nothing at the moment it is least able to say what it
    // means.
    const seen = workspace.getVariableMap().createVariable('tally', 'Number');
    workspace.newBlock(USER).setFieldValue(seen.getId(), 'VAR');
    const getter = workspace.newBlock(GETTER);

    created(getter);

    expect(getter.getFieldValue('VAR')).toBeFalsy();
  });

  it('repaints a name that has just gone out of scope', () => {
    // The other way a move changes what a block should say. Nothing here can
    // see the pixels, so what is checked is that the field is asked to redraw
    // and that what it would draw is the absence — the paint itself is
    // Blockly's and wants a browser.
    const seen = workspace.getVariableMap().createVariable('tally', 'Number');
    const setter = workspace.newBlock(USER);
    setter.setFieldValue(seen.getId(), 'VAR');
    const getter = workspace.newBlock(GETTER);
    getter.setFieldValue(seen.getId(), 'VAR');
    expect(getter.getField('VAR')!.getText()).toBe('tally');

    // The block that wrote the name goes, so nothing in the file writes it.
    setter.dispose(false);
    settled(getter);

    expect(getter.getField('VAR')!.getText()).toBe(UNNAMED);
  });

  it('leaves a name it already holds alone', () => {
    // It fills a name IN and never swaps one out: two names in scope and a
    // reader pointed at the second must stay pointed at the second.
    const first = workspace.getVariableMap().createVariable('one', 'Number');
    const second = workspace.getVariableMap().createVariable('two', 'Number');
    workspace.newBlock(USER).setFieldValue(first.getId(), 'VAR');
    workspace.newBlock(USER).setFieldValue(second.getId(), 'VAR');
    const getter = workspace.newBlock(GETTER);
    getter.setFieldValue(second.getId(), 'VAR');

    settled(getter);

    expect(getter.getFieldValue('VAR')).toBe(second.getId());
  });
});

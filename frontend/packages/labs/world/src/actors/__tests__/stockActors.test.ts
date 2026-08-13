// The stock Label and Button (specs/UI_ACTORS.md).
//
// What these pin is that an interface element is an ORDINARY ACTOR. Every
// assertion below is one anybody's own `.actor` file would have to pass: it
// parses as an actor, its state comes from a trait it elects, and its picture
// comes from a `define drawing` beside the definition. If any of it needed a
// special case, these would be the wrong tests and the design would be the
// wrong design.

import {describe, expect, it} from 'vitest';

import {parseActorOwnMeta} from '../../blockly/actorMeta';
import {STOCK_ACTORS} from '../stock';
import {buttonActor} from '../stock/button';
import {labelActor} from '../stock/label';

/** The top-level blocks a file holds. */
const roots = (contents: string) =>
  (
    JSON.parse(contents) as {blocks: {blocks: Array<{type: string}>}}
  ).blocks.blocks.map(block => block.type);

/** Every block type in a file, however deeply nested. */
const types = (contents: string): string[] =>
  [...contents.matchAll(/"type": "([^"]+)"/g)].map(match => match[1]);

describe('every stock actor', () => {
  it('is a `define actor` and a `define drawing`, and nothing else', () => {
    // TWO ROOTS. A drawing takes no previous connection — `DisableOrphansPlugin`
    // greys out a top-level block that has one, and everything below it — so it
    // sits beside the definition rather than inside it (specs/DRAWING.md).
    for (const actor of STOCK_ACTORS) {
      expect(roots(actor.contents)).toEqual([
        'world_actor',
        'world_define_drawing',
      ]);
    }
  });

  it('declares no properties of its own', () => {
    // The whole reason `Shows Text` is a rule's trait. An actor-own property's
    // getter and setter live in that file's palette and nowhere else, so a
    // world could never say `set text of ⟨any ⟨Label⟩⟩` — which is the entire
    // point of having a label (specs/UI_ACTORS.md).
    for (const actor of STOCK_ACTORS) {
      const meta = parseActorOwnMeta(`actors/${actor.id}`, actor.contents);
      expect(meta?.properties ?? []).toEqual([]);
    }
  });

  it('names the rules it needs, and needs the ones it names', () => {
    // A `use trait` row naming a rule the project does not hold fails at
    // compile time with nothing on screen to say why, so the import brings
    // them — and this is what keeps the list honest.
    for (const actor of STOCK_ACTORS) {
      const elected = [...actor.contents.matchAll(/"TRAIT": "([^#]+)#/g)].map(
        match => match[1],
      );
      expect([...new Set(elected)].sort()).toEqual([...actor.requires].sort());
    }
  });
});

describe('Label', () => {
  it('draws one thing, and reads all of it off the actor', () => {
    // Text, size, colour and anchor are per-instance state, which is what lets
    // two Labels of one kind say different things — set from the map editor's
    // inspector with no editor work, because `describeActor` reports every
    // writable actor-scoped property a trait declares.
    const drawn = types(labelActor);

    expect(drawn).toContain('world_get_Text_TextProperty');
    expect(drawn).toContain('world_get_Text_TextSizeProperty');
    expect(drawn).toContain('world_get_Text_TextColorProperty');
    expect(drawn).toContain('world_get_Text_TextAnchorProperty');
    expect(drawn.filter(type => type === 'world_draw_text')).toHaveLength(1);
  });

  it('arrives with something to show', () => {
    // A Label dragged onto a map is visible before anybody types into it — and
    // the picker has a picture rather than a blank.
    expect(labelActor).toContain('world_set_Text_TextProperty');
    expect(labelActor).toContain('"TEXT": "Label"');
  });
});

describe('Button', () => {
  it('is a Label that elects one more trait', () => {
    // The demonstration that an interface actor is an actor: the click, the
    // words and the picture are three things that already existed, and a button
    // is what happens when they are in one file.
    expect(buttonActor).toContain('Text#ShowsTextTrait');
    expect(buttonActor).toContain('Mouse#CanBeClickedTrait');
    expect(types(buttonActor)).toContain('world_draw_text');
  });

  it('paints its face in the routine rather than carrying it as state', () => {
    // The line this draws: what a Button IS gets a property, what this
    // particular button LOOKS like is a routine you open and edit.
    expect(types(buttonActor)).toContain('world_draw_rectangle');
    expect(buttonActor).toContain('colour_picker');
  });

  it('turns its outline off before the word', () => {
    // A stroked letter at 12px is a smudge; the edge belongs to the face.
    expect(buttonActor.indexOf('world_pen_no_outline')).toBeLessThan(
      buttonActor.indexOf('world_draw_text'),
    );
  });
});

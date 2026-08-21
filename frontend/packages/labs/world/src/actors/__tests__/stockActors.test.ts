// The stock Label, Progress Bar, Health Bar and Button (specs/UI_ACTORS.md).
//
// What these pin is that an interface element is an ORDINARY ACTOR. Every
// assertion below is one anybody's own `.actor` file would have to pass: it
// parses as an actor, its state comes from a trait it elects, and its picture
// comes from a `define drawing` beside the definition. If any of it needed a
// special case, these would be the wrong tests and the design would be the
// wrong design.

import {describe, expect, it} from 'vitest';

import {parseActorOwnMeta} from '../../blockly/ownProperties';
import {STOCK_ACTORS} from '../stock';
import {buttonActor} from '../stock/button';
import {healthBarActor} from '../stock/healthBar';
import {labelActor} from '../stock/label';
import {progressBarActor} from '../stock/progressBar';

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

  it('borrows a property when a rule owns the idea, and keeps its own when none does', () => {
    // An actor MAY keep its own now — they are exported, and every actor's are
    // in every file's palette, so `set subject of ⟨any ⟨Health Bar⟩⟩` is a
    // sentence a world can say (blockly/ownProperties).
    //
    // What decides which is whether the idea is shared. `text` is Writing's
    // because a Label and a Score and a Button all mean the same thing by it;
    // `subject` is the Health Bar's because "whose health this bar is about"
    // is nobody else's idea and a rule for it would be a rule for one
    // property.
    const own = (id: string, contents: string) =>
      (parseActorOwnMeta(`actors/${id}`, contents)?.properties ?? []).map(
        property => property.id,
      );

    for (const actor of STOCK_ACTORS) {
      expect(own(actor.id, actor.contents)).toEqual(
        actor.id === 'healthBar' ? ['subject'] : [],
      );
    }
  });

  it('names the rules it needs, and needs the ones it names', () => {
    // A block naming a rule the project does not hold fails at compile time
    // with nothing on screen to say why, so the import brings them — and this
    // is what keeps the list honest.
    //
    // ELECTED AND READ, which used to be only elected. The Health Bar has no
    // health of its own: it reads its subject's, so `Health` appears in its
    // blocks and in no `use trait` row of its own. A list that only counted
    // traits would have said it needed nothing but Attachment, and the file
    // would not have generated in a project without Health.
    const slug = (name: string) => name.replace(/[^A-Za-z0-9]/g, '');
    for (const actor of STOCK_ACTORS) {
      const elected = [...actor.contents.matchAll(/"TRAIT": "([^#]+)#/g)].map(
        match => slug(match[1]),
      );
      // An OWN property's block is keyed by the actor's module path rather
      // than by a rule, so it names no dependency — `actors/healthBar` is not
      // a rule the import has to bring.
      const mine = slug(`Actors ${actor.id}`);
      const read = [
        ...actor.contents.matchAll(
          /"type": "world_(?:get|set|do|query)_([A-Za-z0-9]+)_/g,
        ),
      ]
        .map(match => match[1])
        .filter(name => name.toLowerCase() !== mine.toLowerCase());
      const named = [...new Set([...elected, ...read])].sort();

      expect(named).toEqual([...actor.requires].map(slug).sort());
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

    expect(drawn).toContain('world_get_Writing_TextProperty');
    expect(drawn).toContain('world_get_Writing_TextSizeProperty');
    expect(drawn).toContain('world_get_Writing_TextColorProperty');
    expect(drawn).toContain('world_get_Writing_TextAnchorProperty');
    expect(drawn.filter(type => type === 'world_draw_text')).toHaveLength(1);
  });

  it('arrives with something to show', () => {
    // A Label dragged onto a map is visible before anybody types into it — and
    // the picker has a picture rather than a blank.
    expect(labelActor).toContain('world_set_Writing_TextProperty');
    expect(labelActor).toContain('"TEXT": "Label"');
  });
});

describe('Progress Bar', () => {
  it('draws a whole track and a fill that is an expression', () => {
    // Two rectangles, and the second is the only measurement here that is not
    // a number. The track is drawn WHOLE and first, so what is left of it is
    // the empty part: there is no third rectangle for "the rest" and none to
    // keep in step with the other two.
    const drawn = types(progressBarActor);

    expect(drawn.filter(type => type === 'world_draw_rectangle')).toHaveLength(
      2,
    );
    expect(drawn).toContain('math_arithmetic');
  });

  it('reads every part of itself off the actor', () => {
    // Which is what lets two bars of one kind show two different things, set
    // from the map editor's inspector with no editor work.
    const drawn = types(progressBarActor);

    expect(drawn).toContain('world_get_Progress_FractionProperty');
    expect(drawn).toContain('world_get_Progress_BarColorProperty');
    expect(drawn).toContain('world_get_Progress_TrackColorProperty');
  });

  it('keeps its number in a rule, not in itself', () => {
    // THE WHOLE REASON `Progress` EXISTS. A `define property` mints its getter
    // and setter into its own file's palette and nowhere else, so a bar that
    // kept its own fraction would be a bar nothing in the project could fill —
    // and being filled by something else is what a progress bar is.
    expect(progressBarActor).toContain('Progress#ShowsProgressTrait');
    expect(parseActorOwnMeta('actors/progressBar', progressBarActor)).toEqual(
      expect.objectContaining({properties: []}),
    );
  });
});

describe('Health Bar', () => {
  it('asks for the health rather than being told it', () => {
    // The design, and the reason it is not a Progress Bar with a trait bolted
    // on. An earlier one elected `Shows Progress` and came with a rule whose
    // only job was a step writing `health ÷ most health` into `fraction` every
    // frame — one shared drawing bought with a rule, a trait, a step and a
    // paragraph. A drawing may ask the world now, so this one asks.
    const drawn = types(healthBarActor);

    expect(drawn).toContain('world_get_ActorsHealthBar_SubjectProperty');
    expect(drawn).toContain('world_get_Health_HealthProperty');
    expect(drawn).toContain('world_get_Health_MostHealthProperty');
    expect(healthBarActor).not.toContain('Progress#');
  });

  it('says whose health it is about, and nothing about where it sits', () => {
    // TWO INTENTIONS, TWO PROPERTIES. An earlier version read the actor
    // Attachment pointed it at, so one line said both — which is right for a
    // bar over an enemy's head and impossible for the commonest health bar
    // there is, the one in the corner of the screen that shows the player and
    // must not follow the player.
    //
    // A bar has no health of its own either: the thing it is pointed at does.
    // Electing Health here would give the BAR three hit points.
    const elected = [...healthBarActor.matchAll(/"TRAIT": "([^"]+)"/g)].map(
      match => match[1],
    );

    // None at all: `subject` is its own property, and the health belongs to
    // whatever that property names.
    expect(elected).toEqual([]);
    // Attachment is a project's to add, and composes: set both and it is a
    // bar that rides above the actor it is about.
    expect(healthBarActor).not.toContain('Attachment#');
  });

  it('draws an empty bar rather than throwing at nobody', () => {
    // Attached to nothing is the state of every one of these until something
    // points it, and a drawing runs on every paint — so the guard is
    // load-bearing rather than defensive.
    expect(types(healthBarActor)).toContain('world_any_actors');
    expect(types(healthBarActor)).toContain('logic_ternary');
  });
});

describe('Button', () => {
  it('is a Label that elects one more trait', () => {
    // The demonstration that an interface actor is an actor: the click, the
    // words and the picture are three things that already existed, and a button
    // is what happens when they are in one file.
    expect(buttonActor).toContain('Writing#ShowsTextTrait');
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

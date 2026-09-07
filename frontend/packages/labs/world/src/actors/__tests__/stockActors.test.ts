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
  it('has one `define actor`, and paints itself only if it has no picture', () => {
    // A HANDLER HAT IS A SEPARATE ROOT; THE DRAWING IS NOT. A hat takes no
    // previous connection — `DisableOrphansPlugin` grays out a top-level block
    // that has one, and everything below it — so it sits beside the definition.
    // A drawing chains as one of the actor's own rows, which is why this looks
    // for it in the whole file rather than among the roots (specs/DRAWING.md).
    for (const actor of STOCK_ACTORS) {
      const found = roots(actor.contents);
      expect(found.filter(type => type === 'world_actor')).toHaveLength(1);
      expect(found[0]).toBe('world_actor');
      expect(found).not.toContain('world_define_drawing');

      // An actor either has a picture or draws one, and never both: an
      // interface actor looks like whatever it says and must paint itself; a
      // Coin looks like a coin, and a drawing over the top of its animation
      // would hide it.
      const blocks = types(actor.contents);
      const paints = blocks.includes('world_define_drawing');
      const pictured =
        blocks.includes('world_play_animation') ||
        blocks.includes('world_set_sprite');
      expect(paints).toBe(!pictured);
    }
  });

  it('binds a key only through a trait that hears one', () => {
    // A handler hat is the actor's own doing, and `presses` is raised on an
    // actor only if it elected `Takes Keyboard Input`. A Player that bound the
    // space bar without electing it would be a file that reads correctly and
    // never fires.
    for (const actor of STOCK_ACTORS) {
      const blocks = types(actor.contents);
      if (blocks.includes('world_on_Input_PressesEvent')) {
        expect(actor.contents).toContain('Input#TakesKeyboardInputTrait');
      }
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
    // THE FOUNDATION IS NOT A DEPENDENCY. `Space` and `Appearance` are what
    // every actor has without electing anything, so they are in play in every
    // project and there is nothing to import — `stockRuleByName` does not know
    // them, and a `requires` naming one would resolve to nothing. A Portrait
    // setting its own opacity names Appearance and needs no rule at all.
    const foundation = new Set(['Space', 'Appearance']);
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
        .filter(
          name =>
            name.toLowerCase() !== mine.toLowerCase() && !foundation.has(name),
        );
      const named = [...new Set([...elected, ...read])].sort();

      expect(named).toEqual([...actor.requires].map(slug).sort());
    }
  });
});

describe('Label', () => {
  it('draws one thing, and reads all of it off the actor', () => {
    // Text, size, color and anchor are per-instance state, which is what lets
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
  it('asks for the health, and fills a progress bar with it', () => {
    // IT IS A PROGRESS BAR THAT WORKS OUT ITS OWN FRACTION. An earlier version
    // was this; then it was a bar that asked the world from inside its
    // drawing, on the grounds that one shared picture across two actors was
    // not worth a trait and a step. A third bar arrived — the jetpack's Fuel
    // Bar, which elects `Shows Progress` and sets `fraction` from the tank —
    // so the seam is there and being used, and this was the one bar not using
    // it.
    //
    // The reads are the same reads; where they happen is the difference. A
    // fraction worked out once a frame in a step is a fraction, and a drawing
    // that only draws is a drawing.
    const held = types(healthBarActor);

    expect(held).toContain('world_get_ActorsHealthBar_SubjectProperty');
    expect(held).toContain('world_get_Health_HealthProperty');
    expect(held).toContain('world_get_Health_MostHealthProperty');
    expect(held).toContain('world_set_Progress_FractionProperty');
    // …and the picture is the one every bar draws, so it reads Progress's
    // colors rather than naming two of its own.
    expect(held).toContain('world_get_Progress_BarColorProperty');
    expect(held).toContain('world_get_Progress_TrackColorProperty');
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

    // `Shows Progress` and nothing else: that one says what this actor IS —
    // a bar with a fraction and two colors. Whose health it shows is
    // `subject`, its own property, because the health belongs to whatever
    // that names. Electing Health here would give the BAR three hit points.
    expect(elected).toEqual(['Progress#ShowsProgressTrait']);
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

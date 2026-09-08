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
      //
      // …OR IT INHERITS ONE. A Health Bar acts like a Progress Bar and says
      // nothing about a picture, because a bar's picture is the Progress Bar's
      // and saying it twice is somewhere for the two to disagree
      // (`ActorBuilder.actsLike`).
      const blocks = types(actor.contents);
      const paints = blocks.includes('world_define_drawing');
      const pictured =
        blocks.includes('world_play_animation') ||
        blocks.includes('world_set_sprite');
      const inherits = blocks.includes('world_acts_like');
      expect(paints || pictured || inherits, actor.id).toBe(true);
      expect(paints && pictured, actor.id).toBe(false);
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
    /** What each kind keeps for itself, and nothing keeps by accident. */
    const KEEPS: Record<string, readonly string[]> = {
      subject: [],
      // Whose health this bar is about — nobody else's idea.
      healthBar: ['subject'],
      // …and what a bar IS: how far along it is, and the two colors it is
      // drawn in. These were `Progress`, a rule with three properties and no
      // behavior; the bars that are not this one act like it and get them
      // (`ActorBuilder.actsLike`).
      progressBar: ['fraction', 'bar_color', 'track_color'],
      // …and how big a Label is, which is the box its words are laid into. The
      // base of the interface set, so everything that acts like a Label is
      // sized the same way (specs/UI_ACTORS.md).
      label: ['width', 'height'],
      // The typewriter. `the whole line` is what is being said, where `text`
      // is however much of it has arrived — Writing's, because every actor
      // with words means the same thing by it. A rule for these two would be
      // a rule for one kind of actor (`actors/stock/speechBox`).
      speechBox: ['the_whole_line', 'letters_a_second'],
    };

    for (const actor of STOCK_ACTORS) {
      expect(own(actor.id, actor.contents)).toEqual(KEEPS[actor.id] ?? []);
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
      // An OWN property's block is keyed by the declaring actor's module path
      // rather than by a rule, so `ActorsProgressBar_…` names an ACTOR
      // dependency and not a rule one — brought by `actors` rather than by
      // `requires`, and its own file's blocks name nothing at all.
      const mine = slug(`Actors ${actor.id}`);
      const owners = [
        ...actor.contents.matchAll(
          /"type": "world_(?:get|set|do|query)_([A-Za-z0-9]+)_/g,
        ),
      ]
        .map(match => match[1])
        .filter(
          name =>
            name.toLowerCase() !== mine.toLowerCase() && !foundation.has(name),
        );
      // Case-insensitively, as `mine` is compared above: `slug` only strips
      // punctuation, where a block type's segment is Pascal-cased per path
      // part (`ruleRegistry.pathSlug`) — so `Actorsprogressbar` and
      // `ActorsProgressBar` are one actor spelled two ways.
      const fromActor = (name: string) =>
        STOCK_ACTORS.some(
          one => slug(`Actors ${one.id}`).toLowerCase() === name.toLowerCase(),
        );
      const read = owners.filter(name => !fromActor(name));
      const named = [...new Set([...elected, ...read])].sort();

      expect(named, actor.id).toEqual([...actor.requires].map(slug).sort());
      // …and every actor whose declarations this one reads is one the import
      // brings. It reads them because it ACTS LIKE that actor, and a bar whose
      // parent never arrived inherits nothing at all.
      expect(
        [...new Set(owners.filter(fromActor))]
          .map(name => name.toLowerCase())
          .sort(),
        actor.id,
      ).toEqual(
        [...(actor.actors ?? [])]
          .map(id => slug(`Actors ${id}`).toLowerCase())
          .sort(),
      );
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
    // A PARAGRAPH, not a word: the words wrap to the box and break where the
    // text says to, which is what makes a Label hold a sentence and what
    // `⟨new line⟩` is for (specs/UI_ACTORS.md).
    expect(drawn.filter(type => type === 'world_draw_paragraph')).toHaveLength(
      1,
    );
    expect(drawn).not.toContain('world_draw_text');
  });

  it('is as big as it says it is', () => {
    // Its own `width` and `height`, and a drawing sized from them — so two
    // Labels of one kind are two boxes. It was two numbers typed into
    // `define drawing`, one pair per KIND, and resizing one was not a thing
    // that could be said.
    const drawn = types(labelActor);

    expect(drawn).toContain('world_get_ActorsLabel_WidthProperty');
    expect(drawn).toContain('world_get_ActorsLabel_HeightProperty');
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

    expect(drawn).toContain('world_get_ActorsProgressBar_FractionProperty');
    expect(drawn).toContain('world_get_ActorsProgressBar_BarColorProperty');
    expect(drawn).toContain('world_get_ActorsProgressBar_TrackColorProperty');
  });

  it('keeps its number in itself, and nothing else needs to hold it', () => {
    // THREE `define property` ROWS AND NO RULE. They were `Progress`, a rule
    // with three properties and no behavior of any kind — no steps, no blocks
    // — which is a file, a shelf row and an import standing between a learner
    // and three declarations they can read in the actor that uses them.
    //
    // Being filled by something ELSE is what a progress bar is, and that still
    // works: an actor's own properties are exported and every actor's are in
    // every file's palette, so a world may say `set fraction of ⟨any ⟨Progress
    // Bar⟩⟩` (blockly/ownProperties). It could not when this was written,
    // which is why it was a rule.
    expect(progressBarActor).not.toContain('world_use_trait');
    expect(
      parseActorOwnMeta('actors/progressBar', progressBarActor)?.properties.map(
        property => property.id,
      ),
    ).toEqual(['fraction', 'bar_color', 'track_color']);
  });
});

describe('Health Bar', () => {
  it('asks for the health, and fills a progress bar with it', () => {
    // IT IS A PROGRESS BAR THAT WORKS OUT ITS OWN FRACTION — literally, since
    // it acts like one. `fraction` is that actor's own property, so the block
    // this writes carries THAT file and this one has the slot because the
    // description came across (`ActorBuilder.actsLike`).
    //
    // The reads are the same reads; where they happen is the difference. A
    // fraction worked out once a frame in a step is a fraction, and a drawing
    // that only draws is a drawing.
    const held = types(healthBarActor);

    expect(held).toContain('world_get_ActorsHealthBar_SubjectProperty');
    expect(held).toContain('world_get_Health_HealthProperty');
    expect(held).toContain('world_get_Health_MostHealthProperty');
    expect(held).toContain('world_set_ActorsProgressBar_FractionProperty');
    // …and NOT the picture, which is the Progress Bar's along with the colors
    // it reads. A second copy of the track, the fill and the expression
    // between them would be somewhere for the two to disagree — this file
    // says `acts like` instead, in a row a learner can read.
    expect(held).toContain('world_acts_like');
    expect(held).not.toContain('world_define_drawing');
    expect(held).not.toContain('world_get_Progress_BarColorProperty');
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

    // NONE, and that is the change: `Shows Progress` says what this actor IS,
    // and what it is is a Progress Bar — so it acts like one and the trait
    // comes with it (`ActorBuilder.actsLike`). Whose health it shows is
    // `subject`, its own property, because the health belongs to whatever that
    // names. Electing Health here would give the BAR three hit points.
    expect(elected).toEqual([]);
    expect(healthBarActor).toContain('actors/progressBar');
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

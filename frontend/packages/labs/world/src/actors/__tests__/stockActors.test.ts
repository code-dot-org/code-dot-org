// The stock Label, Progress Bar, Health Bar and Button (specs/UI_ACTORS.md).
//
// What these pin is that an interface element is an ORDINARY ACTOR. Every
// assertion below is one anybody's own `.actor` file would have to pass: it
// parses as an actor, its state comes from a trait it elects, and its picture
// comes from a `define drawing` beside the definition. If any of it needed a
// special case, these would be the wrong tests and the design would be the
// wrong design.

import {describe, expect, it} from 'vitest';

import {BUILTIN_RULE_META} from '../../blockly/builtinMeta';
import {parseActorOwnMeta} from '../../blockly/ownProperties';
import {parseRuleMeta} from '../../blockly/ruleMeta';
import {STOCK_RULES} from '../../rules/stock';
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
      // Whether the switch is on: the Toggle's, and what its two events say.
      toggle: ['on'],
      // A slider is as big as it says. What it was following is the Gestures
      // rule's to remember now, so it keeps nothing else of its own.
      slider: [],
      // A list's words, how far the window has travelled, and which row the
      // keys are on. The scroll is a number of PIXELS and not of rows, which
      // is what lets a drag move it by whatever it moved by.
      list: ['items', 'scroll', 'highlighted', 'can_remove'],
      // A dropdown's words, whether it is open, and which row the keys are on.
      dropdown: ['choices', 'open', 'highlighted'],
      // How an Image meets its box: fill it exactly, or fit inside it keeping
      // the picture's shape. Nobody else's idea — a Label has no picture and a
      // Coin has no box it must sit in.
      // How the picture meets its box. The BOX is nobody's own any more — it
      // is the `Has a Box` trait's, which every interface kind elects
      // (specs/BOXES_PLAN.md).
      image: ['stretches'],
      // A text area's caret; its lines are newlines in the words themselves.
      textArea: ['caret'],
      // …and what a bar IS: how far along it is, and the two colors it is
      // drawn in. These were `Progress`, a rule with three properties and no
      // behavior; the bars that are not this one act like it and get them
      // (`ActorBuilder.actsLike`).
      progressBar: ['fraction', 'bar_color', 'track_color'],
      // …and everything a Label IS: the words, how they look, and the box they
      // are laid into. The first four were the Writing rule — four properties
      // and no behavior — and the base of the interface set holds them now, so
      // everything that acts like a Label has them (specs/UI_ACTORS.md).
      label: ['text', 'text_size', 'text_color', 'text_anchor'],
      // The typewriter. `the whole line` is what is being said, where `text`
      // is however much of it has arrived — Writing's, because every actor
      // with words means the same thing by it. A rule for these two would be
      // a rule for one kind of actor (`actors/stock/speechBox`).
      speechBox: ['the_whole_line', 'letters_a_second'],
      // Where the typing goes, and how far the words have slid left to keep it
      // in the box. Both are facts about ONE line of text in ONE box — a
      // paragraph has no insertion point and neither does a Label — so a rule
      // for them would be a rule for one kind of actor
      // (`actors/stock/textInput`). `focused` is NOT here, and used to be:
      // which control is listening is the screen's business and belongs to Tab
      // Navigation (specs/UI_ACTORS.md).
      // …and what a FORM asks of a field, which the four after the caret are:
      // what it says while empty, whether it takes digits only, and whether a
      // project has called the answer wrong (specs/FIELDS_PLAN.md).
      textInput: ['caret', 'scroll', 'hint', 'only_numbers', 'looks_wrong'],
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
    // …and Viewport, the third of them (specs/VIEWPORT_PLAN.md); and Boxed,
    // the fourth, which is a width and a height and which every interface
    // actor elects (specs/BOXES_PLAN.md).
    const foundation = new Set(['Space', 'Appearance', 'Viewport', 'Boxed']);
    for (const actor of STOCK_ACTORS) {
      const elected = [...actor.contents.matchAll(/"TRAIT": "([^#]+)#/g)]
        .map(match => slug(match[1]))
        .filter(name => !foundation.has(name));
      // An OWN property's block is keyed by the declaring actor's module path
      // rather than by a rule, so `ActorsProgressBar_…` names an ACTOR
      // dependency and not a rule one — brought by `actors` rather than by
      // `requires`, and its own file's blocks name nothing at all.
      const mine = slug(`Actors ${actor.id}`);
      const owners = [
        ...actor.contents.matchAll(
          // …and `emit`: raising another kind's event names that kind, and
          // the file will not generate without it.
          /"type": "world_(?:get|set|do|query|emit)_([A-Za-z0-9]+)_/g,
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
      // …and every actor whose declarations this one reads, or that it ACTS
      // LIKE, is one the import brings: a bar whose parent never arrived
      // inherits nothing at all. A Toggle acts like a Button and reads the
      // Label's box through it, so it names both.
      const actsLike = [
        ...actor.contents.matchAll(
          /"type": "world_acts_like"[\s\S]*?"ACTOR": "actors\/([A-Za-z0-9]+)"/g,
        ),
      ].map(match => slug(`Actors ${match[1]}`));
      expect(
        [
          ...new Set(
            [...owners.filter(fromActor), ...actsLike].map(name =>
              name.toLowerCase(),
            ),
          ),
        ].sort(),
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

    expect(drawn).toContain('world_get_ActorsLabel_TextProperty');
    expect(drawn).toContain('world_get_ActorsLabel_TextSizeProperty');
    expect(drawn).toContain('world_get_ActorsLabel_TextColorProperty');
    expect(drawn).toContain('world_get_ActorsLabel_TextAnchorProperty');
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

    expect(drawn).toContain('world_get_Boxed_WidthProperty');
    expect(drawn).toContain('world_get_Boxed_HeightProperty');
  });

  it('arrives with something to show', () => {
    // A Label dragged onto a map is visible before anybody types into it — and
    // the picker has a picture rather than a blank.
    expect(labelActor).toContain('world_set_ActorsLabel_TextProperty');
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
    // It elects `Has a Box` and nothing else. A box is shared by every interface kind,
    // which is exactly the test this lab applies — `fraction` is the bar's
    // because nobody else means anything by it, and a width is everybody's
    // (specs/BOXES_PLAN.md). What it must NOT have is a rule holding its
    // three numbers, which is what this is really about.
    expect(
      types(progressBarActor).filter(one => one === 'world_use_trait'),
    ).toHaveLength(1);
    expect(progressBarActor).toContain('Boxed#HasABoxTrait');
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
  it('IS a Label, said in a row, and elects one more trait', () => {
    // The demonstration that an interface actor is an actor: the click, the
    // words and the picture are three things that already existed, and a
    // button is what happens when they are in one file. What it has in common
    // with a Label is now a row rather than a repeated `use trait` — the
    // words, their size and color and the box they fill all come across
    // (`ActorBuilder.actsLike`).
    expect(buttonActor).toContain('actors/label');
    expect(buttonActor).not.toContain('"NAME": "text"');
    expect(buttonActor).toContain('Mouse#CanBeClickedTrait');
    expect(types(buttonActor)).toContain('world_draw_paragraph');
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
      buttonActor.indexOf('world_draw_paragraph'),
    );
  });
});

// Every `use trait` names a trait that EXISTS.
//
// The failure this closes has now happened three times, and every time it was
// silent by construction: a `use trait` row whose value resolves to nothing
// elects nothing. No error, no warning, no missing block — the file loads, the
// actor is built, and the trait is simply not there.
//
//   • the Scroll View elected Takes Gestures and not Can Be Clicked, so it
//     could be dragged and not clicked;
//   • the Scroll View's hat named a rule the project lacked, so what was
//     chained under it ran at the top of the module;
//   • and `Boxed#HasABoxTrait` named an export called `BoxedTrait`, so NINE
//     interface actors had no box — which nothing noticed until a person
//     looked at the map editor and saw no resize handles
//     (specs/BOXES_PLAN.md).
//
// The other checks in this file read what a file READS, through property
// blocks. An election reads nothing, which is exactly why it needed its own.
describe('every trait a stock actor elects', () => {
  it('is one that some rule actually declares', () => {
    // Both halves of what a project can hold: the rules the engine provides,
    // and the stock `.rule` files an actor's `requires` brings.
    const known = new Set<string>();
    for (const meta of BUILTIN_RULE_META) {
      for (const trait of meta.traits) {
        known.add(`${meta.name}#${trait.ref.exportName}`);
      }
    }
    for (const rule of STOCK_RULES) {
      const meta = parseRuleMeta(`rules/${rule.id}`, rule.contents);
      for (const trait of meta?.traits ?? []) {
        known.add(`${meta?.name}#${trait.ref.exportName}`);
      }
    }

    for (const actor of STOCK_ACTORS) {
      const elected = [...actor.contents.matchAll(/"TRAIT": "([^"]+)"/g)].map(
        match => match[1],
      );
      for (const value of elected) {
        expect(known.has(value), `${actor.id} elects ${value}`).toBe(true);
      }
    }
  });
});

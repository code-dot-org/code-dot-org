// The enhancement shelf: what a project can give something it already has.
//
// AN ENHANCEMENT IS NOT AN IMPORT, and the Health Bar is what made the
// difference obvious. Importing one gives a project a file; what a learner
// wanted was a bar ABOUT something — health on the actor, a bar over its head,
// and the line pointing one at the other. Three edits across three files, none
// of which is right without the others, and all of which the bar's own
// description had to explain in prose because nothing in the lab could do it.
//
// So the test for whether something belongs here: it takes MORE THAN ONE EDIT,
// or it needs a companion actor, or it needs a line aiming two things at each
// other. Anything that is only "elect this trait" belongs on the rule shelf.
//
// …OR IT IS A VERB the actor did not have, however few lines it takes. The
// enemy rows made this explicit: two of them write one `use trait` apiece, and
// the paragraph above would send both away. It is measuring the wrong thing.
// What the rule shelf hands over is a RULE: a file in the project and a name
// in the rules list. It elects nothing on any actor. Between that and a
// patrolling guard there is still a row to drag, the right trait to find among
// ninety, and, before either, the knowledge that walking about is called
// "Patrol". What a row saves is what the learner has to already know, which is
// not the same quantity as how many lines it writes.
//
// So a row is welcome when it is one verb a learner would recognise as a want
// — the `use trait`, and the rule imported if the project has not got it. What
// is not a row is a trait nobody asks for BY NAME because something else
// always brings it: `Physics#Can Move` is the substrate under every verb that
// moves, and a learner wanting movement wants walking or patrolling rather
// than the thing underneath them.
//
// FALLING IS NOT ONE OF THOSE, though this comment said it was: gravity
// arrives with `Jumps` for a player and with nothing at all for an enemy. The
// jetpack Blob elects it alone, with no jump and no keyboard, and an actor
// that should be pulled onto the floor and must not be handed a jump key has
// no row yet (specs/ENHANCEMENTS.md).
//
// AND THIS SHELF IS GOING TO BE A STEP, which is why the guard could relax.
// Read from an actor's own menu, ninety verbs is a wall; read as the "what can
// it do" step of the Actor Creator, a broad list is the point
// (specs/ACTOR_CREATION_WIZARD.md).
//
// WHAT IT LEAVES BEHIND IS A PROJECT. Every edit is ordinary blocks in files
// the learner owns (`./patch`), so an enhancement is a shortcut through work
// they could have done by hand — never a thing the library keeps a hold of.
// Nothing marks an enhanced actor as enhanced; there is nothing to un-enhance
// but blocks to delete.
//
// A SUBJECT, AND SOMETIMES AN ARGUMENT, which the camera taught. "Health and a
// bar above it" edits the ACTOR: the trait, the property and the handlers all
// land in its file, and the bar it places is a companion it makes. "A camera
// that follows an actor" edits no actor at all — it defines a camera in the
// WORLD and points it at one, so the actor is a value in the patch rather than
// the thing being patched.
//
// Reading that as an actor enhancement was wrong in the way that matters: it
// was asked for from the actor's own sparkles, and answering it wrote nothing into
// the file the learner was looking at. So an enhancement says whose it is
// (`subject`), and one that needs to name something else ASKS for it — which
// is a question the shelf puts under the row, rather than a fact it guesses
// from where it was opened.

import type {MultiFileSource} from '@code-dot-org/core/api';

import {cameraFollowEnhancement} from './cameraFollow';
import {carriesEnhancement} from './carries';
import {chasesEnhancement} from './chases';
import {climbArrowsEnhancement} from './climbArrows';
import {collectsEnhancement} from './collects';
import {dealsDamageEnhancement} from './dealsDamage';
import {drivesEnhancement} from './drives';
import {expiresEnhancement} from './expires';
import {fallsEnhancement} from './falls';
import {healthEnhancement} from './health';
import {holdsThingsUpEnhancement} from './holdsThingsUp';
import {flapsEnhancement, prowlsEnhancement} from './hunts';
import {canBeCarriedEnhancement, carriesThingsEnhancement} from './inventory';
import {jetpackEnhancement} from './jetpack';
import {patrolsEnhancement} from './patrols';
import {platformerControlsEnhancement} from './platformerControls';
import {ridesEnhancement} from './rides';
import {scoreboardEnhancement} from './scoreboard';
import {shootsEnhancement} from './shoots';
import {
  conveysEnhancement,
  slipperyEnhancement,
  slowsEnhancement,
  walksOnSurfacesEnhancement,
} from './surfaces';
import {isASwitchEnhancement, isASwitchedWallEnhancement} from './switches';
import {
  isATeleportPadEnhancement,
  takenByAnyPadEnhancement,
  usesTeleportPadsEnhancement,
} from './teleport';
import {topDownControlsEnhancement} from './topDownControls';
import {typesOutTextEnhancement} from './typesOutText';
import {wrapsAcrossEnhancement, wrapsDownEnhancement} from './wraps';

/** What one enhancement is. */
export interface Enhancement {
  /** Its id, which is what a lesson or a test names it by. */
  id: string;
  /**
   * WHOSE it is: the thing whose files this edits, and so where it is asked
   * for. An actor's sparkles offer the actor ones; a world's offers the world
   * ones.
   */
  subject: 'actor' | 'world';
  /** What it is called, on the shelf — a sentence about the thing, not a file. */
  name: string;
  /** One line on what it gives that thing. */
  description: string;
  /**
   * What else lands in the project, in words a learner reads.
   *
   * The same promise the import dialogs make with "Also adds": an enhancement
   * writes rules, actors and blocks into files, and a learner who is about to
   * let it should be told what it will touch.
   */
  brings: readonly string[];
  /**
   * Whether this actor can take it, and why not when it cannot.
   *
   * A Health Bar cannot be given a health bar — it would ride above itself and
   * show its own empty health. A row that answers is LEFT OUT of the list
   * (`EnhancementChecklist`): what a learner is asking is what this actor can
   * do, and a locked row with a reason beside it is an entry about some other
   * actor. The reason is for whoever reads this file, and for the test that
   * pins which rows step aside on which targets (`__tests__/paletteGuard`).
   *
   * GIVEN THE PROJECT, because the reason may be a fact about the actor's own
   * file rather than about what kind of thing it is: a floor takes ONE of the
   * three surfaces, so what stops it taking a second is the first
   * (`enhance/surfaces`).
   */
  refuse?(source: MultiFileSource, target: EnhanceTarget): string | undefined;
  /**
   * What else it needs before it can be done, if anything.
   *
   * A camera has to follow SOMEBODY, and which actor that is cannot be read
   * off the world it is being added to. The shelf asks, under the row.
   */
  asks?: EnhanceQuestion;
  /**
   * Whether this row is worth showing at all, given what the project holds.
   *
   * THE OTHER END OF A PAIR, which is the only thing that needs it. Some
   * abilities take two actors: a platform `Carries` and its passenger `Rides`,
   * a floor is `Slippery` and a walker `Stands on Surfaces`. Either end can be
   * the one being made, so each gets a row — but the passenger's row is
   * nonsense in a project with nothing that carries, and a shelf that offered
   * it would be offering an ability that does nothing and says nothing about
   * why.
   *
   * Absent means always, which is every row that stands on its own.
   */
  offered?(source: MultiFileSource, target: EnhanceTarget): boolean;
  /** Whether the target already has it, which makes enhancing a no-op. */
  applied(
    source: MultiFileSource,
    target: EnhanceTarget,
    answer?: string,
  ): boolean;
  /** Do it: rules imported, actors placed, blocks appended. */
  apply(
    source: MultiFileSource,
    target: EnhanceTarget,
    answer?: string,
  ): MultiFileSource;
}

/** A question an enhancement asks before it can be applied. */
export interface EnhanceQuestion {
  /** What the row calls it — "Following". */
  label: string;
  /** The choices, read from the project as it stands. */
  options(
    source: MultiFileSource,
    target: EnhanceTarget,
  ): readonly EnhanceChoice[];
}

/** One answer to that question: what it is called, and what it means. */
export interface EnhanceChoice {
  /** What the patch writes — an actor reference, for the camera. */
  value: string;
  /** What the button says. */
  name: string;
}

/**
 * The actor an enhancement is being given to, or the world, named by the
 * module path of its file.
 */
export interface EnhanceTarget {
  /** Which kind of thing this is, and so which enhancements are on offer. */
  kind: 'actor' | 'world';
  /**
   * The module path of the FILE it lives in: `actors/player` for an actor with
   * a file, `worlds/main` for a world or for an actor that world defines.
   */
  path: string;
  /** What it calls itself, for the words on the dialog. */
  name: string;
}

/** One heading of the shelf, and what is under it. */
export interface EnhancementGroup {
  /** What the heading says. */
  name: string;
  members: readonly Enhancement[];
}

/**
 * The shelf, in groups, in the order a game is built up in.
 *
 * ASSIGNED, WHERE THE RULE SHELF'S ARE DERIVED, and the difference is the
 * question being asked. `rules/stockRuleGroups` reads each rule's region off
 * the progression because somebody browsing forty-three rules is asking "what
 * kind of game am I making", and the curriculum already answers that. Nobody
 * reaching this list is asking that: they have an actor and are asking what it
 * can DO. There is no existing answer to read, an enhancement brings several
 * rules and they need not share a region, so these are written down.
 *
 * THE ORDER WAS ALREADY THE GROUPING. The flat list this replaces carried
 * three comments explaining why one run of rows sat next to another — the
 * controls that make an actor a character, the two that say how it sits in a
 * side-on world, the three an enemy is made of. Those comments were headings
 * nobody could see.
 */
export const GROUPS: readonly EnhancementGroup[] = [
  {
    // First, because they are what make an actor a CHARACTER rather than
    // scenery, and everything under them is something a character then does.
    // Named for the actor rather than for the moving, because not everything
    // on a key is a way of moving: shooting is a control too.
    name: 'Being the player',
    members: [
      platformerControlsEnhancement,
      // …and the same rule read the other way, for a game seen from above.
      // Two rows rather than a question under one: which kind of game this is
      // gets answered by picking, not by a sub-question.
      topDownControlsEnhancement,
      // …and a third, which is neither: right TURNS rather than moves. Which
      // of the three a learner wants is answered by what kind of game they are
      // making, so they are three rows rather than one with a question.
      drivesEnhancement,
      climbArrowsEnhancement,
      jetpackEnhancement,
      // …and the one control that is not a way of moving. It was shelved with
      // the enemies for what a shot is FOR, but a key handler is the player's
      // whatever it does; an enemy that shoots at somebody would be a row of
      // its own, asked on a rate rather than a key (specs/ENHANCEMENTS.md).
      shootsEnhancement,
      // …and what happens at the edge of the map, which is a fact about how a
      // thing travels rather than about how it is steered.
      wrapsAcrossEnhancement,
      wrapsDownEnhancement,
    ],
  },
  {
    // One sentence from two ends: a thing that falls needs a thing to land on,
    // and a floor in a game where nothing falls is a picture.
    name: 'Gravity and ground',
    members: [
      fallsEnhancement,
      holdsThingsUpEnhancement,
      // …and the same ability from both ends. Either can be the one being
      // made: a learner building the lift names who rides it, and one building
      // the player in a project that already has a lift takes the other row —
      // which is offered only when there is something to ride.
      carriesEnhancement,
      ridesEnhancement,
      // …and what a floor is LIKE, which is the same two-ended shape again:
      // the floor takes one of the three, and whoever walks on it has to
      // notice. A floor made slippery in a game where nothing stands on
      // surfaces is a floor that behaves exactly as it did.
      slipperyEnhancement,
      conveysEnhancement,
      slowsEnhancement,
      walksOnSurfacesEnhancement,
    ],
  },
  {
    name: 'Health, scoring and speech',
    members: [
      healthEnhancement,
      collectsEnhancement,
      // …and the other half of picking things up: a bag holds what a running
      // total cannot give back.
      carriesThingsEnhancement,
      canBeCarriedEnhancement,
      typesOutTextEnhancement,
    ],
  },
  {
    // After the ones a protagonist wants. A level is built by putting
    // something in it to be, and then something to avoid: the Crawler every
    // platformer starts with is the first two of these applied to one actor
    // (the starter, `constants`).
    name: 'Being an enemy',
    members: [
      patrolsEnhancement,
      dealsDamageEnhancement,
      chasesEnhancement,
      // …and the two that chase differently: one that gives up and goes back
      // to its beat, and one that ignores the ground entirely.
      prowlsEnhancement,
      flapsEnhancement,
    ],
  },
  {
    // Things that arrive and leave. One row so far; the spawner and the
    // teleport pads belong here when they are built.
    name: 'Coming and going',
    members: [
      expiresEnhancement,
      // A way across a room that is not a way through it. The pad first,
      // since the two rows under it are nonsense without one.
      isATeleportPadEnhancement,
      usesTeleportPadsEnhancement,
      takenByAnyPadEnhancement,
      // …and the other way of changing a room, which is the same trick with
      // the room instead of the traveller: matched by colour, nothing to ask.
      isASwitchEnhancement,
      isASwitchedWallEnhancement,
    ],
  },
  {
    // …and last, what the screen says about all of it. Both are the world's.
    name: 'What the screen shows',
    members: [cameraFollowEnhancement, scoreboardEnhancement],
  },
];

export const ENHANCEMENTS: readonly Enhancement[] = GROUPS.flatMap(
  group => group.members,
);

/** One by id, for a caller that knows which it wants. */
export const enhancementById = (id: string): Enhancement | undefined =>
  ENHANCEMENTS.find(one => one.id === id);

/**
 * What a checklist has collected: the rows ticked, in the order they were
 * ticked, and the answers to the questions some of them ask, by row id.
 *
 * Nothing is applied while these are held. `apply` is a pure transform over a
 * source, so a tick and an untick cost nothing but the fold in `enhanceWith`
 * when a button is finally pressed (specs/ENHANCEMENTS.md).
 */
export interface Picks {
  picked: readonly string[];
  answers: Readonly<Record<string, string>>;
}

/**
 * The thing with every picked row given to it.
 *
 * ONE FOLD FOR BOTH SURFACES. The Actor Creator applies this at `Create` and
 * the enhance dialog at `Enhance`, and they must agree on the order (the one
 * the rows were ticked in, which is the only order there is) and on what an
 * unknown id does (nothing). Two copies of a six-line loop would be two
 * chances to disagree about a row that arrives after somebody else's edits.
 */
export const enhanceWith = (
  source: MultiFileSource,
  target: EnhanceTarget,
  {picked, answers}: Picks,
): MultiFileSource => {
  const offered = enhancementsFor(target);
  return picked.reduce((current, id) => {
    const one = offered.find(each => each.id === id);
    return one ? one.apply(current, target, answers[id]) : current;
  }, source);
};

/** The ones on offer for a thing of this kind. */
export const enhancementsFor = (
  target: EnhanceTarget,
): readonly Enhancement[] =>
  ENHANCEMENTS.filter(one => one.subject === target.kind);

/**
 * …and the same in groups, with the empty headings left out.
 *
 * A world's shelf holds two rows and an actor's holds ten, so a heading with
 * nothing under it is what filtering by subject would otherwise leave behind.
 */
export const groupsFor = (target: EnhanceTarget): readonly EnhancementGroup[] =>
  GROUPS.map(group => ({
    ...group,
    members: group.members.filter(one => one.subject === target.kind),
  })).filter(group => group.members.length > 0);

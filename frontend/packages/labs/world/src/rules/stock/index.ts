// The stock rule library — rules a learner can import into a project.
//
// The counterpart to the stock EFFECT library, and it exists for the same
// reason: a rule is a lot to write from nothing, and the first useful thing a
// learner does with one is read it. Importing copies the workspace into
// `rules/<id>.rule`, where it is theirs — openable, editable, and no longer
// connected to anything here.
//
// It is also how gravity now reaches a project. There is no built-in gravity
// rule any more (see `builtinMeta`): "Has Gravity" is one of these, and the
// default project is a project that imported it.

import {arrowsRule} from './arrows';
import {attachmentRule} from './attachment';
import {boundsRule} from './bounds';
import {cameraRule} from './camera';
import {cameraConfinedRule} from './cameraConfined';
import {cameraDeadzoneRule} from './cameraDeadzone';
import {cameraEaseRule} from './cameraEase';
import {cameraFollowRule} from './cameraFollow';
import {carryRule} from './carry';
import {climbRule} from './climb';
import {collectRule} from './collect';
import {collisionsRule} from './collisions';
import {conversationRule} from './conversation';
import {diggingRule} from './digging';
import {dragRule} from './drag';
import {driveRule} from './drive';
import {expiresRule} from './expires';
import {flappingRule} from './flapping';
import {goalsRule} from './goals';
import {gravityRule} from './gravity';
import {gridRule} from './grid';
import {healthRule} from './health';
import {historyRule} from './history';
import {inputRule} from './input';
import {inventoryRule} from './inventory';
import {jetpackRule} from './jetpack';
import {jumpRule} from './jump';
import {motionRule} from './motion';
import {mouseRule} from './mouse';
import {pathRule} from './path';
import {patrolRule} from './patrol';
import {progressRule} from './progress';
import {prowlingRule} from './prowling';
import {scoreRule} from './score';
import {solidRule} from './solid';
import {spawnerRule} from './spawner';
import {steeringRule} from './steering';
import {surfacesRule} from './surfaces';
import {switchesRule} from './switches';
import {teleportRule} from './teleport';
import {timeRule} from './time';
import {turningRule} from './turning';
import {turnsRule} from './turns';
import {wrapRule} from './wrap';
import {writingRule} from './writing';
import {zapsRule} from './zaps';

/** One entry in the library. */
export interface StockRule {
  /**
   * File stem this is imported as — `gravity` becomes `rules/gravity.rule`.
   *
   * Only a file name. References are built from the rule's NAME, so where the
   * copy lands and what it is called on disk are the learner's business.
   */
  id: string;
  /**
   * What the rule is, matching its `define rule` NAME — "Gravity".
   *
   * The name every reference to its members is built from
   * (`Gravity#AffectedByGravityTrait`), so two rules answering to one name is
   * an ambiguity, which is why importing the same stock rule twice is a no-op.
   */
  name: string;
  /** What using it gives a world, matching ABILITY — "Has Gravity". */
  ability: string;
  /** One line on what the rule does, for the import dialog. */
  description: string;
  /** What it gives an actor, in the dialog: the traits it provides. */
  provides: readonly string[];
  // NO `foundational` FLAG. There was one, and it marked the rules a project
  // ran by merely holding — the keyboard, because noticing a keypress is not a
  // mechanic anybody opts into. That is every rule now (blockly/projectModules),
  // so the flag marked nothing and the distinction it drew has no other half.
  /**
   * Whose traits these are, when they are not an actor's.
   *
   * A camera rule's traits go on a CAMERA — `add trait ⟨…⟩ to camera ⟨…⟩` —
   * and importing the rule does nothing on its own. Said here because the
   * shelf is read by the import dialog and by the AI tutor, and a reader told
   * only the trait names assumes an actor. Checked against what the rule
   * actually declares (`stockRuleSubjects.test.ts`), so it cannot drift.
   */
  subject?: 'camera';
  /** The `.rule` workspace JSON, copied verbatim on import. */
  contents: string;
}

/**
 * The library: the mechanics that used to be engine code, in the order a project
 * is likely to want them.
 */
export const STOCK_RULES: readonly StockRule[] = [
  {
    id: 'motion',
    name: 'Physics',
    ability: 'Has Physics',
    description:
      'Gives actors a speed, moves them by it every frame, and lets a force change it.',
    provides: ['Can Move'],
    contents: motionRule,
  },
  {
    id: 'collisions',
    name: 'Collisions',
    ability: 'Notices Collisions',
    description:
      'Works out which actors are touching which, once a tick, and writes each one down. Says nothing about what to do about it.',
    provides: ['Can Collide'],
    contents: collisionsRule,
  },
  {
    id: 'solid',
    name: 'Solid Bodies',
    ability: 'Has Solid Bodies',
    description:
      'Stops moving actors passing through solid ones, pushing them out at the face they entered.',
    provides: ['Solid'],
    contents: solidRule,
  },
  {
    id: 'collect',
    name: 'Collection',
    ability: 'Collects Things',
    description:
      'Lets an actor pick up the things it walks into, and says which kinds can be picked up. It keeps what each collector has taken, so a game can ask how many of a kind somebody holds, and raises an event on both sides of the moment.',
    provides: ['Collects', 'Can Be Collected'],
    contents: collectRule,
  },
  {
    id: 'inventory',
    name: 'Inventory',
    ability: 'Holds Things',
    description:
      'A bag: what an actor is holding, and the way to spend one of a kind. Collection keeps a record of everything picked up, which only grows; this is the half that can go down, for a key that is gone once the door is open.',
    provides: ['Carries', 'Can Be Carried'],
    contents: inventoryRule,
  },
  {
    id: 'health',
    name: 'Health',
    ability: 'Has Health',
    description:
      'Lets actors be damaged and run out. One ability says what can be damaged and the other says what damages it, so a spike, an energy ball and a patrolling crawler are dangerous without knowing who to. Contact damage is spaced by a mercy time, and running out raises an event rather than removing anything — what running out means is the game\u2019s to say.',
    provides: ['Has Health', 'Deals Damage'],
    contents: healthRule,
  },
  {
    id: 'steering',
    name: 'Steering',
    ability: 'Chases and Flees',
    description:
      'Lets an actor go after another one, or run from it. A chaser walks toward what it is told to chase and stops when it is close enough; a fleer runs only when the thing it avoids is too near. It sets velocity, so walls still stop it and gravity still owns the vertical when you say so \u2014 and it brings the \u201cdistance from \u2039a\u203a to \u2039b\u203a\u201d block, which is what \u201cthe nearest enemy\u201d is asked with.',
    provides: ['Chases', 'Flees'],
    contents: steeringRule,
  },
  {
    id: 'path',
    name: 'Path',
    ability: 'Finds a Way',
    description:
      'Works out the next step toward something, around whatever solid is in between \u2014 which is what Steering cannot do: going toward a thing walks into the wall in front of it. It floods outward from the goal a square at a time and hands back the square to walk to, on a beat rather than every frame. What a square IS is a setting, so a tiled room and a room of scattered crates search the same way.',
    provides: ['Finds a Way'],
    contents: pathRule,
  },
  {
    id: 'patrol',
    name: 'Patrol',
    ability: 'Patrols',
    description:
      'Walks an actor out and back on a beat of its own, across or down or both. What an enemy does when the player is not there, and what a moving platform does always.',
    provides: ['Patrols Across', 'Patrols Down'],
    contents: patrolRule,
  },
  {
    id: 'carry',
    name: 'Carrying',
    ability: 'Carries Riders',
    description:
      'Moves whatever is standing on an actor along with it, however that actor is being moved \u2014 a lift, a raft, a platform on a track. Two abilities: what carries, and what rides.',
    provides: ['Carries', 'Rides'],
    contents: carryRule,
  },
  {
    id: 'attachment',
    name: 'Attachment',
    ability: 'Rides on an Actor',
    description:
      'Keeps one actor on another, at an offset it carries. A health bar over an enemy, a name over a player, a shield around a ship — anything that should move as one thing with something else.',
    provides: ['Attached'],
    contents: attachmentRule,
  },
  {
    id: 'time',
    name: 'Time',
    ability: 'Keeps Time',
    description:
      'Lets things happen every so often, and lets things be done only every so often. A timer belongs to an actor and raises an event on its own beat \u2014 a spawner, a blinking lamp, a bomb \u2014 and each one starts, stops and restarts on its own. A cooldown is the same idea with the sides swapped: ask whether it is ready, and start the wait when it is used.',
    provides: ['Has a Timer', 'Has a Cooldown'],
    contents: timeRule,
  },
  {
    id: 'spawner',
    name: 'Spawner',
    ability: 'Sends Things',
    description:
      'Sends something on a beat that closes as the game goes on \u2014 which is what makes a wave a wave rather than a metronome. It says WHEN and how many, and never what: the handler for "sends something" places whatever the wave is made of. Set how many to send to stop after a number of them, and closer each time to under one to make each gap shorter than the last.',
    provides: ['Sends Things'],
    contents: spawnerRule,
  },
  {
    id: 'writing',
    name: 'Writing',
    ability: 'Shows Text',
    description:
      'Gives an actor words, a size, a color and an anchor — the state a drawn word is drawn from. It runs nothing: what an actor does with its words is its own “define drawing”, which is why the stock Label and Button are ordinary actors.',
    provides: ['Shows Text'],
    contents: writingRule,
  },
  {
    id: 'conversation',
    name: 'Conversation',
    ability: 'Has a Conversation',
    description:
      'Keeps a place in a script and moves through it. It raises an event each time it moves, so the project decides what each line is — a portrait, a sound, a question — and `go to line` is how a choice sends the talk somewhere else.',
    provides: ['Has a Conversation'],
    contents: conversationRule,
  },
  {
    id: 'progress',
    name: 'Progress',
    ability: 'Shows Progress',
    description:
      'A fraction between 0 and 1 that an actor carries, and the two colors a bar of it is drawn in. Writing\u2019s sibling: it holds the number and paints none of it, and the stock Progress Bar is what draws one.',
    provides: ['Shows Progress'],
    contents: progressRule,
  },
  {
    id: 'score',
    name: 'Scoring',
    ability: 'Keeps Score',
    description:
      'A score the whole world shares, and an event the moment it reaches the target. Says when the game is won; what winning looks like is the project\u2019s to write.',
    provides: ['Watches the Score'],
    contents: scoreRule,
  },
  {
    id: 'goals',
    name: 'Goals',
    ability: 'Has an Ending',
    description:
      'Won, lost, and the way back to neither \u2014 the two moments every game has, in one place that guards them. The first ending is the one that counts; what winning LOOKS like is still the project\u2019s.',
    provides: ['Watches the Ending'],
    contents: goalsRule,
  },
  {
    id: 'input',
    name: 'Input',
    ability: 'Reads the Keyboard',
    description:
      'Raises an event when a key goes down or comes up, so a handler can react to a press rather than to it being held. The world hears every key; an actor hears the ones it elected to.',
    provides: ['Takes Keyboard Input'],
    contents: inputRule,
  },
  {
    id: 'mouse',
    name: 'Mouse',
    ability: 'Reads the Mouse',
    description:
      'Raises an event when a mouse button goes down or comes up, on the same terms as the keyboard rule, and tells an actor when a press landed on it. Where the pointer is is not an event — it is the “mouse position” block, which answers at any moment.',
    provides: ['Takes Mouse Input', 'Can Be Clicked'],
    contents: mouseRule,
  },
  {
    id: 'arrows',
    name: 'Arrow Keys',
    ability: 'Moves with Arrow Keys',
    description:
      'Moves an actor while the arrow keys are held, at a speed the actor carries. Across and down are separate abilities: a platformer takes one, a top-down game takes both.',
    provides: ['Moves Across', 'Moves Down'],
    contents: arrowsRule,
  },
  {
    id: 'grid',
    name: 'Grid',
    ability: 'Moves on a Grid',
    description:
      'Moves an actor one whole square at a time instead of by a speed, refusing a step it cannot finish. Walls block a step and crates are pushed by one, which is the whole of a board game.',
    provides: ['Steps on the Grid', 'Fills a Tile', 'Can Be Pushed'],
    contents: gridRule,
  },
  {
    id: 'history',
    name: 'History',
    ability: 'Undoes Moves',
    description:
      'Writes down where everything is when the project says a move is happening, and puts it all back when the project says to undo one. Eight moves deep, and it remembers places rather than everything.',
    provides: ['Remembers Where It Was'],
    contents: historyRule,
  },
  {
    id: 'turns',
    name: 'Turns',
    ability: 'Takes Turns',
    description:
      'A clock only the player can wind: the project says when a turn has happened, and everything that takes turns is told to act. A number on each actor says how often \u2014 every turn, every other one, never.',
    provides: ['Takes a Turn'],
    contents: turnsRule,
  },
  {
    id: 'gravity',
    name: 'Gravity',
    ability: 'Has Gravity',
    description:
      'Pulls actors downward, lands them on solid ground, and tells them when they start and stop falling. Landing is about DIRECTION \u2014 a faller has to be coming down onto a thing to rest on it \u2014 so a ledge that only acts as ground is one you jump up through, and a ledge that is also Solid is one you cannot.',
    provides: ['Affected by Gravity', 'Acts as Ground'],
    contents: gravityRule,
  },
  {
    id: 'jump',
    name: 'Jumping',
    ability: 'Jumps',
    description:
      'Pushes an actor away from the ground when it asks, and only when it has a jump left. Carries a jump height, a moment of grace after walking off a ledge, and a count for double jumps.',
    provides: ['Jumps'],
    contents: jumpRule,
  },
  {
    id: 'jetpack',
    name: 'Jetpack',
    ability: 'Flies with a Jetpack',
    description:
      'Thrust for as long as a key is held, against gravity, out of a tank that empties. Carries the push, a top climbing speed, the fuel and how fast it burns — and says when the flying starts, stops, or runs dry.',
    provides: ['Flies with a Jetpack'],
    contents: jetpackRule,
  },
  {
    id: 'climb',
    name: 'Climbing',
    ability: 'Climbs Ladders',
    description:
      'A ladder to go up, and — the part a one-way platform cannot do on its own — to go back down through. Says what a ladder is, what climbs one, and offers a control scheme for the arrow keys that a climber need not take.',
    provides: ['Can Be Climbed', 'Climbs'],
    contents: climbRule,
  },
  {
    id: 'surfaces',
    name: 'Surfaces',
    ability: 'Has Special Floors',
    description:
      'Three kinds of floor that do something to whoever stands on them: a belt that carries you along, ice you cannot stop or turn on, and sludge that drags. A tile takes one; a walker takes one trait and meets all three.',
    provides: ['Conveys', 'Slippery', 'Slows', 'Stands on Surfaces'],
    contents: surfacesRule,
  },
  {
    id: 'turning',
    name: 'Turning',
    ability: 'Turns at Walls',
    description:
      'Goes the way it is facing and turns when it stops getting anywhere. One number decides what kind of enemy it is: a hundred and eighty is a ball rolling back and forth, ninety is a rocket taking the next turning.',
    provides: ['Turns When It Hits Something'],
    contents: turningRule,
  },
  {
    id: 'prowling',
    name: 'Prowling',
    ability: 'Prowls',
    description:
      'An enemy that goes the way it is going and reconsiders only where reconsidering is possible — when it lands, when it reaches a ladder, when a climb ends. It takes ladders using the same trait a player does.',
    provides: ['Prowls'],
    contents: prowlingRule,
  },
  {
    id: 'flapping',
    name: 'Flapping',
    ability: 'Flaps and Glides',
    description:
      'An enemy that flies in two phases: a few short flutters, each upward and a little towards you, and then a long straight glide aimed at where you were when it began. The glide commits, so walking under it is the way past.',
    provides: ['Flaps and Glides'],
    contents: flappingRule,
  },
  {
    id: 'teleport',
    name: 'Teleport',
    ability: 'Has Teleport Pads',
    description:
      'Pads that are two ends of one place. Step on one and come out of another of the same color, chosen afresh each time — a player when it asks to, an enemy whether it wants to or not.',
    provides: ['Is a Teleport Pad', 'Uses Teleport Pads'],
    contents: teleportRule,
  },
  {
    id: 'switches',
    name: 'Switches',
    ability: 'Has Switches',
    description:
      'Pads on the floor that flip every wall painted the same color — each wall from wherever it was, so a switch swaps a corridor rather than opening one. Anything that moves can press one.',
    provides: ['Is a Switch', 'Is a Switched Wall'],
    contents: switchesRule,
  },
  {
    id: 'digging',
    name: 'Digging',
    ability: 'Digs Holes',
    description:
      'A hole you make in the ground where you point, and one that fills itself back in on whoever is standing in it. The block owns how long it lasts, so two kinds of floor can close at two speeds.',
    provides: ['Can Be Dug', 'Digs'],
    contents: diggingRule,
  },
  {
    id: 'drive',
    name: 'Arrow Drive',
    ability: 'Drives with Arrow Keys',
    description:
      'Left and right TURN an actor, up thrusts the way it faces, and letting go leaves it coasting. The other reading of the arrow keys — elect this or "Moves with Arrow Keys", not both.',
    provides: ['Driven by Arrow Keys'],
    contents: driveRule,
  },
  {
    id: 'drag',
    name: 'Drag',
    ability: 'Slows Down',
    description:
      'Bleeds off an actor\u2019s speed while nothing is pushing it, so it coasts to a stop instead of drifting forever. Elect it beside anything that moves \u2014 it is what makes a car a car rather than a spaceship, and it gives a top speed for free.',
    provides: ['Slows Down'],
    contents: dragRule,
  },
  {
    id: 'zaps',
    name: 'Zapping',
    ability: 'Zaps',
    description:
      'Limits how often an actor may zap and raises "zaps" when one happens \u2014 your handler decides what a zap SENDS, so it can be an energy ball or anything else. Pair "make \u2026 zap" on a key press with a "zaps" handler.',
    provides: ['Zaps'],
    contents: zapsRule,
  },
  {
    id: 'expires',
    name: 'Expiry',
    ability: 'Expires',
    description:
      'Takes an actor out of the world once it is older than its lifetime \u2014 the other half of spawning. Without it, bullets and sparks pile up forever and the game slowly grinds down.',
    provides: ['Expires'],
    contents: expiresRule,
  },
  {
    id: 'bounds',
    name: 'Boundaries',
    ability: 'Stays in the Map',
    description:
      'Stops an actor at the edge of the map instead of letting it leave \u2014 the whole actor, not its middle. Two abilities, so a paddle can stay across without hovering, and a platformer can stay down without sticking to the sides.',
    provides: ['Stays Across', 'Stays Down'],
    contents: boundsRule,
  },
  {
    id: 'wrap',
    name: 'Screen Wrap',
    ability: 'Wraps at the Edges',
    description:
      'Brings an actor back on the opposite side of the map when it walks off an edge. Two abilities, so you can wrap across, down, or both.',
    provides: ['Wraps Across', 'Wraps Down'],
    contents: wrapRule,
  },
  {
    id: 'camera',
    name: 'Camera',
    ability: 'Has a Camera',
    description:
      'Gives a camera somewhere it wants to look, and moves it there at the end of each frame. On its own it holds the view still; other camera rules decide where to look.',
    provides: ['Aimed'],
    subject: 'camera',
    contents: cameraRule,
  },
  {
    id: 'cameraFollow',
    name: 'Camera Follow',
    ability: 'Follows an Actor',
    description:
      'Points a camera at an actor, so the view keeps up as it moves. Needs Camera, which is what actually moves the view.',
    provides: ['Follows'],
    subject: 'camera',
    contents: cameraFollowRule,
  },
  {
    id: 'cameraEase',
    name: 'Camera Ease',
    ability: 'Catches Up Smoothly',
    description:
      'Lets a camera catch up to what it is aiming at over a few frames instead of snapping to it. Needs Camera.',
    provides: ['Eases'],
    subject: 'camera',
    contents: cameraEaseRule,
  },
  {
    id: 'cameraDeadzone',
    name: 'Camera Deadzone',
    ability: 'Ignores Small Moves',
    description:
      'Holds a camera still while what it follows moves about inside a box, so the view only travels when the player really goes somewhere. Needs Camera.',
    provides: ['Has a Deadzone'],
    subject: 'camera',
    contents: cameraDeadzoneRule,
  },
  {
    id: 'cameraConfined',
    name: 'Camera Confined',
    ability: 'Keeps the View Inside',
    description:
      'Stops a camera at the edge of the map, so the view never shows past the level. Needs Camera.',
    provides: ['Confined to the Map'],
    subject: 'camera',
    contents: cameraConfinedRule,
  },
];

/** Look one up by its file stem. */
export function stockRule(id: string): StockRule | undefined {
  return STOCK_RULES.find(rule => rule.id === id);
}

/** Look one up by the name its `define rule` block carries — what a `use rule`
 *  in another stock rule refers to it as. */
export function stockRuleByName(name: string): StockRule | undefined {
  return STOCK_RULES.find(rule => rule.name === name);
}

export {
  arrowsRule,
  climbRule,
  surfacesRule,
  turningRule,
  diggingRule,
  switchesRule,
  teleportRule,
  flappingRule,
  prowlingRule,
  mouseRule,
  writingRule,
  boundsRule,
  collectRule,
  healthRule,
  pathRule,
  steeringRule,
  timeRule,
  spawnerRule,
  dragRule,
  driveRule,
  expiresRule,
  zapsRule,
  solidRule,
  wrapRule,
  collisionsRule,
  gravityRule,
  inputRule,
  motionRule,
  cameraRule,
  cameraFollowRule,
  cameraEaseRule,
  cameraConfinedRule,
  cameraDeadzoneRule,
  jumpRule,
  jetpackRule,
  scoreRule,
  patrolRule,
  carryRule,
  goalsRule,
  historyRule,
  turnsRule,
  gridRule,
  conversationRule,
  inventoryRule,
  attachmentRule,
  progressRule,
};

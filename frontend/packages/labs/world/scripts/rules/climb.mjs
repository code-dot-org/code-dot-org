import {position, setPosition} from './builtins.mjs';
import {collisionSizeOf, contacts} from './collisions.mjs';
import {
  add,
  axisOf,
  both,
  countOf,
  defineRule,
  extremeActor,
  filter,
  frameTime,
  give,
  hasTrait,
  keyDown,
  lessThan,
  minus,
  moduleFor,
  moreThan,
  n,
  no,
  not,
  note,
  over,
  param,
  pick,
  pixelsPerUnit,
  thisActor,
  times,
  vector,
  when,
  yes,
} from './dsl.mjs';
import {AffectedByGravity, ignoresGround} from './gravity.mjs';
import {positionBefore, velocity} from './motion.mjs';

const rule = defineRule({
  name: 'Climbing',
  ability: 'Climbs Ladders',
  header: `// "Climbs Ladders" — the other way up, and the only way DOWN.
//
// A ladder is a one-way platform you can also travel through, which is two
// facts that fight. \`Acts as Ground\` alone already gives the first half for
// nothing: landing asks which way you were going, so a ledge you rise through
// and stand on top of is what a bare ground tile IS (see \`rules/gravity\`).
// The second half — standing on top of a ladder and going DOWN — is the one
// that has no answer from outside, because landing re-lands you every frame
// you rest on a surface.
//
// So this throws Gravity's \`ignores ground\` for as long as the climb lasts.
// Worth being exact about what that buys, because it is not what it looks
// like: the climb below also parks the vertical speed at zero, and gravity's
// landing test asks where you were "a moment ago at the speed you are going",
// which at zero speed is where you are NOW — already below the surface. So the
// descent would in fact work without the switch, by accident, through an
// interaction between two rules that neither states.
//
// Which is the reason to throw it anyway. A mechanic that works because
// another rule's arithmetic happens to miss is a mechanic that breaks the day
// that arithmetic is written differently, and nothing would say why. \`ignores
// ground\` says the thing out loud, and it exists on its own account: "hold
// down to drop through the platform" is one handler with it — a fall at
// ordinary speed, where nothing about the landing test misses — and
// unwritable without it.
//
// IT MOVES THE POSITION, not the velocity, and it does it in \`adjust\` — the
// moment after everything has moved. Setting a velocity would mean racing
// gravity's own \`push\`, which is the same moment, and the loser of that race
// leaks a frame of falling into every frame of climbing: a climb that sags.
// Placed here it reads where the actor WAS at the top of this frame
// (\`position before\`, which Physics keeps for exactly this kind of question),
// and puts it where a climb of that length would have. Whatever gravity did to
// y this frame is simply not consulted.
//
// SWITCHED, NOT PUMPED, as the Jetpack is and for the reason it gives: the
// keyboard hands a project \`presses\` and \`releases\`, which are moments, and
// the frames between them belong to the rule.
//
//     when ⟨player⟩ presses ⟨up arrow⟩    →   start ⟨player⟩ climbing up
//     when ⟨player⟩ releases ⟨up arrow⟩   →   stop ⟨player⟩ climbing
//
// …and "Climbs with Arrow Keys" is those four handlers, written once. It is a
// SECOND trait rather than part of the first because a climber need not have a
// keyboard: a robot that takes ladders when the player is above it elects
// "Climbs" and decides for itself, and a rule that read the keys would have
// shut that out. The same split Physics and Arrow Keys already make.
//
// STARTING IS REFUSED OFF A LADDER, so the up arrow is not a flight key. The
// climb also ends by itself the moment the ladder does, which is what stepping
// off the top is — there is no separate way to leave one.
//
// AND IT ENDS ON TOP OF THE LADDER RATHER THAN ABOVE IT, which is not tidiness.
// Left to overshoot, a climber holding up at the top left the ladder, fell back
// on to the top rung, was on a ladder again, climbed, left, fell — an endless
// hop, one per frame the key was held, with \`starts falling\` and \`stops
// falling\` narrating every one of them. So the frame that finds the ladder gone
// puts the climber back down on the rung it last had hold of, at the height it
// would rest there. Gravity then finds it already standing: nothing falls,
// nothing lands, and holding up does nothing, because the top of a ladder is
// not a ladder.
//
// IT WRITES DOWN THE SPEED IT CLIMBED AT, which looks redundant beside a
// position it has already set and is the opposite. \`position before\` — which
// Physics offers and half the library asks — is this frame's position less
// this frame's VELOCITY: an extrapolation, not a history. So a climb that
// parked the speed at zero told every other rule that the climber had always
// been exactly where it is.
//
// Solid is the rule that minded. It decides which face a body came in through
// by asking whether it already overlapped on the other axis before it moved,
// and against a body that "has always been here" the answer is yes on both —
// so a climber a few pixels inside a floor was judged to have arrived from the
// SIDE and pushed a whole tile sideways, every frame, until it left the map.
// Writing the true speed makes the answer true, Solid takes the up-and-down
// pass, and the climb stops at the floor the way anything else would.`,
});
rule.uses('Gravity');
rule.uses('Physics');
rule.uses('Input');

/**
 * What a ladder is.
 *
 * Carries nothing, which is the point: a ladder has no speed of its own and no
 * opinion about who climbs it. Elect this beside `Acts as Ground` for a ladder
 * you can stand on top of, and alone for one you cannot.
 */
const climbable = rule.trait('Can Be Climbed');
climbable.uses('Collisions#CanCollideTrait');
export const CanBeClimbed = rule.traitRef('Can Be Climbed');

const climbs = rule.trait('Climbs');
climbs.uses(AffectedByGravity);

// Units a second — a hundred pixels each, so 2 is a little over six tiles a
// second. Deliberately slower than walking: a ladder is a place you are
// committed for a moment, which is what makes one a decision.
const speed = climbs.number('climb speed', 2);
// Whether this actor is on a ladder and going somewhere on it. Read-only: the
// three blocks below are the only way to change it, which is what keeps
// `starts climbing` and `stops climbing` honest.
export const climbing = climbs.boolean('climbing', 'false', {readonly: true});
// …and which way.
//
// Exported, and it KEEPS its value after a climb ends, which is the whole of
// why: `Prowling` asks which way the climb that just failed was going, so that
// a junction reached by a climb getting nowhere does not choose that same
// direction again. Meaningless before the first climb, and the rules that read
// it only do so having seen one end.
export const goingUp = climbs.boolean('climbing up', 'false', {
  readonly: true,
});
// Whether a climb pulls the climber on to the middle of the ladder.
//
// On by default, and the default is the argument: a ladder in a gap one tile
// wide is a thing you have to be lined up with, and lining yourself up while
// falling is not a skill a level should be testing. With this the climb is a
// commitment — the ladder holds your x for as long as you are on it, and
// letting go of the key is how you leave.
//
// A setting rather than a fact, because a wide ladder (a rope net, a shaft you
// can move about inside) is a real thing to want, and it is this switched off.
const centers = climbs.boolean('centers on the ladder', 'true');
// The highest rung this climb has had hold of, so that leaving the top has
// somewhere to put the climber down. Read-only bookkeeping: a project setting
// it would be telling the rule a lie about which ladder it is on.
const topRung = climbs.actor('top rung', {readonly: true});
/**
 * Where the climber was when this frame's climb began, and whether it is
 * filled in.
 *
 * The same pair `Turning` keeps and for the same reason: a climb that asked to
 * travel and did not has run into something, and there is no way to notice
 * that except by asking afterwards. The flag is needed because a climb can
 * START in `touch` — a key handler's moment — which is after the step that
 * would have recorded a position, so the first frame of a climb has nothing to
 * compare against and must not be judged.
 */
const climbedFrom = climbs.number('climbing from', 0, {readonly: true});
const climbMeasured = climbs.boolean('climb measured', 'false', {
  readonly: true,
});

export const Climbs = rule.traitRef('Climbs');

const startedClimbing = climbs.event(['starts climbing']);
const stoppedClimbing = climbs.event(['stops climbing']);

const rung = rule.local('rung', 'Actor');

/** The rungs this actor is touching — the ladder, as far as it is concerned. */
const ladderUnder = () =>
  filter(rung, {
    from: contacts.of(thisActor()),
    where: hasTrait(rung.get(), CanBeClimbed),
  });

/** Half a box on the axis a climb travels. */
const halfOf = who =>
  over(axisOf('y', collisionSizeOf({sizeActor: who})), n(2));

/**
 * Whether this actor is touching a ladder right now.
 *
 * Read off the contact set Collisions worked out, which was worked out in
 * `touch` — one moment after `decide`, where a key handler runs. So the answer
 * a press gets is a frame old, and a press made in the frame the actor arrives
 * at a ladder is refused. A sixtieth of a second, against a mechanic where the
 * ladder is somewhere you are standing.
 */
export const onLadder = climbs.block({
  returns: 'boolean',
  description:
    'Whether this actor is touching a ladder — something that elects "Can Be Climbed".',
  say: ['is on a ladder?'],
  body: () => [
    note('`how many ACTORS` rather than `how many in`: a list of actors is'),
    note('its own type here, and the general list block cannot read one.'),
    give(moreThan(countOf(ladderUnder()), n(0))),
  ],
});

/** Everything both directions do, so the two faces cannot drift apart. */
const begin = who => [
  note('Only on a ladder, so the up arrow is not a flight key.'),
  when([
    [
      onLadder({}, who),
      [
        note('Gravity stops holding this actor up — see the header. Without'),
        note('this, climbing DOWN off the top of a ladder is re-landed every'),
        note('frame and goes nowhere.'),
        ignoresGround.set(who, yes()),
        when([
          [
            not(climbing.of(who)),
            [climbing.set(who, yes()), startedClimbing({}, who)],
          ],
        ]),
      ],
    ],
  ]),
];

export const climbUp = rule.block({
  returns: 'none',
  description:
    'Start this actor climbing up, if it is on a ladder. Does nothing if it is not.',
  say: ['start', param('who', 'actor'), 'climbing up'],
  body: ({who}) => [goingUp.set(who.get(), yes()), ...begin(who.get())],
});

export const climbDown = rule.block({
  returns: 'none',
  description:
    'Start this actor climbing down, if it is on a ladder. Does nothing if it is not.',
  say: ['start', param('who', 'actor'), 'climbing down'],
  body: ({who}) => [goingUp.set(who.get(), no()), ...begin(who.get())],
});

/** The one way off a ladder, however the climb ended. */
const end = who => [
  when([
    [
      climbing.of(who),
      [
        climbing.set(who, no()),
        climbMeasured.set(who, no()),
        note('Gravity holds this actor up again — a climber that kept this'),
        note('would walk off the next ledge and through the floor under it.'),
        ignoresGround.set(who, no()),
        note('…and at rest, so letting go of a ladder drops this actor from'),
        note('a standstill rather than carrying the climb on as a fall — or,'),
        note('going up, flicking it off the top like a hop.'),
        velocity.set(who, vector(axisOf('x', velocity.of(who)), n(0))),
        stoppedClimbing({}, who),
      ],
    ],
  ]),
];

export const stopClimbing = rule.block({
  returns: 'none',
  description:
    'Stop this actor climbing. Gravity takes over from wherever it had got to.',
  say: ['stop', param('who', 'actor'), 'climbing'],
  body: ({who}) => end(who.get()),
});

climbs.step('climb', 'adjust', [
  when([
    [
      climbing.of(thisActor()),
      [
        note('The ladder running out is what stepping off the top IS, so'),
        note('there is no separate block for it.'),
        when(
          [
            [
              not(onLadder({}, thisActor())),
              [
                note('The ladder has run out. Going UP that means the top,'),
                note('and the climber is put down on the rung it last held'),
                note('rather than left in the air above it — see the header'),
                note('on the hop that came of leaving it there. Going DOWN'),
                note('it means the bottom, and falling off the bottom of a'),
                note('ladder is just falling.'),
                when([
                  [
                    goingUp.of(thisActor()),
                    [
                      note('A QUARTER PIXEL below the top, not exactly on'),
                      note('it. Contacts are worked out from boxes that'),
                      note('overlap, and boxes that merely share an edge do'),
                      note('not — so a climber put down exactly on the'),
                      note('surface is touching nothing, and there is'),
                      note('nothing for Gravity to land it on.'),
                      setPosition(
                        thisActor(),
                        position.x(thisActor()),
                        add(
                          minus(
                            minus(
                              position.y(topRung.of(thisActor())),
                              halfOf(topRung.of(thisActor())),
                            ),
                            halfOf(thisActor()),
                          ),
                          n(0.25),
                        ),
                      ),
                    ],
                  ],
                ]),
                ...end(thisActor()),
                note('…and a whisper of downward speed, which is the other'),
                note('half of the same problem. Gravity lands a body by'),
                note('asking whether it CROSSED a surface this frame, and'),
                note('crossing is a question about where it WAS — which at'),
                note('a dead stop is where it is. So the two together: a'),
                note('quarter pixel below, moving slowly down, which reads'),
                note('as a crossing and lands. The landing snaps it back to'),
                note('the surface, so nothing on screen moves and neither'),
                note('event is raised.'),
                when([
                  [
                    goingUp.of(thisActor()),
                    [
                      velocity.set(
                        thisActor(),
                        vector(axisOf('x', velocity.of(thisActor())), n(0.5)),
                      ),
                    ],
                  ],
                ]),
              ],
            ],
          ],
          [
            note('Which rung is highest, kept for the frame the ladder runs'),
            note('out — by then the contact set no longer has it.'),
            topRung.set(
              thisActor(),
              extremeActor(rung, {
                from: ladderUnder(),
                end: 'least',
                key: position.y(rung.get()),
              }),
            ),
            note('Where it is starting from, for the end of the frame to'),
            note('subtract — see `climbing from`. A climb that asked to'),
            note('travel and did not has run into something.'),
            note('THE TOP OF THE FRAME, which is the same place the climb'),
            note('below starts from, and not where the actor is standing at'),
            note('this instant: `move` has already run, so the position here'),
            note('has this frame’s travel in it and subtracting it from the'),
            note('answer would measure nothing at all.'),
            climbedFrom.set(
              thisActor(),
              axisOf(
                'y',
                positionBefore({subject: thisActor(), seconds: frameTime()}),
              ),
            ),
            climbMeasured.set(thisActor(), yes()),
            note('Where this actor was at the top of the frame, plus a'),
            note('frame of climbing. Whatever gravity did to y since then is'),
            note('not consulted — see the header. Up is negative y, and the'),
            note('speed is units a second against a position in pixels, so'),
            note('this is the one place the two meet.'),
            note('On to the middle of the ladder, unless the project says'),
            note('otherwise — see `centers on the ladder`.'),
            setPosition(
              thisActor(),
              pick(
                centers.of(thisActor()),
                position.x(topRung.of(thisActor())),
                position.x(thisActor()),
              ),
              add(
                axisOf(
                  'y',
                  positionBefore({subject: thisActor(), seconds: frameTime()}),
                ),
                times(
                  times(
                    times(speed.of(thisActor()), pixelsPerUnit()),
                    frameTime(),
                  ),
                  pick(goingUp.of(thisActor()), n(-1), n(1)),
                ),
              ),
            ),
            note('…and the speed it just moved at, which is not a detail.'),
            note('Every rule that asks where a body WAS asks `position'),
            note('before`, and that is this frame’s position less this'),
            note('frame’s velocity — an extrapolation, not a history. Parking'),
            note('the speed at zero therefore tells the whole world that this'),
            note('actor has always been exactly where it is: Solid concluded'),
            note('a climber inside a floor had arrived from the SIDE and'),
            note('pushed it a tile sideways every frame until it left the'),
            note('map. So the number written here is the truth.'),
            velocity.set(
              thisActor(),
              vector(
                axisOf('x', velocity.of(thisActor())),
                times(
                  speed.of(thisActor()),
                  pick(goingUp.of(thisActor()), n(-1), n(1)),
                ),
              ),
            ),
          ],
        ),
      ],
    ],
  ]),
]);

const got = rule.local('got', 'Number');
const asked = rule.local('asked', 'Number');

/**
 * A climb that cannot get anywhere is over.
 *
 * THE BUG THIS EXISTS FOR was a robot frozen at the foot of a ladder for the
 * rest of the level. It stood on solid ground, decided its quarry was below
 * it, and started climbing DOWN — which is a legal thing to ask for, because
 * the bottom rung is a rung like any other and a ladder that goes on down
 * through a hole is a real ladder. This one did not: the floor pushed back
 * exactly as far as the climb pushed, every frame, for ever.
 *
 * Nothing could get it out. `Prowling` reconsiders at four junctions and every
 * one of them is either gated on not climbing or is a CHANGE — landing, a
 * ladder arriving, a climb ending — and none of those can happen to an actor
 * that is climbing and motionless. A player is in the same trap holding Down
 * on the bottom rung.
 *
 * So the climb answers for itself, and asks `Turning`'s question: I asked to
 * travel this far and I did not, so there is something there. That is one
 * subtraction, it is true of every way of being stopped — a floor below, a
 * ceiling above, a solid body in the way — and it is asked in `react`, after
 * all of them have had their say.
 *
 * HALF THE DISTANCE, like `Turning`, because a body Solid has pushed part of
 * the way out of a wall has travelled a little without having got anywhere.
 */
climbs.step('stop if the climb got nowhere', 'react', [
  when([
    [
      both(climbing.of(thisActor()), climbMeasured.of(thisActor())),
      [
        note('Up is negative y, so the distance is signed by the direction'),
        note('and a climb that was pushed BACKWARDS is stopped too.'),
        got.set(
          times(
            minus(position.y(thisActor()), climbedFrom.of(thisActor())),
            pick(goingUp.of(thisActor()), n(-1), n(1)),
          ),
        ),
        asked.set(
          times(times(speed.of(thisActor()), pixelsPerUnit()), frameTime()),
        ),
        when([
          [
            lessThan(got.get(), times(asked.get(), n(0.5))),
            [stopClimbing({who: thisActor()})],
          ],
        ]),
      ],
    ],
  ]),
]);

/**
 * The four handlers, written once.
 *
 * A trait of its own rather than part of `Climbs`, because a climber need not
 * have a keyboard — see the header. This is the same shape `Arrow Keys` has
 * beside `Physics`: one trait is the mechanic, the other is a control scheme
 * for it, and an actor may take the first without the second.
 */
const arrows = rule.trait('Climbs with Arrow Keys');
arrows.uses(Climbs);
arrows.uses('Input#TakesKeyboardInputTrait');

arrows.step('read the arrows', 'decide', [
  when(
    [
      [keyDown('up arrow'), [climbUp({who: thisActor()})]],
      [keyDown('down arrow'), [climbDown({who: thisActor()})]],
    ],
    [stopClimbing({who: thisActor()})],
  ),
]);

export default () => moduleFor(rule, 'climb');

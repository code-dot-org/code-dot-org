import {
  anyOf,
  countOf,
  defineRule,
  equals,
  filter,
  firstActor,
  give,
  hasTrait,
  moduleFor,
  note,
  param,
  thisActor,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Inventory',
  ability: 'Carries Things',
  header: `// "Carries Things" — a bag, and the difference between having and having had.
//
// Collection already answers "how many coins did I pick up": it keeps every
// actor a collector took, and a game counts the ones that are Coins. That is a
// RECORD, and a record is the right shape for a score — it only ever grows, and
// nothing can take a coin back out of a total.
//
// A key is not like that. A locked door wants one, and once the door is open
// the key is gone: what a game asks is not "how many keys have I ever found"
// but "have I got one now", and the answer has to be able to go down. So this
// is a bag rather than a tally, and the thing it adds to the library is
// SPENDING.
//
// IT PICKS NOTHING UP. Collection is what takes a thing off the floor, and this
// is what holds it afterwards, so a project says which of the things it
// collects are worth keeping:
//
//     when ⟨Player⟩ collects ⟨item⟩  →  ⟨this actor⟩ takes ⟨item⟩
//
// One handler, and it is the handler that makes the two rules one idea. Written
// the other way — a bag that helped itself to whatever was collected — a coin
// picked up for points would sit in the inventory for ever, and a game with
// both would have to explain the difference to a learner who never asked for
// it. It also means a thing can reach the bag without ever having been on the
// floor: a reward for talking to somebody, a key handed over at the start.
//
// THINGS HAVE NAMES, and the name is the game's word rather than the engine's.
// A carried thing carries a string — "key", "coin", "red key" — because a rule
// cannot name the KINDS a project invented, and because two kinds of key is a
// distinction only the game can draw. That is also what makes \`spends a ⟨key⟩\`
// sayable at all: something has to say which one to spend.
//
// WHAT IS IN THE BAG IS ACTORS, not names, and that is worth the extra step.
// The thing you are carrying is the thing you picked up — its picture, its
// properties, whatever your game wrote on it — so a game can draw the key it
// holds rather than a word for one. A bag of names would have been smaller and
// would have thrown that away.
//
// SPENDING TAKES THE OLDEST FIRST, which matters only when two things share a
// name, and is what "a key" means when there are three: any of them, and the
// first one is as good an answer as the rule can give.
//
// It removes NOTHING from the world. An item in a bag has usually left the
// world already — Collection removes what it takes — and a spend is an
// arithmetic fact about the bag rather than an event in the room. What SPENDING
// looks like is the project's: \`uses a ⟨key⟩\` is where the door opens.`,
});

const carries = rule.trait('Carries');

/**
 * What this actor is holding, oldest first.
 *
 * Read-only, and the two verbs are the way in and out: a project that wrote
 * this list by hand could put a thing in the bag without it ever having been
 * anywhere, and take one out without anybody being told.
 */
const things = carries.actors('things', {readonly: true});

const carried = rule.trait('Can Be Carried');

/**
 * What this thing IS, in the game's own word: "key", "coin", "rope".
 *
 * A string rather than the actor's kind, because a rule cannot name the kinds a
 * project invented — and because a game with a red key and a blue key has two
 * words for one kind, which is a distinction it is allowed to draw.
 */
const whatItIs = carried.string('what it is', 'thing');

export const Carries = rule.traitRef('Carries');
export const CanBeCarried = rule.traitRef('Can Be Carried');

/** `when ⟨Player⟩ uses a ⟨key⟩` — where the door opens. */
const uses = carries.event(['uses a', param('what', 'string')]);

const each = rule.local('each', 'Actor');
const found = rule.local('found', 'Actor');

/** The things in this actor's bag that go by a given name. */
const named = what =>
  filter(each, {
    from: things.of(thisActor()),
    where: equals(whatItIs.of(each.get()), what),
  });

export const takes = carries.block({
  returns: 'none',
  description:
    'Put a thing in this actor’s bag. Usually said in a "collects" handler — collecting is picking it up off the floor, and this is having it.',
  say: ['takes', param('item', 'actor')],
  body: ({item}) => [
    note('Only a thing that can be carried: everything else has no name to be'),
    note('carried under, and a bag of nameless things is a bag nothing can'),
    note('ever be spent from.'),
    when([
      [
        hasTrait(item.get(), CanBeCarried),
        [things.push(thisActor(), item.get())],
      ],
    ]),
  ],
});

export const hasA = carries.block({
  returns: 'boolean',
  description:
    'Whether this actor is carrying anything by that name. The question a locked door asks.',
  say: ['has a', param('what', 'string')],
  body: ({what}) => [give(anyOf(named(what.get())))],
});

export const hasHowMany = carries.block({
  returns: 'number',
  description:
    'How many things by that name are in the bag — three keys, two ropes.',
  say: ['has how many', param('what', 'string')],
  body: ({what}) => [give(countOf(named(what.get())))],
});

export const spends = carries.block({
  returns: 'none',
  description:
    'Take one thing of that name out of the bag and raise "uses a". Does nothing if there is none — ask first if that matters.',
  say: ['spends a', param('what', 'string')],
  body: ({what}) => [
    note('The oldest one that goes by the name, which is what "a key" means'),
    note('when the bag holds three.'),
    found.set(firstActor(named(what.get()))),
    when([
      [
        anyOf(found.get()),
        [
          things.drop(thisActor(), found.get()),
          note('Said after it is gone, so a handler that asks what is left'),
          note('sees what is left.'),
          uses({what: what.get()}, thisActor()),
        ],
      ],
    ]),
  ],
});

export default () => moduleFor(rule, 'inventory');

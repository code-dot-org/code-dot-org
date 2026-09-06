import {
  anyOf,
  defineRule,
  doc,
  equals,
  filter,
  firstActor,
  give,
  hasTrait,
  kindOf,
  moduleFor,
  param,
  thisActor,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Inventory',
  ability: 'Holds Things',
  purpose: `**Inventory** is a bag: what an actor is carrying *now*, as opposed to what it
has ever picked up.

Collection keeps a record, and a record only grows — nothing can take a coin
back out of a total. A bag is different: you put a key in, you use it, it is
gone.

Give the carrier **Carries** and anything pocketable **Can Be Carried**.`,
  header: `// "Holds Things" — a bag, and the difference between having and having had.
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
// A THING IS ITS KIND. \`spends a ⟨Key⟩\` names one from a dropdown of the
// project's own actor kinds, which is the same dropdown \`is a ⟨Key⟩\` and
// \`how many ⟨Coin⟩ in ⟨…⟩\` offer — so there is one way to say which sort of
// thing you mean, and no way to misspell it.
//
// It was a STRING on the carried thing first, and the string was wrong twice
// over. It could be typed two ways ("key" and "Key") and only the game running
// would say so; and it made the bag's two questions a private vocabulary
// alongside the public one, when \`how many ⟨Key⟩ in ⟨things of ⟨Player⟩⟩\`
// already answers one of them in blocks a learner has met. What a string buys
// is a category CUTTING ACROSS kinds — a Key and a Skeleton Key both spending
// as "key" — and the library's word for a sort of thing is an actor kind, so a
// game that wants two keys makes two kinds.
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

/**
 * A thing that may go in a bag.
 *
 * No properties: being carryable is a fact about a thing rather than a setting,
 * which is what Collection's `Can Be Collected` is too. What sort of thing it
 * is, is its kind.
 */
rule.trait('Can Be Carried');

export const Carries = rule.traitRef('Carries');
export const CanBeCarried = rule.traitRef('Can Be Carried');

/**
 * `when ⟨Player⟩ uses a thing` — where the door opens.
 *
 * It carries the ITEM rather than its kind, because the item is the more
 * specific answer and the kind can be got from it (`is a ⟨Key⟩`) — and because
 * a handler that wants to show what was spent wants the thing, not a word.
 */
const uses = carries.event(['uses a thing', param('item', 'actor')]);

const each = rule.local('each', 'Actor');
const found = rule.local('found', 'Actor');

/** The things in this actor's bag that are of a given kind. */
const ofKind = wanted =>
  filter(each, {
    from: things.of(thisActor()),
    where: equals(kindOf(each.get()), wanted),
  });

export const takes = carries.block({
  returns: 'none',
  description:
    'Put a thing in this actor’s bag. Usually said in a "collects" handler — collecting is picking it up off the floor, and this is having it.',
  say: ['takes', param('item', 'actor')],
  body: ({item}) => [
    doc(
      'Only a thing that can be carried. The trait is the whole of what makes something bag-able, and a project that put anything at all in one would be keeping the world in a pocket.',
    ),
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
    'Whether this actor is carrying one of a kind of thing. The question a locked door asks.',
  say: ['has a', param('what', 'kind')],
  body: ({what}) => [give(anyOf(ofKind(what.get())))],
});

// NO `has how many`. `how many ⟨Key⟩ in ⟨things of ⟨Player⟩⟩` says it already,
// in a block a learner meets counting bricks — and a rule that answered it
// again would be a second way to ask one question, in a private vocabulary
// beside the public one.

export const spends = carries.block({
  returns: 'none',
  description:
    'Take one thing of a kind out of the bag and raise "uses a thing". Does nothing if there is none — ask first if that matters.',
  say: ['spends a', param('what', 'kind')],
  body: ({what}) => [
    doc(
      'The oldest one of that kind, which is what "a key" means when the bag holds three.',
    ),
    found.set(firstActor(ofKind(what.get()))),
    when([
      [
        anyOf(found.get()),
        [
          things.drop(thisActor(), found.get()),
          doc(
            'Said after it is gone, so a handler that asks what is left sees what is left — and carrying the thing itself, which is what a handler showing the key just used needs.',
          ),
          uses({item: found.get()}, thisActor()),
        ],
      ],
    ]),
  ],
});

export default () => moduleFor(rule, 'inventory');

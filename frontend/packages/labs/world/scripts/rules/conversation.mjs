import {
  add,
  atLeast,
  atMost,
  defineRule,
  doc,
  give,
  lessThan,
  moduleFor,
  moreThan,
  n,
  no,
  note,
  param,
  thisActor,
  when,
} from './dsl.mjs';

const rule = defineRule({
  name: 'Conversation',
  ability: 'Has a Conversation',
  header: `// "Has a Conversation" — a place in a script, and a way to move through it.
//
// A visual novel is a sequence with pauses, and NOTHING IN THIS ENGINE
// SUSPENDS: a handler runs to the end of its frame, so "say this, wait, say
// that" cannot be written as a sequence of blocks. What a conversation is
// instead is a CURSOR — a number saying where you are — and an event raised
// when it moves.
//
// So a project answers \`moves to a line\` and decides what line four is. That
// is more words than a script file would be, and it is also the whole feature:
// a line can set a portrait, play a sound, start a tween, or ask a question,
// because it is blocks and not a string in a table. A file of lines can come
// later for the common case; it could not have come first, because nothing yet
// knows what a line needs to be able to do.
//
// THE LANGUAGE HAS LISTS NOW (specs/LISTS.md), and this rule is deliberately
// unchanged by them. A project whose lines are only words may keep them in a
// \`words\` property and say the one it is on, which is shorter than an \`if\`
// per line — and the rule still holds none of it, because the moment a line
// wants a portrait or a sound it stops being a word and the blocks answering
// \`moves to a line\` are where that is said. History was the rule the missing
// list had bent out of shape; this was not one.
//
// THE CURSOR IS ONE-BASED and starts at zero. Line one is the first thing said,
// and zero means nobody is talking — which is a state a conversation is in
// before it starts and after it ends, and one a handler can ask about without a
// second flag to keep in step.
//
// \`go to line\` is what makes a choice work. A button's handler jumps the
// cursor somewhere else, and the conversation carries on from there; branching
// needs no more machinery than that.`,
});

const talks = rule.trait('Has a Conversation');

/**
 * Where in the script this conversation is: 1 is the first line, 0 is nobody
 * talking.
 *
 * Read-only, because moving it is what the actions are for — and because the
 * events have to fire when it moves, which a bare `set` could not promise.
 */
const line = talks.number('line', 0, {readonly: true});

/**
 * How many lines the script has.
 *
 * Set by the project, because the project is what holds the lines. A
 * conversation cannot count what it cannot see.
 */
const length = talks.number('how many lines', 0);

export const HasAConversation = rule.traitRef('Has a Conversation');

/** `when ⟨Chat⟩ moves to a line` — the cue to say the next thing. */
export const moved = talks.event(['moves to a line', param('line', 'number')]);

/** `when ⟨Chat⟩ ends` — the cue to hide the box, or start the game. */
export const ended = talks.event(['ends']);

/** Move the cursor, raising the right event for where it lands. */
const target = rule.local('line to go to', 'Number');

const goTo = (who, where) => [
  target.set(where),
  when(
    [
      [
        // Off the end, or before the start: that is the end of it. Both, so
        // `go back` from line one ends rather than sitting at zero silently.
        moreThan(target.get(), length.of(who)),
        [line.set(who, n(0)), ended({}, who)],
      ],
      [lessThan(target.get(), n(1)), [line.set(who, n(0)), ended({}, who)]],
    ],
    [line.set(who, target.get()), moved({line: target.get()}, who)],
  ),
];

rule.block({
  returns: 'none',
  description:
    'Begin at the first line. Raises “moves to a line”, so whatever answers that says the first thing.',
  say: ['make', param('who', 'actor'), 'start talking'],
  body: ({who}) => [
    note('From the top, whatever was happening before.'),
    ...goTo(who.get(), n(1)),
  ],
});

rule.block({
  returns: 'none',
  description:
    'Move on to the next line — what a click does. Ends the conversation if there is no next one.',
  say: ['make', param('who', 'actor'), 'say the next thing'],
  body: ({who}) => [
    doc(
      'One line on. Running off the end is not an error — it is how a conversation finishes, and the `ends` event is raised for it.',
    ),
    ...goTo(who.get(), add(line.of(who.get()), n(1))),
  ],
});

rule.block({
  returns: 'none',
  description:
    'Jump somewhere else in the script. This is how a choice works: a button sends the conversation to the line its answer starts at.',
  say: ['send', param('who', 'actor'), 'to line', param('which')],
  body: ({who, which}) => [
    doc(
      'Jump to a line by number, which is what a branching conversation is made of: ask a question, then send the speaker to the line the answer belongs to.\n\nA number off either end finishes the conversation rather than sitting silently on a line that is not there.',
    ),
    ...goTo(who.get(), which.get()),
  ],
});

rule.block({
  returns: 'none',
  description: 'Stop talking. Raises “ends”, as running off the end does.',
  say: ['make', param('who', 'actor'), 'stop talking'],
  body: ({who}) => [line.set(who.get(), n(0)), ended({}, who.get())],
});

talks.block({
  returns: 'boolean',
  description:
    'Whether anybody is talking — false before it starts and after it ends.',
  say: ['is talking?'],
  body: () => [give(atLeast(line.of(thisActor()), n(1)))],
});

talks.block({
  returns: 'boolean',
  description:
    'Whether this is the last line, so a click on it ends rather than moving on.',
  say: ['is on the last line?'],
  body: () => [
    note('Nobody talking is not "on the last line" — it is not on any line.'),
    when([[atMost(line.of(thisActor()), n(0)), [give(no())]]]),
    give(atLeast(line.of(thisActor()), length.of(thisActor()))),
  ],
});

export default () => moduleFor(rule, 'conversation');

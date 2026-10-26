import {
  allWithTrait,
  anyOf,
  both,
  canBeReached,
  captureKey,
  choice,
  defineRule,
  doc,
  equals,
  filter,
  firstActor,
  forEach,
  forEachKey,
  keyboardArrived,
  keyDown,
  moduleFor,
  no,
  not,
  note,
  orderedActors,
  releaseKey,
  stopLoop,
  thisActor,
  when,
  yes,
} from './dsl.mjs';

/** The keyboard's enum, so a comparison names the same key a dropdown offers. */
const KEY = 'Engine#Key';

const rule = defineRule({
  name: 'Tab Navigation',
  ability: 'Moves Focus with Tab',
  purpose: `**Tab Navigation** is the keyboard's way around your interface.

One actor at a time holds the **focus**, and the actors that can hold it are the
ones you gave **Can Be Focused**. Tab moves it to the next one; Escape drops it
altogether. An actor can also take it for itself — a text field does that when
it is clicked.

An actor hears \`gains focus\` and \`loses focus\`, and can read \`focused\` to
draw itself differently while the typing is coming to it. Set **tab order** if
you want a particular route through a form; leave it alone and the order is the
order you placed them in.`,
  header: `// "Moves Focus with Tab" — one actor at a time holds the keyboard.
//
// The rule interface actors were missing. A Text Input decided for itself
// whether it was being typed at, which works for exactly one field and falls
// apart at two: focus is not a fact about a field, it is a fact about the
// SCREEN, and a thing no single actor can know is a rule.
//
// FOCUS IS READ-ONLY AND MOVED BY ONE BLOCK. \`focused\` is the trait's and
// nothing outside this rule sets it; \`take the focus\` and \`drop the focus\`
// are the only ways it moves. That is what makes \`loses focus\` and
// \`gains focus\` trustworthy — they are raised in one place, in that order,
// and cannot get out of step with the property they describe.
//
// THE ORDER IS THE ORDER THEY WERE PLACED IN, unless somebody says otherwise.
// \`tab order\` is a number, everybody's is zero, and \`ordered by\` is a
// STABLE sort — so an untouched project tabs through its controls in the order
// the world adds them, and a project that cares says so on the actors it cares
// about (\`core/actorValue.ordered\`).
//
// IT READS THE KEYBOARD DIRECTLY rather than through the Input rule's events.
// It needs an EDGE — the frame Tab went down — which \`for each newly pressed
// key\` is, and going through another rule's events would make this depend on
// a rule a project may not have imported for a fact the World already holds.
//
// TAB IS ONLY THE GAME'S WHILE THE GAME IS USING IT. The browser has a Tab key
// too, and it is how a keyboard user moves past the canvas. So this CAPTURES
// tab when an actor takes the focus and RELEASES it when the focus is dropped
// — and its tab branch does nothing at all while nothing is focused, so a Tab
// pressed in a game with an idle interface goes to the page and takes the
// player out of the canvas. Escape drops the focus, which is the door: it
// cannot be captured by anybody (\`core/keys\`, RESERVED_KEYS).
//
// COMING IN IS NOT MOVING ON, and nothing in the keys can tell them apart: the
// Tab that carried the player onto the game was pressed while the page still
// had the keyboard. \`the game just got the keyboard\` is the moment itself,
// reported by the driver, and it is what focuses the first actor
// (specs/UI_ACTORS.md).`,
});

const focusable = rule
  .trait('Can Be Focused')
  .describe('Can hold the keyboard, and takes its turn when Tab moves along.');

focusable.doc(
  'Whatever elects this can hold the keyboard. Only one actor in a world holds it at a time, and this rule is the only thing that moves it.',
);

/**
 * Whether the keyboard is coming here.
 *
 * READ-ONLY, and it is the reason the two blocks below exist. An actor that
 * could set this itself could set it while another actor also had it, and then
 * two fields would take the same keystroke — which is exactly what the Text
 * Input's own `focused` did before there was a rule to arbitrate.
 */
const focused = focusable.boolean('focused', 'false', {readonly: true});

/**
 * Where this actor comes in the route, lowest first.
 *
 * Zero for everybody unless a project says otherwise, and the ordering is
 * stable — so leaving it alone is not a tie nobody breaks, it is placement
 * order, which is the order somebody laying out a form worked in.
 */
const tabOrder = focusable.number('tab order', 0);

/**
 * Whether pointing at this actor brings the keyboard to it.
 *
 * TRUE FOR EVERYBODY, and the one thing it is false for is a key on an
 * on-screen keyboard. Such a key is a Button, and a Button takes the focus
 * when it is clicked — which is right for every button in a menu and exactly
 * wrong here: tapping `a` would take the typing away from the field the `a`
 * was meant for, and the field would go dark on the first keystroke
 * (specs/KEYBOARD_PLAN.md).
 *
 * It is also out of the TAB ROUTE while this is false, which is the same fact
 * read the other way: an actor the keyboard cannot come to is not somewhere
 * Tab should stop, and a Tab that stopped there would find `take the focus`
 * doing nothing and leave the focus where it was — a route with a hole that
 * swallows it. A keyboard user has a keyboard and does not need this one.
 */
const takesKeyboard = focusable.boolean('takes the keyboard', 'true');

const gainsFocus = focusable.event(['gains focus']);
const losesFocus = focusable.event(['loses focus']);

const other = rule.local('other', 'Actor');
/** The route's own local, so the filter inside it cannot collide with a walk. */
const listed = rule.local('listed', 'Actor');
const ranked = rule.local('ranked', 'Actor');
const candidate = rule.local('candidate', 'Actor');
const chosen = rule.local('chosen', 'Actor');
const previous = rule.local('previous', 'Actor');
const passed = rule.local('passed', 'Boolean');
const found = rule.local('found', 'Boolean');
const key = rule.local('key', 'String');

/**
 * Everyone Tab visits, in the order it visits them.
 *
 * NOT everyone who can hold the focus: an actor with `takes the keyboard` off
 * is one the pointer presses and the keyboard passes over (see the property).
 */
const inOrder = () =>
  orderedActors(ranked, {
    from: filter(listed, {
      from: allWithTrait(rule.traitRef('Can Be Focused')),
      where: both(takesKeyboard.of(listed.get()), canBeReached(listed.get())),
    }),
    key: tabOrder.of(ranked.get()),
  });

/** Let go of whoever is holding it, telling them so. */
const release = () =>
  forEach(other, {
    from: allWithTrait(rule.traitRef('Can Be Focused')),
    body: [
      when([
        [
          focused.of(other.get()),
          [focused.set(other.get(), no()), losesFocus({}, other.get())],
        ],
      ]),
    ],
  });

/**
 * `⟨this actor⟩ take the focus` — the one way an actor comes to hold it.
 *
 * Called by Tab below, and by anything else that decides where the keyboard
 * should be: a field focuses itself when it is clicked, and a game focuses its
 * first field when a form opens.
 *
 * IT DOES NOTHING IF THIS ACTOR ALREADY HAS IT, which is what makes it safe to
 * call from a click handler that fires every frame the button is held. Without
 * the guard, re-focusing would raise `loses focus` and `gains focus` on one
 * actor, over and over, and a handler counting either would count nonsense.
 *
 * AND NOTHING IF THIS ACTOR SAYS NOT TO. `takes the keyboard` is how a control
 * that is only ever pointed at stays out of the way of whatever is being typed
 * into — the refusal is HERE rather than in each caller, because the Button
 * that calls this is on the shelf and a map that places one cannot edit it.
 *
 * AND NOTHING IF A SCREEN IN FRONT COVERS IT. Same place and same reason: a
 * field on the screen behind a dialog is not somewhere the keyboard may go
 * (specs/MODALITY_PLAN.md).
 */
const takeFocus = focusable.block({
  returns: 'none',
  description:
    'Bring the keyboard to this actor. Whoever had the focus loses it. Does nothing if this actor already has it.',
  say: ['take the focus'],
  body: () => [
    doc(
      'Already holding it? Then nothing has changed, and neither event is worth raising: a `gains focus` for an actor that never lost it is an event about nothing.',
    ),
    when([
      [
        both(
          not(focused.of(thisActor())),
          both(takesKeyboard.of(thisActor()), canBeReached(thisActor())),
        ),
        [
          note('Whoever had it lets go first, so the two never overlap.'),
          release(),
          focused.set(thisActor(), yes()),
          gainsFocus({}, thisActor()),
          note('While somebody is holding it, Tab is the game\u2019s.'),
          captureKey('tab'),
        ],
      ],
    ]),
  ],
});

/**
 * `drop the focus` — nobody holds it.
 *
 * What Escape does, and what a click on the background should do. It is also
 * how a game hands the keyboard BACK to the page: while nothing here holds the
 * focus, Tab is the browser's again (specs/UI_ACTORS.md).
 */
const dropFocus = rule.block({
  returns: 'none',
  description:
    'Take the focus away from whatever has it, so nothing in the world is listening.',
  say: ['drop the focus'],
  body: () => [
    doc(
      'Everyone that can hold the focus is asked, rather than one remembered actor: the rule keeps no second copy of who has it, so there is nothing that can disagree with the property itself.',
    ),
    release(),
    doc(
      'And Tab goes back to the page. This is the whole of how a keyboard user leaves the game: nothing here is holding the key any more, so the next press moves them past the canvas.',
    ),
    releaseKey('tab'),
  ],
});

/** Whether anybody in the world is holding the focus right now. */
const somethingFocused = () =>
  anyOf(
    filter(other, {
      from: allWithTrait(rule.traitRef('Can Be Focused')),
      where: focused.of(other.get()),
    }),
  );

/**
 * `focus the first control` — the front of the route takes it.
 *
 * What arriving at the game is, and what a game says when it opens a form.
 * Does nothing in a world with nothing focusable in it, which is most worlds.
 *
 * ASKED OF THE ROUTE, not of every focusable actor. They used to be the same
 * list; they are not once a screen in front can cover one, and a world whose
 * only fields are behind a dialog would otherwise have taken the first of
 * them — reaching past the dialog for the thing the dialog is covering.
 */
const focusFirst = rule.block({
  returns: 'none',
  description:
    'Bring the keyboard to the first control in the tab order. Does nothing if there is nothing that can hold it.',
  say: ['focus the first control'],
  body: () => [
    when([
      [
        anyOf(inOrder()),
        [chosen.let(firstActor(inOrder())), takeFocus({}, chosen.get())],
      ],
    ]),
  ],
});

/**
 * A screen opening takes the keyboard with it.
 *
 * The focus is a property of an actor, so it survives the thing in front
 * arriving: open a dialog over a focused field and the field is still
 * holding it — still drawing its ring, still the answer to `focused`, and
 * still where Tab counts from. The typing stops reaching it (`rules/input`
 * asks the same question), which is half of what modal means; this is the
 * other half (specs/MODALITY_PLAN.md).
 *
 * IT MOVES THE FOCUS RATHER THAN DROPPING IT. Dropping would hand Tab back
 * to the page, so the first Tab inside a freshly opened dialog would leave
 * the game — which is the trap `capture the ⟨tab⟩ key` exists to avoid.
 *
 * In `sense`, the first moment of the frame: a screen is loaded in a handler,
 * which runs after every step, so this catches it on the frame after — the
 * same one frame everything else about a click is late by.
 */
rule.step('coveredLosesFocus', 'sense', [
  doc(
    'Whoever is holding the keyboard from behind a screen in front lets go, and the front of the route takes it. The route only has what can be reached, so "the front" is the first thing on the screen that is showing.',
  ),
  forEach(other, {
    from: allWithTrait(rule.traitRef('Can Be Focused')),
    body: [
      when([
        [
          both(focused.of(other.get()), not(canBeReached(other.get()))),
          [focusFirst({})],
        ],
      ]),
    ],
  }),
]);

/**
 * `focus the next control` — what Tab does, said as a block.
 *
 * WHY THE WALK RATHER THAN A SORT KEY. "The next one" is a question about
 * position in a list, and the list is only in order once — so it is ordered
 * once and walked once, taking the first actor after the one that has the
 * focus. A sort key that encoded "after" would have to fold `tab order` and
 * placement into one number, and would be wrong the first time two actors
 * shared both.
 */
const focusNext = rule.block({
  returns: 'none',
  description:
    'Move the keyboard to the next control in the tab order, wrapping round to the first.',
  say: ['focus the next control'],
  body: () => [
    doc(
      'Walk the route in order. `passed` goes true at the actor that has the focus, so the very next one is the answer — and the loop stops there rather than walking the rest of a form to no purpose.',
    ),
    chosen.let(),
    passed.let(no()),
    found.let(no()),
    forEach(candidate, {
      from: inOrder(),
      body: [
        when([
          [
            passed.get(),
            [chosen.set(candidate.get()), found.set(yes()), stopLoop()],
          ],
          [focused.of(candidate.get()), [passed.set(yes())]],
        ]),
      ],
    }),
    note('Nothing after the last one, so the route wraps to the front.'),
    when([[not(found.get()), [focusFirst()]]], [takeFocus({}, chosen.get())]),
  ],
});

/**
 * `focus the previous control` — Shift+Tab, and a Back button.
 *
 * IT WALKS FORWARDS TOO, remembering the one before. Ordering the list the
 * other way round would not do it: the sort is stable, so reversing the KEY
 * leaves actors that share one in the order they were added, and a form where
 * nobody set `tab order` would run backwards exactly as it runs forwards.
 *
 * AND IT DOES NOT STOP EARLY, which is the difference from the walk above. The
 * wrap here is to the LAST control, and the only way to know which that is is
 * to reach the end — so `previous` is left holding it, and the case where the
 * focus is on the very first control falls out of the same line.
 */
const focusPrevious = rule.block({
  returns: 'none',
  description:
    'Move the keyboard to the previous control in the tab order, wrapping round to the last.',
  say: ['focus the previous control'],
  body: () => [
    doc(
      'Walk the route in order, one behind. When the walk reaches the actor holding the focus, the one before it is the answer; when it reaches the end without having found one, `previous` is holding the last control, which is where the route wraps to.',
    ),
    chosen.let(),
    previous.let(),
    found.let(no()),
    passed.let(no()),
    forEach(candidate, {
      from: inOrder(),
      body: [
        when([
          [
            both(
              focused.of(candidate.get()),
              both(passed.get(), not(found.get())),
            ),
            [chosen.set(previous.get()), found.set(yes())],
          ],
        ]),
        previous.set(candidate.get()),
        note('`passed` here means only that there IS one behind us.'),
        passed.set(yes()),
      ],
    }),
    when([
      [found.get(), [takeFocus({}, chosen.get())]],
      [passed.get(), [takeFocus({}, previous.get())]],
    ]),
  ],
});

/**
 * Tab, Shift+Tab, Escape, and arriving.
 *
 * WHY THE TAB BRANCH IS GUARDED. While nothing here holds the focus, Tab is
 * the PAGE's: the game does not capture it and must not act on it either, or a
 * player who pressed Escape to leave would be pulled straight back in. The two
 * halves have to agree, and this is the half that is easy to forget, because a
 * rule that grabbed Tab always would look right in every test that never tried
 * to leave.
 */
rule.step('focusKeys', 'sense', [
  doc(
    'Three moments, and they are easy to confuse. Arriving at the game brings the focus to the first control. Tab moves it on — backwards with shift held — but only while something already has it, since otherwise the key belongs to the page and carries the player out. Escape drops it, which is what hands the key back.',
  ),
  note('Coming in. Already holding it? Then this is a return, not an arrival.'),
  when([[both(keyboardArrived(), not(somethingFocused())), [focusFirst()]]]),
  forEachKey('PRESSED', key, [
    when([
      [equals(key.get(), choice(KEY, 'escape')), [dropFocus()]],
      [
        both(equals(key.get(), choice(KEY, 'tab')), somethingFocused()),
        [when([[keyDown('shift'), [focusPrevious()]]], [focusNext()])],
      ],
    ]),
  ]),
]);

export default () => moduleFor(rule, 'tabNavigation');

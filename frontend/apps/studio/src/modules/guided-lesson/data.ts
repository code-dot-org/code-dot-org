import type {AiTrainerStageConfig} from './AiTrainerLabStage';
import type {DatasciStageConfig} from './DatasciLabStage';
import {
  TOOLBOX_FULL,
  type MazeStageConfig,
} from './MazeLabStage';
import type {Lesson} from './types';

// AI Trainer step. Toolbox carries all three blocks (predict / compare /
// clear); workspace pre-populated with `when_run` so the student starts
// by choosing a predict block themselves.
const AI_TRAINER_INTRO: AiTrainerStageConfig = {
  levelId: 301,
  toolboxBlocks:
    '<xml>' +
    '<block type="aitrainer_predict"><field name="ALGO">majority</field></block>' +
    '<block type="aitrainer_compare">' +
    '<field name="ALGO_A">majority</field>' +
    '<field name="ALGO_B">nearest-neighbor</field>' +
    '</block>' +
    '<block type="aitrainer_clear"/>' +
    '</xml>',
  instructions:
    '**Goal:** find the best classifier for these creatures.\n\n' +
    'Try a `predict` block with different algorithms, then add a `compare` ' +
    'block to see two side-by-side. Read the "How it works" panel after each run.',
};

// Datasci step config: the lab starts with `when_run` only and a focused
// toolbox of `count` + `average` + `filter_grade` + `reset`. Lesson copy
// expects the student to count rows, filter to a grade, then average score.
const DATASCI_INTRO: DatasciStageConfig = {
  levelId: 201,
  toolboxBlocks:
    '<xml>' +
    '<block type="datasci_count"/>' +
    '<block type="datasci_average"><field name="COLUMN">score</field></block>' +
    '<block type="datasci_filter_grade"><field name="GRADE">3</field></block>' +
    '<block type="datasci_reset"/>' +
    '</xml>',
  instructions:
    '**Goal:** find the average score for grade 3 students.\n\n' +
    'Snap `filter_grade(3)` then `average(score)` under `when run`, then press Run.',
};

// Maze grid encoding: 0=wall, 1=open, 2=start, 3=finish, 4=obstacle.
// Rows top→bottom, columns left→right. startDirection: 0=N 1=E 2=S 3=W.
// 8×8 — the standard shape used by levelbuilder.
//
// One maze for the lesson: an L-shape whose canonical solution is
//   repeat until finished { if path ahead { forward } else { turn right } }
// That single shape carries the whole loop+condition payoff.
const MAZE_LEVEL: MazeStageConfig = {
  levelId: 101,
  grid: [
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 2, 1, 1, 1, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 0, 3, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0],
  ],
  startDirection: 1,
  toolboxBlocks: TOOLBOX_FULL,
  instructions:
    '**Goal:** reach the finish.\n\nTry the pattern:\n\n```\nrepeat until finished\n  if path ahead → move forward\n  else → turn right\n```',
  ideal: 4,
};

/**
 * One combined lesson covering both labs. Music introduces loops; maze
 * introduces conditions. The arc moves "repeat the same thing" → "decide
 * before each step" → "the same code works on harder problems."
 */
const LESSONS: Record<string, Lesson> = {
  'loops-and-conditions': {
    id: 'loops-and-conditions',
    title: 'Loops and Conditions',
    subtitle:
      'Two of programming’s biggest ideas — discovered across four labs.',
    // Teaching pattern: feel the pain → name it → use it → reflect → transfer.
    // Vocab MCs (loop-vocab, cond-vocab) come AFTER the lab where the concept
    // was lived, not before. Hints inside `solutionCheck.rules` come in two
    // tiers: a Socratic notice/question first, a concrete nudge second.
    // After two misses the host invites the student to ask the tutor in chat.
    steps: [
      // ── Welcome — short, friendly. Names the journey, not the concepts. ──
      {
        id: 'welcome',
        kind: 'concept',
        tutorMessage:
          "Hi! I'm your tutor. We're going to make music, walk a maze, " +
          'and even train a little AI. Ready? Press **Continue**.',
        stage: {kind: 'unroll-tape'},
      },

      // ── Music Lab #1 — feel the pain. Four blocks, by hand. ──────────────
      {
        id: 'music-no-loop',
        kind: 'lab',
        tutorMessage:
          'Open **Music Lab**. Make a sound play **4 times**. ' +
          "Drag blocks under the green **`when run`** hat block (the one already there). " +
          'Press **Run** to hear it.',
        stage: {kind: 'music-lab'},
        continueLabel: 'I pressed Run and heard it',
        successMessage:
          "Nice — 4 blocks, 4 sounds.\n\n" +
          'Now imagine I asked for **40**. Or **100**. *Hmm.*',
        solutionCheck: {
          rules: [
            {
              kind: 'forbids-block',
              type: 'repeat_simple2',
              hint: 'I see a **repeat** block in there already. Try this *without* it first — what does it feel like the long way?',
              hintNudge:
                'Take the repeat block out for now. Just drag **4** sound blocks under `when run`.',
            },
            {
              kind: 'min-count',
              types: [
                'play_sound_at_current_location_simple2',
                'play_pattern_at_current_location_simple2',
                'play_chord_at_current_location_simple2',
                'play_tune_at_current_location_simple2',
              ],
              count: 4,
              hint: 'Count your sound blocks under `when run`. How many should there be?',
              hintNudge:
                'You need **4** sound blocks under `when run`. Drag a few more in.',
            },
          ],
        },
      },

      // ── Name the pain. Student must put a feeling-word on the cost. ──────
      {
        id: 'music-pain-elicit',
        kind: 'free-response',
        tutorMessage:
          'Be honest — how did dragging those **4** blocks feel? ' +
          'Now picture dragging **40**. Type one word for that feeling.',
        stage: {
          kind: 'reflection-invitation',
          prompt: 'Dragging 40 blocks would feel…',
        },
        placeholder: 'Dragging 40 blocks would feel…',
        acknowledgement:
          'Right? **Tedious. Slow. Boring.** Real programmers feel that too — ' +
          'and when they feel it, they get an idea.',
      },

      // ── Propose the fix. Student invents the abstraction before we name it.
      {
        id: 'music-fix-propose',
        kind: 'multiple-choice',
        tutorMessage:
          'Pretend you are the computer’s **boss**. You want the *same* sound 40 times. ' +
          'What is the **smartest** order to give? →',
        stage: {kind: 'multiple-choice-stage-slot'},
        options: [
          {
            id: 'a',
            label: '"Play the sound. Play the sound. Play the sound…" — 40 times.',
            isCorrect: false,
            feedback:
              'That works — but **you** are doing all the work. Your mouth gets tired and so do your fingers. Is there a shorter order?',
          },
          {
            id: 'b',
            label: '"Play the sound, **40 times**." — one order, with a number.',
            isCorrect: true,
            feedback:
              'Yes! **One order plus a number.** That is the idea programmers had too. Now let’s see if the toolbox has a block that takes orders like that.',
          },
          {
            id: 'c',
            label: '"Play 40 sounds at the same moment." — all at once.',
            isCorrect: false,
            feedback:
              'Whoa — that would be one giant noise, not 40 sounds in a row. We want them **one after another**, just with less typing.',
          },
        ],
        allowRetry: true,
      },

      // ── Music Lab #2 — discover the repeat block. The student already
      //    proposed "one order with a number"; we just confirm it exists.
      {
        id: 'music-loop',
        kind: 'lab',
        tutorMessage:
          'You just invented the idea: **one order plus a number**. ' +
          'Programmers built a block that does exactly that.\n\n' +
          'Open **Music Lab** and hunt for it in the toolbox. ' +
          'When you think you found it, press **Run**.',
        stage: {kind: 'music-lab'},
        continueLabel: 'I pressed Run',
        successMessage:
          'One block. Four sounds. **Same result, half the work.**\n\n' +
          'Change `4` to `40` and your program still fits on one line.',
        solutionCheck: {
          rules: [
            {
              kind: 'requires-block',
              type: 'repeat_simple2',
              hint: 'Look for a block whose name starts with **repeat**. What do you think it might do?',
              hintNudge:
                'Drag the **repeat** block from the toolbox and put it under `when run`.',
            },
            {
              kind: 'min-count',
              types: [
                'play_sound_at_current_location_simple2',
                'play_pattern_at_current_location_simple2',
                'play_chord_at_current_location_simple2',
                'play_tune_at_current_location_simple2',
              ],
              count: 1,
              hint: 'Your repeat block is empty. What do you want it to repeat?',
              hintNudge:
                'Drop **one** sound block *inside* the mouth of the repeat block.',
            },
          ],
        },
      },

      // ── Loop vocab — NAME the thing the student just discovered. ─────────
      {
        id: 'loop-vocab',
        kind: 'multiple-choice',
        tutorMessage:
          'The block you just used has a name. Tap the answer that matches what it does →',
        stage: {kind: 'multiple-choice-stage-slot'},
        options: [
          {
            id: 'a',
            label: 'A **loop** — code the computer repeats.',
            isCorrect: true,
            feedback:
              "Yes! That's a **loop**. Write once, repeat many times.",
          },
          {
            id: 'b',
            label: 'Code that runs **one time** only.',
            isCorrect: false,
            feedback:
              "Look back at your music — your one block played the sound **four** times. Try again.",
          },
          {
            id: 'c',
            label: 'A block that plays a sound.',
            isCorrect: false,
            feedback:
              'The *sound* block plays a sound. The block we just learned **wraps** the sound block to play it over and over.',
          },
        ],
        allowRetry: true,
      },

      // ── Reflect on the loop. Stage = inviting prompt card. ───────────────
      {
        id: 'loop-reflect',
        kind: 'free-response',
        tutorMessage:
          'Quick think: what did the **repeat** block save you from doing? Type a sentence.',
        stage: {
          kind: 'reflection-invitation',
          prompt: 'The repeat block saved me from…',
        },
        placeholder: 'The repeat block saved me from…',
        acknowledgement:
          'Yes — it saved you from **repeating yourself**. ' +
          "Programmers even have a rule for it: *“don't repeat yourself.”* Loops are how we follow it.",
      },

      // ── Unplugged analogy for conditions. Sky → umbrella. ────────────────
      {
        id: 'cond-intro',
        kind: 'concept',
        tutorMessage:
          'Before school, how do you decide to bring an umbrella?\n\n' +
          "You don't bring it every day. You **check** the sky first.\n\n" +
          'That check has a name in code: a **condition**.',
        stage: {kind: 'condition-fork'},
      },

      // ── The maze. The student USES the idea before we name the blocks. ───
      {
        id: 'maze',
        kind: 'lab',
        tutorMessage:
          'Open **Maze Lab**. Get your character to the red flag.\n\n' +
          'This maze has a **turn**. You could count steps — but a count breaks if the maze changes.\n\n' +
          'Use a **plan** instead. Stuck? Ask me in chat.',
        stage: {kind: 'maze-lab', config: MAZE_LEVEL},
        continueLabel: 'I pressed Run and made it',
        successMessage:
          'Beautiful — 4 blocks, no counting!\n\n' +
          'And here is the cool part: those same 4 blocks would solve a **spiral** maze, ' +
          'or a **zig-zag** maze. Your code is a **plan**, not a list.',
        solutionCheck: {
          // If pegman actually reached the flag, accept any solution —
          // even hard-coded counting. The canonical loop+condition shape
          // is what we *teach*, but solving the maze by any means is a win
          // and the success message will still nudge them toward the
          // general "plan" idea on continue.
          acceptIf: 'maze-flag-caught',
          rules: [
            {
              kind: 'requires-block',
              type: 'maze_moveForward',
              hint: 'Your character has to **move** somehow. What block could you start with?',
              hintNudge:
                'Drag a **`move forward`** block under `when run` and press Run.',
            },
            {
              kind: 'requires-block',
              type: 'maze_untilBlockedOrNotClear',
              hint: "Pegman didn't reach the flag. What block tells him to keep going **until the flag**?",
              hintNudge:
                'Try wrapping your blocks in **`repeat until finished`** so pegman keeps going.',
            },
            {
              kind: 'requires-block',
              type: 'maze_ifElse',
              hint: 'The maze has a turn. How will pegman **decide** when to move and when to turn?',
              hintNudge:
                'You need an **`if path ahead / else`** block. Drop it inside the repeat.',
            },
            {
              kind: 'requires-block',
              type: 'maze_turn',
              hint: 'When the path is *blocked*, what should happen?',
              hintNudge:
                'Put **`turn right`** in the *else* branch (the bottom mouth).',
            },
          ],
        },
      },

      // ── Condition vocab — NAME the block they just used. ─────────────────
      {
        id: 'cond-vocab',
        kind: 'multiple-choice',
        tutorMessage:
          'You just used a block that **asked a question** every step. Which one was the **condition**? →',
        stage: {kind: 'multiple-choice-stage-slot'},
        options: [
          {
            id: 'a',
            label: '`if path ahead`',
            isCorrect: true,
            feedback:
              "Yes! `if path ahead` **asks** *“is there a path?”* every step. That's a **condition**.",
          },
          {
            id: 'b',
            label: '`move forward`',
            isCorrect: false,
            feedback:
              '`move forward` **does** something. A condition **asks** something. Try again.',
          },
          {
            id: 'c',
            label: '`turn right`',
            isCorrect: false,
            feedback:
              "Also a *doing* block. Look for the one that *asks*. **Conditions ask. Actions do.**",
          },
        ],
        allowRetry: true,
      },

      // ── Big idea — student articulates, tutor mirrors back. ──────────────
      {
        id: 'big-idea-elicit',
        kind: 'free-response',
        tutorMessage:
          'Stop. **Tell me** in your own words: what made those 4 maze blocks so powerful? One sentence.',
        stage: {
          kind: 'reflection-invitation',
          prompt: 'Those 4 blocks were powerful because…',
        },
        placeholder: 'Those 4 blocks were powerful because…',
        acknowledgement:
          "That's it. Your code wasn't a **list** of moves — it was a **plan**: " +
          '*“keep going if you can, turn if you can’t.”* Plans work in many mazes. Lists only work in one.',
      },

      // ── Datasci lab. ─────────────────────────────────────────────────────
      {
        id: 'datasci-lab',
        kind: 'lab',
        tutorMessage:
          "Same blocks idea, new world: the **Data Science Lab** has rows of student scores.\n\n" +
          'Find the **average score for grade-3 students**.\n\n' +
          'You already know both moves — one is a **condition** (pick the right rows), one is a **loop** (average them all). Press **Run**.',
        stage: {kind: 'datasci-lab', config: DATASCI_INTRO},
        continueLabel: 'I pressed Run',
        successMessage:
          'See it? **Filter = condition. Average = loop.** Same two ideas, new words.',
        solutionCheck: {
          rules: [
            {
              kind: 'requires-block',
              type: 'datasci_filter_grade',
              hint: 'We only care about **grade 3**. How can you tell the program to ignore every other row?',
              hintNudge:
                'Drag **`filter_grade(3)`** under `when run`. That is the **condition** step.',
            },
            {
              kind: 'requires-block',
              type: 'datasci_average',
              hint: 'After filtering, you still need *one number*. What block turns many scores into one?',
              hintNudge:
                'Add **`average(score)`** below your filter.',
            },
          ],
        },
      },

      // ── AI lab. ──────────────────────────────────────────────────────────
      {
        id: 'ai-trainer-lab',
        kind: 'lab',
        tutorMessage:
          'Last lab — the **AI Trainer**. A **sorter** decides what something is (like *friend* or *foe*).\n\n' +
          'Four to try:\n\n' +
          '- **majority** — guess the most common label.\n' +
          '- **copycat** — copy the closest example you’ve seen.\n' +
          '- **eyes rule** — *3 eyes? foe. else friend.*\n' +
          '- **size rule** — *big? foe. else friend.*\n\n' +
          'Pick one. Which sounds smartest? Try it and press **Run**.',
        stage: {kind: 'ai-trainer-lab', config: AI_TRAINER_INTRO},
        continueLabel: 'I tried it',
        successMessage:
          'Notice: every sorter is just a **condition** (its rule) being **looped** over rows. ' +
          'All the way down — same two ideas, every time.',
        solutionCheck: {
          rules: [
            {
              kind: 'min-count',
              types: ['aitrainer_predict', 'aitrainer_compare'],
              count: 1,
              hint: 'Which sorter do you think will guess best? Pick one and try it.',
              hintNudge:
                'Drag a **`predict using …`** block under `when run` and press Run.',
            },
          ],
        },
      },

      // ── Final reflect — student does the synthesis. ──────────────────────
      {
        id: 'final-reflect',
        kind: 'free-response',
        tutorMessage:
          'One last think. Which idea felt **hardest** today — **loops** or **conditions**? Tell me why.',
        stage: {
          kind: 'reflection-invitation',
          prompt: 'The hardest idea was… because…',
        },
        placeholder: 'The hardest idea was… because…',
        acknowledgement:
          'Thank you for telling me. Tough ideas now → easy code later. ' +
          "You just learned the **two ideas that show up everywhere** in programming.",
      },

      // ── Celebrate. ───────────────────────────────────────────────────────
      {
        id: 'wrap',
        kind: 'celebrate',
        tutorMessage:
          "That's the lesson. **Loops** repeat. **Conditions** decide. Together they make code that works in lots of places.",
        stage: {kind: 'lesson-celebrate'},
        summary: [
          'Made a sound play **4 times** — first the long way, then with a **loop**.',
          'Said what a **loop** is, in your own words.',
          'Solved a maze using a **plan**: `repeat until finished + if path ahead / else turn right`.',
          'Spotted the same code would solve any maze with the same shape.',
          'Found an average in the **Data** lab — filter + average = condition + loop.',
          'Tried an **AI** sorter — built from conditions and loops too.',
          'Picked which idea felt hardest. That is how it sticks.',
        ],
      },
    ],
  },
};

// ════════════════════════════════════════════════════════════════════════
//  Lesson #2: Intro to Classifiers — middle school (grades 6–8).
//  Standalone AI lesson using only the AI Trainer lab. Designed with two
//  reviewers' input (curriculum writer + practicing 7th-grade CS teacher).
//  Load-bearing moment: `compare-eyes-vs-size` — the side-by-side accuracy
//  numbers are where "features matter, some are distractors" lands.
//
//  Reviewer reorders applied:
//   - `accuracy-name` lands *before* the first lab run, so the word
//     "accuracy" is in the student's head when the first score appears.
//   - `compare-eyes-vs-size` comes *before* `size-trap-debrief` — show
//     the 100% vs 50% gap, then name the cherry-pick trap.
// ════════════════════════════════════════════════════════════════════════
LESSONS['intro-to-classifiers'] = {
  id: 'intro-to-classifiers',
  title: 'Teaching a Computer to Spot Friends and Foes',
  subtitle: 'Train, test, and compare four AI classifiers.',
  steps: [
    // ── Frame the journey. ────────────────────────────────────────────────
    {
      id: 'welcome',
      kind: 'concept',
      tutorMessage:
        "Hi! Today you'll teach a computer to tell **friends** from **foes**. " +
        "We'll try four different ways and pick the smartest one. Press **Continue**.",
      stage: {
        kind: 'note',
        title: "Today's lesson",
        body:
          'You will:\n\n' +
          '- Meet a tiny dataset of 12 creatures.\n' +
          '- Try **four classifiers** and score each one.\n' +
          '- Spot which **feature** the computer should actually pay attention to.',
      },
      continueLabel: "Let's go",
    },

    // ── Hook from lived experience. ───────────────────────────────────────
    {
      id: 'humans-classify',
      kind: 'multiple-choice',
      tutorMessage:
        'Your brain does this all day. Which question is a **classify** question? →',
      stage: {kind: 'multiple-choice-stage-slot'},
      options: [
        {
          id: 'a',
          label: '*Is that dog friendly or scary?*',
          isCorrect: true,
          feedback:
            "Yes! Two buckets, one guess. That's **classifying** — picking which group something belongs in.",
        },
        {
          id: 'b',
          label: '*How tall is that tree?*',
          isCorrect: false,
          feedback:
            "That's measuring a number, not picking a bucket. Classifying is bucket-picking.",
        },
        {
          id: 'c',
          label: '*What is 7 × 8?*',
          isCorrect: false,
          feedback:
            'Math problem — one right number, not a group pick. Try again.',
        },
      ],
      allowRetry: true,
    },

    // ── Introduce the dataset + the split. ────────────────────────────────
    {
      id: 'meet-creatures',
      kind: 'concept',
      tutorMessage:
        'Meet **12 creatures**. Each one has **eyes** (1 or 3) and a **size** ' +
        '(small or large).\n\n' +
        "We already know the labels for **6** of them — that's the " +
        '**training set**. The other 6 are the **test set**: we hid their ' +
        'labels on purpose.',
      stage: {
        kind: 'note',
        title: 'Training vs Test',
        body:
          '**Training set (6):** labels visible. We use these to **teach** the model.\n\n' +
          '**Test set (6):** labels hidden. We use these to **grade** the model.\n\n' +
          'The split is how we know the model **actually learned** — instead of just memorizing.',
      },
    },

    // ── Why hide test labels? (ELL-friendly phrasing.) ───────────────────
    {
      id: 'why-hide-test',
      kind: 'multiple-choice',
      tutorMessage: 'Why do we **hide** the test labels? →',
      stage: {kind: 'multiple-choice-stage-slot'},
      options: [
        {
          id: 'a',
          label: "So the computer can't peek and just **memorize** the answers.",
          isCorrect: true,
          feedback:
            "Exactly. If it sees the answers, we can't tell if it actually **learned** anything new.",
        },
        {
          id: 'b',
          label: 'Because labels are a secret.',
          isCorrect: false,
          feedback:
            "We know the labels — we just hide them from the model. It's about being **fair**, not secret.",
        },
        {
          id: 'c',
          label: 'To make the game harder.',
          isCorrect: false,
          feedback:
            "Close — but it's not about *hard*, it's about **fair**. Hidden answers = a real test.",
        },
      ],
      allowRetry: true,
    },

    // ── Name "accuracy" BEFORE they see a score (teacher reorder #1). ─────
    {
      id: 'accuracy-name',
      kind: 'multiple-choice',
      tutorMessage:
        "We're about to grade the model. What do we call **how often it gets the answer right**? →",
      stage: {kind: 'multiple-choice-stage-slot'},
      options: [
        {
          id: 'a',
          label: '**Accuracy**',
          isCorrect: true,
          feedback:
            'Yes! **Accuracy = right answers ÷ total.** Higher is better. Now let’s measure some.',
        },
        {
          id: 'b',
          label: 'Speed',
          isCorrect: false,
          feedback: 'Speed is *how fast*. We care about *how often right*.',
        },
        {
          id: 'c',
          label: 'Memory',
          isCorrect: false,
          feedback:
            "Memory is how much it stores. Accuracy is *how often it's right*.",
        },
      ],
      allowRetry: true,
    },

    // ── Lab 1: dumb baseline. Productive failure. ─────────────────────────
    {
      id: 'first-run-majority',
      kind: 'lab',
      tutorMessage:
        'Open the **AI Trainer**. Drag a **`predict`** block, pick **majority** ' +
        "from its dropdown, and press **Run**.\n\n*Majority* is a dumb baseline — " +
        "it just guesses the most common label, every time. Let's see how it does.",
      stage: {kind: 'ai-trainer-lab', config: AI_TRAINER_INTRO},
      continueLabel: 'I ran majority',
      successMessage:
        'See its score? It got some right by **luck**, not skill. ' +
        "Half-right on a 50/50 guess isn't learning. We can do *way* better.",
      solutionCheck: {
        rules: [
          {
            kind: 'min-count',
            types: ['aitrainer_predict', 'aitrainer_compare'],
            count: 1,
            hint: "I don't see a `predict` block under `when run` yet. What block lets the computer guess?",
            hintNudge:
              'Drag a **`predict`** block under `when run`, set its dropdown to **majority**, and press Run.',
          },
        ],
      },
    },

    // ── Lab 2: nearest-neighbor. The animation does the teaching. ─────────
    {
      id: 'try-nearest-neighbor',
      kind: 'lab',
      tutorMessage:
        'Now change your `predict` block to **nearest-neighbor**. Press **Run** ' +
        "and watch the **'How it works'** panel — it draws a **line** from each " +
        'test creature to the training creature it copied the label from.',
      stage: {kind: 'ai-trainer-lab', config: AI_TRAINER_INTRO},
      continueLabel: 'I watched the lines',
      successMessage:
        'Whoa — nearest-neighbor got way more right. It copies the **closest** ' +
        'known creature.\n\nLook at where the lines point. Notice anything about ' +
        'the *eyes*?',
      solutionCheck: {
        rules: [
          {
            kind: 'min-count',
            types: ['aitrainer_predict', 'aitrainer_compare'],
            count: 1,
            hint: 'Is there a `predict` block under `when run`? Which algorithm did you pick?',
            hintNudge:
              "Make sure a `predict` block is under `when run` with the dropdown on **nearest-neighbor**, then press Run.",
          },
        ],
      },
    },

    // ── Articulate what the visualization showed. ─────────────────────────
    {
      id: 'nn-noticing',
      kind: 'free-response',
      tutorMessage:
        'Look at the lines nearest-neighbor drew. What do **most of them** have in common? Type one sentence.',
      stage: {
        kind: 'reflection-invitation',
        prompt: 'Most of the lines connect creatures that…',
      },
      placeholder: 'Most of the lines connect creatures that…',
      acknowledgement:
        'Right — **same number of eyes**. Nearest-neighbor didn’t *know* the ' +
        'rule. It **accidentally found it** by copying close neighbors. Pretty cool.',
    },

    // ── Lab 3: size-rule. Productive failure: a rule that looks okay. ────
    {
      id: 'size-trap',
      kind: 'lab',
      tutorMessage:
        'Now try **size-rule**. The rule: *if large → foe, if small → friend.* ' +
        'Run it and see what accuracy you get.',
      stage: {kind: 'ai-trainer-lab', config: AI_TRAINER_INTRO},
      continueLabel: 'I ran size-rule',
      successMessage:
        'Notice the score: about **half right**. Look at *which ones* it got ' +
        'wrong — small foes and large friends. Size was tricking us.',
      solutionCheck: {
        rules: [
          {
            kind: 'min-count',
            types: ['aitrainer_predict', 'aitrainer_compare'],
            count: 1,
            hint: 'Did you set the `predict` block to **size-rule** before pressing Run?',
            hintNudge:
              'Click the dropdown on `predict`, choose **size-rule**, then press Run.',
          },
        ],
      },
    },

    // ── Lab 4: the side-by-side. THE LOAD-BEARING MOMENT. ────────────────
    //  (teacher reorder #2: compare BEFORE the debrief)
    {
      id: 'compare-eyes-vs-size',
      kind: 'lab',
      tutorMessage:
        'Time for a fair fight. Drag a **`compare`** block. Set A to ' +
        '**eyes-rule** and B to **size-rule**. Press **Run**.',
      stage: {kind: 'ai-trainer-lab', config: AI_TRAINER_INTRO},
      continueLabel: 'I compared them',
      successMessage:
        'Look at the accuracies side-by-side. **Eyes wins, every time.** ' +
        'Eyes is the *real* signal in the data — size was a **distractor**, ' +
        'a feature that *looked* useful but really wasn’t.',
      solutionCheck: {
        rules: [
          {
            kind: 'requires-block',
            type: 'aitrainer_compare',
            hint: 'You need a different block this time — one that runs TWO algorithms side-by-side. What might it be called?',
            hintNudge:
              'Drag the **`compare`** block in. Set A = **eyes-rule**, B = **size-rule**, then press Run.',
          },
        ],
      },
    },

    // ── Debrief AFTER the compare shows the gap. ─────────────────────────
    {
      id: 'size-trap-debrief',
      kind: 'multiple-choice',
      tutorMessage:
        'Size-rule got *some* right. Does that make size a **good** rule for friend-vs-foe? →',
      stage: {kind: 'multiple-choice-stage-slot'},
      options: [
        {
          id: 'a',
          label: 'No — it got the **right answer for the wrong reason** sometimes.',
          isCorrect: true,
          feedback:
            "Exactly! That's called **cherry-picking** — only counting the wins. " +
            'Real classifiers check **every** test creature — and eyes-rule beat size every time.',
        },
        {
          id: 'b',
          label: 'Yes — any right answer means the rule works.',
          isCorrect: false,
          feedback:
            "A broken clock is right twice a day. We want a rule that's right *most* of the time, for the *right reason*.",
        },
        {
          id: 'c',
          label: 'Yes — large things really are scarier.',
          isCorrect: false,
          feedback:
            "Look at the data again. Plenty of *small* creatures are foes too. Size isn't the real signal.",
        },
      ],
      allowRetry: true,
    },

    // ── Name the feature concept. ─────────────────────────────────────────
    {
      id: 'name-the-feature',
      kind: 'multiple-choice',
      tutorMessage:
        'Eyes and size are both **features** — facts the model can see about each creature. ' +
        'Which feature actually decides the label? →',
      stage: {kind: 'multiple-choice-stage-slot'},
      options: [
        {
          id: 'a',
          label: '**Eyes** — 3 eyes means foe, 1 eye means friend.',
          isCorrect: true,
          feedback:
            'Yes! Eyes is the **real feature**. Size was a **distractor** — it looked useful but wasn’t.',
        },
        {
          id: 'b',
          label: 'Size — large means foe.',
          isCorrect: false,
          feedback:
            'Your `compare` block just showed size got more wrong than eyes. Look again.',
        },
        {
          id: 'c',
          label: 'Both equally.',
          isCorrect: false,
          feedback:
            "The scores weren't tied — eyes-rule scored higher. Try again.",
        },
      ],
      allowRetry: true,
    },

    // ── Stretch: generalization. ──────────────────────────────────────────
    {
      id: 'generalization',
      kind: 'free-response',
      tutorMessage:
        'Imagine **100 new creatures** show up tomorrow. Would your eyes-rule still work? Why or why not?',
      stage: {
        kind: 'reflection-invitation',
        prompt: 'If 100 new creatures showed up…',
      },
      placeholder: 'If 100 new creatures showed up…',
      acknowledgement:
        'Great thinking. We *hope* it would — that’s called **generalization**. ' +
        'But our training set was tiny (only 6!). A rule learned from a small ' +
        'group can be **biased** — it might fail on creatures we’ve never seen.',
    },

    // ── Wrap. ─────────────────────────────────────────────────────────────
    {
      id: 'wrap',
      kind: 'celebrate',
      tutorMessage:
        'You just did real AI work — **trained**, **tested**, and **judged** four classifiers.',
      stage: {kind: 'lesson-celebrate'},
      summary: [
        'Split the data: **training** to teach, **test** to grade.',
        'Measured **accuracy** — right answers out of total.',
        'Watched **nearest-neighbor** quietly discover the eyes rule.',
        'Spotted the **cherry-pick trap**: size *looked* okay but wasn’t.',
        'Named the real **feature** (eyes) vs the **distractor** (size).',
        'Asked the big question: would my rule **generalize** to 100 new creatures?',
      ],
    },
  ],
};

// ════════════════════════════════════════════════════════════════════════
//  Lesson #3: AI for Oceans — middle school (grades 6–8).
//  Standalone lesson using the AI for Oceans lab. Teaches: labels, training
//  data, accuracy, bias, retraining, real-world ML labor. Two reviewers
//  agreed: `you-are-data` (step 4) is the load-bearing moment, `bias-reveal`
//  (step 10) is the gut-punch. Teacher's animation slot: `DataDietPlate`
//  runs *after* the bias-trap lab, *before* the MC — so the MC asks
//  "whose fault?" with the answer already visualized.
// ════════════════════════════════════════════════════════════════════════
LESSONS['ai-for-oceans'] = {
  id: 'ai-for-oceans',
  title: 'Teaching a Computer to Clean the Ocean',
  subtitle: 'Train an AI to spot fish vs trash — and watch what it learns from you.',
  steps: [
    {
      id: 'welcome',
      kind: 'concept',
      tutorMessage:
        "Hi! Today you'll teach a computer to tell **fish** from **trash** — " +
        'then send it out to clean a pond. Press **Continue**.',
      stage: {
        kind: 'note',
        title: "Today's job",
        body:
          '- Label some examples — *that is training data*.\n' +
          '- Watch the AI guess on new ones.\n' +
          '- Find out what tricks it. (Spoiler: **you** do.)',
      },
      continueLabel: "Let's go",
    },

    {
      id: 'human-sort',
      kind: 'multiple-choice',
      tutorMessage:
        'Before the computer tries, imagine **you** are sorting. Which one is a **label**? →',
      stage: {kind: 'multiple-choice-stage-slot'},
      options: [
        {
          id: 'a',
          label: '*"Fish"* or *"Not fish"* stuck on each picture.',
          isCorrect: true,
          feedback:
            'Yes! A **label** is the answer we attach to an example.',
        },
        {
          id: 'b',
          label: 'The color of the fish.',
          isCorrect: false,
          feedback:
            "That's a **feature** — a fact about it. A *label* is the answer.",
        },
        {
          id: 'c',
          label: 'How fast it swims.',
          isCorrect: false,
          feedback:
            'Another feature, not a label. Labels are the **answer** we want to teach.',
        },
      ],
      allowRetry: true,
    },

    {
      id: 'train-fishvtrash',
      kind: 'lab',
      tutorMessage:
        'Open the lab. A creature will pop up. Click **Fish** or **Not fish**. ' +
        'Do it about **15 times**, then press **Continue** in the lab.',
      stage: {kind: 'oceans-lab', appMode: 'fishvtrash'},
      continueLabel: 'I labeled my fish',
      successMessage:
        'Nice. Every click became a piece of **training data** — an example with a label attached.',
    },

    // Load-bearing: forces self-recognition as the source of the model.
    {
      id: 'you-are-data',
      kind: 'free-response',
      tutorMessage:
        'Stop. Where did the computer get its "knowledge" of fish? Type one sentence.',
      stage: {
        kind: 'reflection-invitation',
        prompt: 'The computer learned about fish from…',
      },
      placeholder: 'The computer learned about fish from…',
      acknowledgement:
        'Exactly — **from you**. Your clicks ARE the model’s whole world. ' +
        'If you had clicked differently, it would think differently.',
    },

    // Vocab AFTER the doing — stage shows the LabelBucket animation so the
    // word "training data" lands on the motion the student just lived.
    {
      id: 'label-vocab',
      kind: 'multiple-choice',
      tutorMessage: 'What do we call the whole set of examples you just made? →',
      stage: {kind: 'label-bucket'},
      options: [
        {
          id: 'a',
          label: 'The **training data**.',
          isCorrect: true,
          feedback:
            'Yes! **Training data = labeled examples we teach with.**',
        },
        {
          id: 'b',
          label: 'The computer code.',
          isCorrect: false,
          feedback: 'No code here — just your labels. Try again.',
        },
        {
          id: 'c',
          label: 'The answers.',
          isCorrect: false,
          feedback:
            'Each click *was* an answer — but the whole set has a specific name.',
        },
      ],
      allowRetry: true,
    },

    {
      id: 'pond-predict',
      kind: 'lab',
      tutorMessage:
        'Now send your AI to the **pond**. It will judge fish it has **never seen** ' +
        'using only what you taught it. Watch the score.',
      stage: {kind: 'oceans-lab', appMode: 'fishvtrash'},
      continueLabel: 'I watched the pond',
      successMessage:
        'That number is **accuracy** — how often it was right. It probably ' +
        'missed some. That is the interesting part.',
    },

    {
      id: 'accuracy-notice',
      kind: 'multiple-choice',
      tutorMessage: 'Why did the AI miss some pond fish? →',
      stage: {kind: 'multiple-choice-stage-slot'},
      options: [
        {
          id: 'a',
          label: 'Those fish looked **different** from the ones I trained it on.',
          isCorrect: true,
          feedback:
            'Yes. The pond has fish your training set never showed it. ' +
            'AI is only as smart as the examples it saw.',
        },
        {
          id: 'b',
          label: 'The computer is broken.',
          isCorrect: false,
          feedback:
            'Not broken — just **uninformed**. It only knows what you showed it.',
        },
        {
          id: 'c',
          label: 'Trash is hard.',
          isCorrect: false,
          feedback:
            'Trash is easy IF you trained on lots of kinds. Did you?',
        },
      ],
      allowRetry: true,
    },

    // Real-world tie-in. FeedMirror animation does the load-bearing work
    // here; a static note would land flat with middle schoolers.
    {
      id: 'real-world',
      kind: 'concept',
      tutorMessage:
        'Same trick runs your phone. **TikTok’s For You feed** is a classifier: ' +
        'every video you swipe past or watch is a **label** that trains it. ' +
        '**You** are its training data — every day.',
      stage: {kind: 'feed-mirror'},
    },

    // Bias trap. The instruction is the experiment: only label silver fish.
    {
      id: 'train-creatures',
      kind: 'lab',
      tutorMessage:
        'Round 2. New creatures — fish come in **lots of colors and shapes** now. ' +
        'Train it again — but **try only labeling the normal silver fish as "Fish."** ' +
        "We're running an experiment.",
      stage: {kind: 'oceans-lab', appMode: 'creaturesvtrash'},
      continueLabel: 'I trained on silver fish',
      successMessage:
        'Now look at the pond. Pay attention to the **neon, spotted, and weird** fish.',
    },

    // Teacher reorder: DataDietPlate runs *before* the MC, so the diagnosis
    // is visible when the MC asks "whose fault?". Recognition, not guessing.
    {
      id: 'bias-reveal',
      kind: 'multiple-choice',
      tutorMessage:
        'The AI called many real fish **trash** — neon ones, spotted ones. ' +
        'Whose fault is that? →',
      stage: {kind: 'data-diet-plate'},
      options: [
        {
          id: 'a',
          label: 'Mine — I only showed it **one kind** of fish.',
          isCorrect: true,
          feedback:
            'Yes. The AI learned *"fish = silver and normal"* because that is ' +
            '**all you showed it**. That is called **bias**.',
        },
        {
          id: 'b',
          label: "The AI's — it should know better.",
          isCorrect: false,
          feedback:
            'It can only know what you taught. You never showed it a neon fish.',
        },
        {
          id: 'c',
          label: 'The fish — they look weird.',
          isCorrect: false,
          feedback:
            'Real fish DO look weird. The AI just never learned that.',
        },
      ],
      allowRetry: true,
    },

    {
      id: 'bias-vocab',
      kind: 'concept',
      tutorMessage:
        '**Bias** is when training data leaves things out, so the AI gets a ' +
        '**lopsided** view of the world. Real AIs do this too — face apps that ' +
        'work better on some skin tones, voice apps that miss some accents. ' +
        'Same root cause: **the training data was not fair.**',
      stage: {
        kind: 'note',
        title: 'Bias',
        body:
          'Bias happens when training data **leaves people or things out**.\n\n' +
          'Fix: train on **all the kinds** you want the AI to handle.',
      },
    },

    {
      id: 'retrain-fix',
      kind: 'lab',
      tutorMessage:
        'Your turn to fix it. Go back and label **every kind** of fish as Fish — ' +
        'neon, spotted, weird shapes, all of them. Then check the pond again.',
      stage: {kind: 'oceans-lab', appMode: 'creaturesvtrash'},
      continueLabel: 'I trained on all kinds',
      successMessage:
        'Better, right? **More variety in → fairer AI out.** ' +
        'That is the whole trick. (Also the whole job of a lot of real AI workers.)',
    },

    {
      id: 'jobs-reflect',
      kind: 'free-response',
      tutorMessage:
        'Real fact: a huge part of AI work is **people labeling examples** — ' +
        'millions of them. Why do you think companies pay for that?',
      stage: {
        kind: 'reflection-invitation',
        prompt: 'Companies pay people to label data because…',
      },
      placeholder: 'Companies pay people to label data because…',
      acknowledgement:
        'Right. **No labels, no learning.** Better labels → better AI. ' +
        'Models don’t magically know things — people teach them, one example at a time.',
    },

    {
      id: 'wrap',
      kind: 'celebrate',
      tutorMessage:
        'You trained an AI, broke it, and fixed it. That is real ML.',
      stage: {kind: 'lesson-celebrate'},
      summary: [
        'Labeled fish vs trash — that is **training data**.',
        'Saw the model run on a **pond** it had never seen. That is **testing**.',
        'Measured **accuracy** — right answers out of total.',
        'Trained on only silver fish, watched the model **fail on neon ones** — **bias**.',
        'Fixed it by adding more variety. Fair data → fairer AI.',
        'Connected it to TikTok, photo apps, spam filters — same idea, everywhere.',
      ],
    },
  ],
};

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id];
}

export function getAvailableLessons(): Lesson[] {
  return Object.values(LESSONS);
}

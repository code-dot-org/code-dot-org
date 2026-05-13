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
    steps: [
      // ── Section 1: Welcome — set the goal and the arc. ───────────────────
      {
        id: 'welcome',
        kind: 'concept',
        tutorMessage:
          "Welcome! I'm your AI Tutor for today. Over the next few minutes we'll work " +
          'through two of the most powerful ideas in programming: **loops** and ' +
          '**conditions**.\n\n' +
          "Here's how we'll do it:\n\n" +
          '1. **Music Lab** — discover the *repeat* block.\n' +
          '2. **Maze Lab** — use repeat + `if path ahead` to navigate.\n' +
          '3. **Data + AI labs** — see the same ideas in totally different settings.\n\n' +
          "Ready? Hit **Continue** when you're set.",
        stage: {
          kind: 'note',
          title: 'Today’s lesson',
          body:
            "We'll learn two ideas you'll use in **every** programming language:\n\n" +
            '- **Loop** — a chunk of code that *repeats*.\n' +
            '- **Condition** — a yes/no question your code asks before doing something.\n\n' +
            'The labs change. The ideas stay the same.',
        },
      },

      // ── Section 2: Feel the pain. No loop, just repetition. ──────────────
      {
        id: 'music-no-loop',
        kind: 'lab',
        tutorMessage:
          "Let's start with the **Music Lab**.\n\n" +
          "Your first task is on purpose a little tedious. I want you to drag **four** " +
          "sound blocks under `when run`. (Same sound, same beat — just four of them.)\n\n" +
          'Press **Run** when you have them. Then come back here.',
        stage: {kind: 'music-lab'},
        continueLabel: 'Done — four sound blocks',
        successMessage:
          "Nice work. Now stop and notice something:\n\n" +
          "You wrote **four blocks** to play the same sound four times. What if I asked " +
          'for **40**? **400**?\n\n' +
          "Hold that thought.",
      },

      // ── Section 3: Vocab check. Lock in the definition. ──────────────────
      {
        id: 'loop-vocab',
        kind: 'multiple-choice',
        tutorMessage:
          "Quick check before we make your code shorter. Which of these best " +
          'describes a **loop**?',
        stage: {
          kind: 'note',
          title: 'Vocabulary check',
          body:
            'A **loop** is one of the two big ideas of today. Pick the answer that ' +
            'matches.',
        },
        options: [
          {
            id: 'a',
            label: 'A chunk of code that the computer repeats.',
            isCorrect: true,
            feedback:
              'Exactly. **Write once, repeat many times.** That’s the whole idea — and ' +
              "you'll see it everywhere from games to websites to AI models.",
          },
          {
            id: 'b',
            label: 'A line of code that runs one time.',
            isCorrect: false,
            feedback:
              "That's just a regular instruction. A loop is different — it's the part " +
              'that *repeats*.',
          },
          {
            id: 'c',
            label: 'A block that plays a sound.',
            isCorrect: false,
            feedback:
              'A sound block does *one thing*. A loop is the wrapper that can repeat ' +
              'any block — including a sound block — over and over.',
          },
        ],
        allowRetry: true,
      },

      // ── Section 4: Discover the loop. Shorter code, same result. ─────────
      {
        id: 'music-loop',
        kind: 'lab',
        tutorMessage:
          "Now the payoff. Look in the toolbox for a **`repeat`** block.\n\n" +
          "Try this:\n\n" +
          '1. Delete the four sound blocks.\n' +
          '2. Drag a **`repeat 4`** block under `when run`.\n' +
          '3. Drop **one** sound block *inside* it.\n' +
          '4. Press **Run**.\n\n' +
          "Same four sounds — but now your program is **half the size**.",
        stage: {kind: 'music-lab'},
        continueLabel: 'It works!',
        successMessage:
          "That’s a loop. One block (the `repeat`) does the work of however many copies " +
          "you would have written by hand.\n\n" +
          "Change `4` to `40` and the program still fits on one line.",
      },

      // ── Section 5: Reflect to anchor the concept. ────────────────────────
      {
        id: 'loop-reflect',
        kind: 'free-response',
        tutorMessage:
          'Quick reflection: in your own words, what did the **repeat** block save you ' +
          'from doing? A sentence is plenty.',
        stage: {
          kind: 'note',
          title: 'Reflect',
          body:
            'Writing it in your own words helps it stick. There’s no wrong answer.',
        },
        placeholder: 'The repeat block saved me from…',
        acknowledgement:
          "Yes — it saved you from **repeating yourself**. Programmers say *“don’t " +
          'repeat yourself.”* Loops are the main way you follow that rule.',
      },

      // ── Section 6: Set up the maze problem. Why loops alone aren't enough.
      {
        id: 'cond-intro',
        kind: 'concept',
        tutorMessage:
          "Now imagine a different problem. You're guiding a character through " +
          'a maze — but the maze has **a turn in the middle**.\n\n' +
          'You *could* write out every step:\n\n' +
          '```\n' +
          'move forward, move forward, move forward, move forward,\n' +
          'turn right,\n' +
          'move forward, move forward, move forward\n' +
          '```\n\n' +
          'But the second you change the maze — different lengths, different ' +
          'turn — this code breaks. We need something smarter.\n\n' +
          'That smarter thing is a **condition**: a yes/no question your code ' +
          'asks before deciding what to do.\n\n' +
          '- *“Is it raining?”* → take an umbrella.\n' +
          '- *“Is there a path ahead?”* → move forward, otherwise turn.\n\n' +
          'Pattern: **`if (question) { do this } else { do that }`**.',
        stage: {
          kind: 'note',
          title: 'A new tool: conditions',
          body:
            'A **condition** asks a yes/no question and chooses what to do.\n\n' +
            'Pair it with a loop and your code stops being a script for **one** ' +
            'situation — it becomes a **strategy** for many.',
        },
      },

      // ── Section 7: Vocab check — find the condition. ─────────────────────
      {
        id: 'cond-vocab',
        kind: 'multiple-choice',
        tutorMessage:
          'Quick check: which of these blocks is a **condition** (asks a ' +
          'question), not just an action (does something)?',
        stage: {
          kind: 'note',
          title: 'Which one is a condition?',
          body: 'Looking for the block that *asks*, not the one that *does*.',
        },
        options: [
          {
            id: 'a',
            label: '`if path ahead`',
            isCorrect: true,
            feedback:
              'Yes! `if path ahead` asks *“is there a path in front of me?”* ' +
              "and decides what to do based on the answer. That's a condition.",
          },
          {
            id: 'b',
            label: '`move forward`',
            isCorrect: false,
            feedback:
              '`move forward` is an **action** — it just does it. No question ' +
              'first.',
          },
          {
            id: 'c',
            label: '`turn right`',
            isCorrect: false,
            feedback:
              'Also an action. Conditions ask; actions do.',
          },
        ],
        allowRetry: true,
      },

      // ── Section 8: The maze. Loop + condition applied. ───────────────────
      {
        id: 'maze',
        kind: 'lab',
        tutorMessage:
          "Open the **Maze Lab** on the right. Your character (the pegman) " +
          'needs to reach the red flag.\n\n' +
          "Notice: the maze has an **L shape** — a turn in the middle. " +
          "Hardcoding `move forward × 4, turn right, move forward × 3` would " +
          'work, but the second you change the maze, the code breaks.\n\n' +
          "Instead, build the **strategy** we just talked about:\n\n" +
          '> *“Keep going until you finish. If there’s a path ahead, move ' +
          'forward. Otherwise, turn right.”*\n\n' +
          'In blocks:\n\n' +
          '1. Drag **`repeat until finished`** under `when run`.\n' +
          '2. Inside it, drop **`if path ahead / else`**.\n' +
          '3. Put **`move forward`** in the *if* branch.\n' +
          '4. Put **`turn right`** in the *else* branch.\n\n' +
          'Four blocks total. Press **Run**. Ask me if you get stuck.',
        stage: {kind: 'maze-lab', config: MAZE_LEVEL},
        continueLabel: 'It worked!',
        successMessage:
          'Beautiful. Four blocks just solved that maze **without you telling ' +
          'the pegman how many squares to move**.\n\n' +
          "Here's the cool part: those same four blocks would solve a *spiral* " +
          'maze, a *zig-zag* maze, any maze with the same shape — because your ' +
          "code doesn't describe *this maze*, it describes a **strategy**.",
      },

      // ── Section 9: Big idea concept. Anchor generalization. ──────────────
      {
        id: 'big-idea',
        kind: 'concept',
        tutorMessage:
          'Take a beat to notice what just happened.\n\n' +
          "You wrote **one** program, and it solved **multiple** mazes — even ones " +
          "you hadn’t seen yet. That’s the real power of these two ideas:\n\n" +
          "- **Loops** repeat the work, so you don't have to.\n" +
          "- **Conditions** decide what to do, so your code adapts.\n\n" +
          'Together: code that describes a *strategy*, not a specific situation.\n\n' +
          'Same ideas show up in **data**, **AI**, **games**, **websites** — ' +
          'everywhere. Let’s see two of those next.',
        stage: {
          kind: 'note',
          title: 'Big idea',
          body:
            '**Code that describes a strategy generalizes.**\n\n' +
            'Loops + conditions turn “solve this exact problem” into “solve any ' +
            'problem like this.”',
        },
      },

      // ── Section 13: Cross-domain — data. Filter is a condition on rows. ──
      {
        id: 'datasci-lab',
        kind: 'lab',
        tutorMessage:
          'Same Blockly workspace, brand new domain: the **Data Science Lab**.\n\n' +
          "You'll see a small dataset of students (grade + test score). Your goal: " +
          '**find the average score for grade-3 students**.\n\n' +
          'Strategy in English:\n\n' +
          '> *“Keep only the rows where grade = 3, then average their scores.”*\n\n' +
          'In blocks under `when run`:\n\n' +
          '1. Drop **`filter_grade(3)`** — that’s a **condition** on each row.\n' +
          '2. Then **`average(score)`** — like a loop that adds them all up.\n\n' +
          'Notice: **filter is a condition. Average is a loop.** Same ideas, new ' +
          'words.',
        stage: {kind: 'datasci-lab', config: DATASCI_INTRO},
        continueLabel: 'Got the average!',
        successMessage:
          'See it? **Filter = condition. Average = loop.** Different words, same ' +
          'two ideas you learned with the pegman.',
      },

      // ── Section 14: Cross-domain — AI. Train, evaluate, compare. ─────────
      {
        id: 'ai-trainer-lab',
        kind: 'lab',
        tutorMessage:
          "Last lab. The **AI Trainer**.\n\n" +
          'A *classifier* is a recipe a computer uses to guess a label (like “friend” ' +
          'or “foe”) for something it hasn’t seen before. You get four to try:\n\n' +
          '- **majority** — always pick whichever label is more common.\n' +
          '- **nearest neighbor** — look at the most similar training example and ' +
          'copy its label.\n' +
          '- **eyes rule** — *“if 3 eyes → foe, else friend.”*\n' +
          '- **size rule** — *“if large → foe, else friend.”*\n\n' +
          'Try each `predict using …` block. Then drag a `compare` block to pit two ' +
          'against each other.\n\n' +
          'Notice anything? Every classifier is just **conditions** (rules) being ' +
          '**looped** over rows of data.',
        stage: {kind: 'ai-trainer-lab', config: AI_TRAINER_INTRO},
        continueLabel: 'Tried them all',
        successMessage:
          "That's the loop of machine learning: **pick a model → evaluate it → " +
          'compare to alternatives**. And underneath every model? Loops and ' +
          'conditions. All the way down.',
      },

      // ── Section 15: Final reflection — anchor the abstraction. ───────────
      {
        id: 'final-reflect',
        kind: 'free-response',
        tutorMessage:
          'Last reflection. In your own words: **why** would the same four ' +
          'blocks you wrote also solve a *spiral* maze you’ve never seen?\n\n' +
          'One of the biggest ideas in programming is hiding in your answer — ' +
          'put it your way first.',
        stage: {
          kind: 'note',
          title: 'Reflect on the big idea',
          body:
            'Hint to yourself: think about what your code was really *saying*. ' +
            'Was it saying “go through *this* maze” — or something more general?',
        },
        placeholder: 'My code would work on other mazes because…',
        acknowledgement:
          'Here’s the punchline: your code didn’t describe *this maze*. It ' +
          'described a **strategy** — *“keep going if you can, turn right if ' +
          'you can’t.”* That strategy works on any maze with the same shape. ' +
          '**Generalization** is what makes one program useful in many ' +
          'situations.',
      },

      // ── Section 16: Celebrate. Summarize what they actually did. ─────────
      {
        id: 'wrap',
        kind: 'celebrate',
        tutorMessage:
          'That’s the lesson. **Loops** repeat. **Conditions** decide. Together, ' +
          'they turn code from instructions for one situation into strategies for ' +
          'many.\n\nHere’s what you did today:',
        stage: {
          kind: 'note',
          title: 'Lesson complete',
          body:
            'You moved through **four labs** in **one conversation** — no separate ' +
            'level pages, no leaving the chat. Same ideas, four domains.',
        },
        summary: [
          'Discovered the **repeat block** in the Music Lab — code got shorter.',
          'Reflected on what loops save you from: repeating yourself.',
          'Solved a maze with **`repeat until finished` + `if path ahead / else turn right`** — four blocks, no counting.',
          'Saw that the same code would generalize to *any* maze with the same shape.',
          'Saw the same ideas in **data**: filter = condition, average = loop.',
          'Saw them again in **AI**: every classifier is conditions looped over rows.',
          'Put the big idea in your own words — that’s what makes it stick.',
        ],
      },
    ],
  },
};

export function getLesson(id: string): Lesson | undefined {
  return LESSONS[id];
}

export function getAvailableLessons(): Lesson[] {
  return Object.values(LESSONS);
}

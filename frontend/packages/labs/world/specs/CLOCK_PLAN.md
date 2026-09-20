# What time it is

The engine has had `time` since the beginning and it answers a different
question: seconds since this WORLD started. That is the right number for a
cooldown, a tween and a respawn delay, and it cannot answer what DAY it is —
so every app idea whose point is _when_ was out of reach. A timer, an alarm, a
journal with dated entries, a streak, "due tomorrow", "you last opened this on
Tuesday" (specs/APPS.md).

## Two clocks, and why they stay two

`time` is a sum of deltas: sixty frames make a second of it however long they
really took, which is what makes a game replayable and what every cooldown is
measured against. `the time now` is what the machine says. A frame that took
two minutes of wall time moves them differently, and that is not a bug in
either — it is the difference between game time and real time, and the lab
would be lying to hide it behind one word.

Nothing was changed about `time`.

## Lent, not read

The engine half has no machine and no locale by design, so the clock arrives
the way the measuring tape and the browser's storage already do: the driver
hands one over at set-up (`World.useClock`), and this half never touches
`Date.now`.

A world nobody lent one sits at a FIXED moment — midnight on the first day of
2000, UTC (`core/clock`, `NO_CLOCK`). That is the opposite of what a driver
does and it is the point: a test, a rule demo and a check all run headless, and
a clock that answered the real time there would make every one of them differ
between runs — a demo strip drawn on a Tuesday and compared on a Wednesday. It
is also obviously not now, so a world that has quietly lost its clock says so
rather than looking plausible.

That is what lets the Notes play test assert a whole row: `2000-01-01  milk`.

## Seconds, and a number

SECONDS, because everything else in the lab is in seconds — a tick's delta,
`time`, a tween's duration, a cooldown. A learner subtracting two moments
should get an answer in the unit they already have, and milliseconds would make
every such subtraction wrong by a thousand.

A NUMBER, because a number is a thing this language already keeps, compares,
stores in a property and SAVES. "When did I last open this" needs no new type,
no new storage and no new block: it is `the time now` written into a world
property, and `save what the world remembers` already carries it
(specs/SAVING_PLAN.md).

## The zone is an argument, not a lookup

Splitting a moment into parts takes an offset — minutes to ADD to UTC, so New
York in winter is -300 and Berlin is +60. That is the sign a person writes, and
the opposite of `Date.getTimezoneOffset`; the driver flips it on the way in.

It is an argument rather than something the splitting reads, which is what
makes `core/clock` a pure module: every answer is a function of its arguments,
so it is tested without a browser, without a world, and without depending on
the timezone of whatever machine runs the tests.

## Three blocks

- `the time now` — seconds since 1970.
- `⟨the hour⟩ of ⟨…⟩` — one part, as a number. One block with a dropdown
  rather than seven blocks, because they are one idea asked seven ways.
  Months count from 1 and weekdays from Monday, so `if the month is 12` means
  December and the working week reads 1–5.
- `⟨…⟩ as ⟨a date⟩` — a moment as words.

The part and the text blocks take the MOMENT rather than assuming "now", so
the same blocks read a date a project saved. That is what a journal, a streak
and "due tomorrow" are made of.

**Not the browser's locale formatting**, which is the one decision worth
defending. A date a project saves is a key — a heading, a row it later looks
up — and locale formatting writes `20/09/2026` on one machine and `9/20/2026`
on another, so a project that filed entries by date would stop finding its own.
`a date` is year-month-day, which also sorts correctly as text, which is why
that order exists at all.

## One moment per frame

Sampled once at the top of `tick`, for the same reason `elapsed` is advanced
there. Two blocks a line apart must not land on opposite sides of a second: a
project that subtracted them would see time run backwards inside one frame.

## What it does not do

- **No timers.** A timer is three decisions — when it starts, what it does,
  whether it repeats — and this is none of them, exactly as `time` is not one.
  `the time now − when it started > 60` says it out of parts a learner has.
- **No date arithmetic.** "Three days from now" is `+ 3 × 86400`, which is
  true and unlovely, and wrong across a daylight-saving boundary. Nobody has
  asked yet; when they do it wants its own blocks rather than a bigger
  dropdown.
- **No parsing.** Words do not become a moment. A project that wants to read a
  date back keeps the NUMBER beside the words.
- **No alarms, no scheduling, no waking a world that is not running.**
- **Determinism is the project's to keep.** A world that reads the clock is
  not replayable, and a check over one would have to lend a fixed clock the
  way the headless default already is. No check does yet.

## Obligations

- `world_now`, `world_time_part`, `world_time_text` granted by a tile, or
  they are on nobody's shelf (`shelfCoverage.test`).
- The driver lends it, or the browser shows the year 2000.
- `clock.test` for the arithmetic, `worldClock.test` for the borrowing.

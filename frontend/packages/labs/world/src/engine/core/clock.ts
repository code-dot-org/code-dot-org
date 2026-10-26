// What time it is, as arithmetic.
//
// The engine has had `time` since the beginning and it answers the wrong
// question: seconds since the world STARTED, which is what a cooldown and a
// lifetime are measured in. An app asks a different one — what day is it, what
// hour, how long since the last entry — and nothing here could answer it
// (specs/CLOCK_PLAN.md).
//
// PURE, AND TAKING ITS OWN MOMENT. Nothing in this file reads the machine's
// clock: the moment arrives as a number and the zone arrives as an offset, so
// every answer is a function of its arguments and can be tested without a
// browser, a world or a fixed timezone on the runner. The World holds the
// borrowed clock; this is what it does with the number.
//
// SECONDS, NOT MILLISECONDS, because the rest of the lab is in seconds — a
// tick's delta, `time`, a tween's duration, a cooldown. A learner who
// subtracts two moments should get an answer in the same unit everything else
// uses, and milliseconds would make every such subtraction wrong by a
// thousand.

/** The parts of a moment, in whatever zone it was read in. */
export interface TimeParts {
  /** Four digits. */
  year: number;
  /** 1–12, because a learner counts January as one and so does a date. */
  month: number;
  /** 1–31. */
  day: number;
  /** 0–23. */
  hour: number;
  minute: number;
  second: number;
  /** 1–7, Monday first — the week as most of the world writes it. */
  weekday: number;
}

/** What `⟨…⟩ of the time` offers, in the order the dropdown lists them. */
export const TIME_PARTS = [
  'year',
  'month',
  'day',
  'hour',
  'minute',
  'second',
  'weekday',
] as const;

export type TimePart = (typeof TIME_PARTS)[number];

export const isTimePart = (value: unknown): value is TimePart =>
  typeof value === 'string' &&
  (TIME_PARTS as readonly string[]).includes(value);

/**
 * The moment a world with no clock lent to it is always at.
 *
 * FIXED RATHER THAN REAL, which is the opposite of what a driver does and is
 * deliberate. A headless world is what the tests, the rule demos and the check
 * system all run, and a clock that answered the real time there would make
 * every one of them differ between runs — a demo strip drawn on a Tuesday and
 * compared on a Wednesday. So the default is one moment, forever, and it is
 * obviously not now: midnight on the first day of 2000, UTC.
 */
export const NO_CLOCK = 946684800;

/**
 * Split a moment into the parts a project asks about.
 *
 * `offsetMinutes` is minutes to ADD to UTC to reach the zone being asked
 * about — so New York in winter is -300 and Berlin is +60. That is the sign
 * a person would write, and the opposite of `Date.getTimezoneOffset`, which
 * the driver flips on its way in (`runtime/driver`).
 *
 * Done by shifting the moment and reading it as UTC, so nothing here depends
 * on the zone the machine happens to be in — which is what makes it testable
 * at all.
 */
export function partsOf(seconds: number, offsetMinutes = 0): TimeParts {
  const at = new Date((Math.floor(seconds) + offsetMinutes * 60) * 1000);
  return {
    year: at.getUTCFullYear(),
    month: at.getUTCMonth() + 1,
    day: at.getUTCDate(),
    hour: at.getUTCHours(),
    minute: at.getUTCMinutes(),
    second: at.getUTCSeconds(),
    // `getUTCDay` is 0 for Sunday; this counts Monday as one, so Sunday is
    // seven and the working week reads 1–5.
    weekday: ((at.getUTCDay() + 6) % 7) + 1,
  };
}

/** One part of a moment — what the block reports. */
export const partOf = (
  seconds: number,
  part: TimePart,
  offsetMinutes = 0,
): number => partsOf(seconds, offsetMinutes)[part];

/** How `the time as text` may be written. */
export const TIME_STYLES = ['date', 'clock', 'both'] as const;
export type TimeStyle = (typeof TIME_STYLES)[number];

const pad = (value: number, width = 2): string =>
  String(Math.abs(value)).padStart(width, '0');

/**
 * A moment as words.
 *
 * ONE SHAPE PER STYLE, and not the browser's locale formatting. A date a
 * project SAVES has to read back the same way on another machine — it is a
 * key, a filename, a line in a list — and a locale-formatted one would be
 * `20/09/2026` on one and `9/20/2026` on another. `date` is therefore
 * year-month-day, which also sorts correctly as text, which is the whole
 * reason anybody chose that order.
 */
export function timeText(
  seconds: number,
  style: TimeStyle = 'date',
  offsetMinutes = 0,
): string {
  const at = partsOf(seconds, offsetMinutes);
  const date = `${pad(at.year, 4)}-${pad(at.month)}-${pad(at.day)}`;
  const clock = `${pad(at.hour)}:${pad(at.minute)}`;
  if (style === 'date') {
    return date;
  }
  return style === 'clock' ? clock : `${date} ${clock}`;
}

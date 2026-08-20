// Folding a flood of console lines.
//
// Pulled out of the provider because it is the half worth testing: the
// buffering there is about WHEN state changes, and this is about what the
// console ends up saying. A game that logs every frame said one sentence five
// hundred times and pushed everything else off the top.

/** One line the console shows. */
export interface ConsoleLine {
  level: string;
  text: string;
  /**
   * How many times in a row this line was said. Absent means once.
   *
   * A game says things sixty times a second, and five hundred identical lines
   * are worth less than one line and a count.
   */
  repeats?: number;
}

/** The most lines the console keeps. */
export const MAX_CONSOLE_LINES = 500;

/**
 * Fold consecutive identical lines into one with a count.
 *
 * A step that logs every frame fills five hundred lines with one sentence and
 * pushes everything a learner might have wanted to read off the top. One line
 * saying it happened four hundred times keeps the sentence AND what came
 * before it.
 *
 * Only CONSECUTIVE ones: two identical lines with something between them are
 * two things that happened, and merging them would rewrite the order of
 * events, which is most of what a console is for.
 */
export function collapseConsole(lines: ConsoleLine[]): ConsoleLine[] {
  const folded: ConsoleLine[] = [];
  for (const line of lines) {
    const last = folded[folded.length - 1];
    if (last && last.level === line.level && last.text === line.text) {
      folded[folded.length - 1] = {
        ...last,
        repeats: (last.repeats ?? 1) + (line.repeats ?? 1),
      };
      continue;
    }
    folded.push(line);
  }
  return folded.slice(-MAX_CONSOLE_LINES);
}

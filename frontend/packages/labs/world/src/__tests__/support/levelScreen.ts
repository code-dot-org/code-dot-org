// A test's game as a Main Screen with the level on it and no Viewport: one
// space, which is what a test about an actor or a rule plays in.

/**
 * The `main.screen` whose code is `workspace` — rows under `when this screen
 * loads`, handlers beside it — and whose own data is `data` (`properties`,
 * `events`, `theme`, `actors`, …).
 */
export const levelScreen = (
  workspace: {blocks?: object; variables?: unknown[]} = {},
  data: Record<string, unknown> = {},
): string =>
  JSON.stringify({
    type: 'map',
    name: 'Main',
    actors: [],
    ...data,
    blocks: workspace,
  });

// A slug is the catalog's public name for a widget (`widgets/<slug>/`), and
// must satisfy WidgetManifestSchema's slug pattern. `toolName` is
// agent-chosen (systemPrompt.ts) and not unique by construction — two
// lessons can plausibly both want `check_understanding` — so minting always
// checks for a collision; see checkSlugCollision.

/** `pick_your_blocks` -> `pick-your-blocks`. Never empty: falls back to `widget`. */
export function mintSlug(toolName: string): string {
  const slug = toolName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return slug.length > 0 ? slug : 'widget';
}

export type SlugCollisionResult =
  | {ok: true; slug: string}
  | {ok: false; reason: string; suggestion: string};

/**
 * Refuses a collision rather than silently renaming (widget PR flow plan,
 * §3.2 and risk #6): the author picked `toolName`, and a different slug
 * changes what a lesson would reference. The suggestion is offered, not
 * applied.
 */
export function checkSlugCollision(
  slug: string,
  existingSlugs: readonly string[],
): SlugCollisionResult {
  if (!existingSlugs.includes(slug)) {
    return {ok: true, slug};
  }
  let n = 2;
  while (existingSlugs.includes(`${slug}-${n}`)) {
    n += 1;
  }
  return {
    ok: false,
    reason: `a widget named "${slug}" already exists in the catalog`,
    suggestion: `${slug}-${n}`,
  };
}

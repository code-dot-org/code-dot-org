// A level name is a one-way door (writeback plan doc §2.7 / risk list):
// it's referenced by name from .script_json, i18n keys and progress data
// once it ships. This module never silently rewrites an author's own typed
// name — it only sanitizes an ALGORITHMIC default (never shown as "the
// name" until the author accepts it) and validates an explicit one,
// rejecting rather than mutating.
//
// Level#validates :name, length: {within: 1..70} (dashboard/app/models/
// levels/level.rb) is the hard limit; real filenames commonly contain
// spaces and mixed case (measured: 34946 of 63754 *.level names under
// dashboard/config/levels contain a space), so this deliberately does not
// slugify.

export const MAX_LEVEL_NAME_LENGTH = 70;

// LevelLoader redirects any name with this prefix to test/ui/config/levels
// instead of dashboard/config (writeback plan doc §1.1) — write-back refuses
// rather than redirecting (§2.7), since it never writes outside
// dashboard/config/**.
const UI_TEST_PREFIX = 'UI Test ';

/**
 * An always-succeeding default, derived from the level's authored title.
 * Never shown to the loader — a create's actual name always comes from
 * uniqueDefaultLevelName (further below) or an author override, both of
 * which route this through validation before it lands in a file path.
 */
export function sanitizeDefaultLevelName(title: string | undefined): string {
  // eslint-disable-next-line no-control-regex -- matching literal control characters is the point: illegal in a filename, same as a slash.
  let name = (title ?? '').replace(/[\\/\x00-\x1f]/g, '').trim();
  if (name.length === 0) {
    name = 'Untitled maze level';
  }
  if (name.length > MAX_LEVEL_NAME_LENGTH) {
    name = name.slice(0, MAX_LEVEL_NAME_LENGTH).trim();
  }
  return name;
}

export type LevelNameValidation = {ok: true} | {ok: false; reason: string};

/** Validates a name an author typed into the write-back dialog — rejected,
 * never rewritten, so the dialog can show exactly why and let them retype. */
export function validateExplicitLevelName(name: string): LevelNameValidation {
  const trimmed = name.trim();
  if (trimmed.length === 0) {
    return {ok: false, reason: 'a level name cannot be empty'};
  }
  if (trimmed.length > MAX_LEVEL_NAME_LENGTH) {
    return {
      ok: false,
      reason: `a level name must be ${MAX_LEVEL_NAME_LENGTH} characters or fewer (this one is ${trimmed.length})`,
    };
  }
  // eslint-disable-next-line no-control-regex -- see sanitizeDefaultLevelName.
  if (/[\\/]/.test(trimmed) || /[\x00-\x1f]/.test(trimmed)) {
    return {
      ok: false,
      reason: 'a level name cannot contain a slash or a control character',
    };
  }
  if (trimmed.startsWith(UI_TEST_PREFIX)) {
    return {
      ok: false,
      reason: `a level name cannot start with "${UI_TEST_PREFIX}" — that prefix is reserved for test/ui/config, which write-back never writes to`,
    };
  }
  return {ok: true};
}

/**
 * Bumps `base` with a trailing " N" until it misses every name in
 * `existingLower` (already-lowercased *.level basenames, repo-wide — see
 * levelNames.ts). Only used for the algorithmic default: an author-typed
 * name that collides is reported as an error instead (validateExplicitLevelName's
 * caller in plan.ts), never silently renamed out from under them.
 *
 * The bump is a bare " 2", " 3", ... suffix — the same convention real
 * filenames already use for sibling exercises ("2-3 Bee Conditionals 1",
 * "... 2", ...), and deliberately NOT one LevelCatalog's own family grouping
 * would collapse: parseLevelFamilyKey only strips `-`/`_`-delimited suffixes,
 * never a bare space+digits one.
 */
export function uniqueDefaultLevelName(
  base: string,
  existingLower: ReadonlySet<string>,
): string {
  if (!existingLower.has(base.toLowerCase())) {
    return base;
  }
  for (let n = 2; ; n++) {
    const suffix = ` ${n}`;
    const truncatedBase =
      base.length + suffix.length > MAX_LEVEL_NAME_LENGTH
        ? base.slice(0, MAX_LEVEL_NAME_LENGTH - suffix.length)
        : base;
    const candidate = `${truncatedBase}${suffix}`;
    if (!existingLower.has(candidate.toLowerCase())) {
      return candidate;
    }
  }
}

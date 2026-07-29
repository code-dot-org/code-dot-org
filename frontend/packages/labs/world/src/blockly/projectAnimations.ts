// Scans the flattened project for animation files — `.anim` (JSON on disk)
// discriminated by `type: "animation"` (INTERFACE.md §Animations) — and returns
// the animation ids defined across them. Feeds the `world_play_animation`
// dropdown so a learner can pick an animation they authored, not just the stock
// ones.

export function projectAnimationIds(files: Record<string, string>): string[] {
  const ids: string[] = [];
  for (const [path, contents] of Object.entries(files)) {
    if (!path.endsWith('.anim')) {
      continue;
    }
    try {
      const parsed: unknown = JSON.parse(contents);
      if (
        typeof parsed === 'object' &&
        parsed !== null &&
        (parsed as {type?: unknown}).type === 'animation'
      ) {
        const animations = (parsed as {animations?: unknown}).animations;
        if (typeof animations === 'object' && animations !== null) {
          ids.push(...Object.keys(animations));
        }
      }
    } catch {
      // Not valid JSON (or not an animation file); ignore.
    }
  }
  return [...new Set(ids)];
}

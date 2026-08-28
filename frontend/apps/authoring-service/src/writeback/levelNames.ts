// The uniqueness check a new level's name needs, per the writeback plan
// doc's own risk list: LevelCatalog only scans 4 of the ~35 directories under
// dashboard/config/levels/custom (fish/music/standalone_video/maze), but
// Policies::LevelFiles.level_file_path globs config/levels/**/<name>.level
// and RAISES on two files sharing a name — so a name unique among the four
// scanned directories can still collide with one of the other ~59k files.
// This walks the whole dashboard/config/levels tree, names only (never file
// contents), matching that same glob.

import fs from 'node:fs';
import path from 'node:path';

/** Every `.level` file's basename (without extension), lowercased for a
 * case-insensitive comparison — Level's own uniqueness validation is
 * `case_sensitive: false` (dashboard/app/models/levels/level.rb). */
export function listAllLevelFileNames(repoRoot: string): Set<string> {
  const root = path.join(repoRoot, 'dashboard', 'config', 'levels');
  const names = new Set<string>();
  const stack = [root];
  while (stack.length > 0) {
    const dir = stack.pop()!;
    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(dir, {withFileTypes: true});
    } catch {
      continue;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        stack.push(full);
      } else if (entry.isFile() && entry.name.endsWith('.level')) {
        names.add(entry.name.slice(0, -'.level'.length).toLowerCase());
      }
    }
  }
  return names;
}

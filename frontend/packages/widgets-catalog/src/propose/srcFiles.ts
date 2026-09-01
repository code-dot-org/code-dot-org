import fs from 'node:fs';
import path from 'node:path';

import type {GitFile} from './gitPlumbing.js';

/** Every file under `dir`, as repo-file-content pairs relative to `dir`
 * itself (forward-slash joined regardless of platform) — a widget's `src/`
 * tree, read once here and copied verbatim by every propose target.
 * Shared by the authoring-service endpoint and the `widgets:propose` CLI so
 * the two can never disagree about what "the widget's source" means. */
export function readSrcFiles(dir: string, relPrefix = ''): GitFile[] {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  const files: GitFile[] = [];
  for (const entry of entries) {
    const rel = relPrefix ? `${relPrefix}/${entry.name}` : entry.name;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...readSrcFiles(full, rel));
    } else if (entry.isFile()) {
      files.push({path: rel, content: fs.readFileSync(full, 'utf8')});
    }
  }
  return files;
}

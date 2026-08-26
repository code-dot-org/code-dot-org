import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

/** `frontend/apps/authoring-service/` — the directory this app is installed in. */
export const APP_DIR = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
);

/** `frontend/` — two levels up; holds the gitignored `.authoring/` session tree. */
export const FRONTEND_ROOT = path.resolve(APP_DIR, '..', '..');

/**
 * Repository root — five levels up. Verified rather than assumed, because the
 * course import reads real Levelbuilder serializations from `dashboard/config`
 * and a silently wrong root would look like an empty curriculum.
 */
export function resolveRepoRoot(appDir: string = APP_DIR): string {
  const root = path.resolve(appDir, '..', '..', '..');
  const marker = path.join(root, 'dashboard', 'config');
  if (!fs.existsSync(marker)) {
    throw new Error(
      `[authoring-service] expected the repo root at ${root}, but ${marker} ` +
        'does not exist; the Levelbuilder import cannot run',
    );
  }
  return root;
}

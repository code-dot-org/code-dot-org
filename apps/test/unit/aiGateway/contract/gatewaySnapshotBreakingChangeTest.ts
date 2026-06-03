/**
 * AI Gateway Snapshot Breaking Change Guard
 *
 * Compares committed snapshot files against their staging-branch equivalents
 * and fails if any HARD_BREAKING changes are present without a _warnings entry
 * (i.e. without having gone through `FORCE_BREAKING=1 yarn update-ai-gateway-schema-snapshots`).
 *
 * This closes the gap where a developer manually edits a snapshot JSON to match
 * a schema change and bypasses the update script's guardrails entirely.
 *
 * Runs in CI (yarn test:unit) and can be run locally before committing.
 */

import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';

import {
  detectChanges,
  type JsonSchema,
} from '@cdo/apps/aiGateway/contract/schemaChangeDetector';

const SNAPSHOT_DIR = path.resolve(
  __dirname,
  '../../../../src/aiGateway/contract/schemaSnapshots'
);

const BASE_REF = 'origin/staging';

function getSnapshotFromBase(relativePath: string): JsonSchema | null {
  try {
    const raw = execSync(`git show ${BASE_REF}:${relativePath}`, {
      encoding: 'utf8',
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return JSON.parse(raw) as JsonSchema;
  } catch {
    // File doesn't exist on base branch — this is a new snapshot, no check needed
    return null;
  }
}

function stripMeta(schema: JsonSchema): JsonSchema {
  const {_warnings, _status, ...rest} = schema as JsonSchema & {
    _warnings?: unknown;
    _status?: unknown;
  };
  void _warnings;
  void _status;
  return rest;
}

describe('AI Gateway snapshot breaking change guard', () => {
  const snapshotFiles = fs
    .readdirSync(SNAPSHOT_DIR)
    .filter(f => f.endsWith('.json'));

  snapshotFiles.forEach(filename => {
    it(`${filename} — no unacknowledged HARD_BREAKING changes vs ${BASE_REF}`, () => {
      const absolutePath = path.join(SNAPSHOT_DIR, filename);
      const repoRelativePath = path.relative(
        path.resolve(__dirname, '../../../../..'),
        absolutePath
      );

      const baseSnapshot = getSnapshotFromBase(repoRelativePath);
      if (baseSnapshot === null) {
        // New file — no base to compare against, skip
        return;
      }

      const currentRaw = JSON.parse(
        fs.readFileSync(absolutePath, 'utf8')
      ) as JsonSchema & {_warnings?: string[]};

      const changes = detectChanges(
        stripMeta(baseSnapshot),
        stripMeta(currentRaw)
      );

      const hardBreaking = changes.filter(c => c.kind === 'HARD_BREAKING');
      if (hardBreaking.length === 0) return;

      const warnings: string[] = currentRaw._warnings ?? [];
      const acknowledgedPaths = new Set(
        warnings.map(w => {
          // Extract the path from the warning message, e.g.
          // "FORCE_BREAKING on ...: 'root.usage' changed from..."
          const match = w.match(/'([^']+)'/);
          return match ? match[1] : '';
        })
      );

      const unacknowledged = hardBreaking.filter(
        c => !acknowledgedPaths.has(c.path)
      );

      if (unacknowledged.length > 0) {
        throw new Error(
          `HARD_BREAKING changes in ${filename} were not acknowledged via FORCE_BREAKING.\n` +
            `Either create a new schema version or run:\n` +
            `  FORCE_BREAKING=1 yarn update-ai-gateway-schema-snapshots\n\n` +
            unacknowledged.map(c => `  • ${c.description}`).join('\n')
        );
      }
    });
  });
});

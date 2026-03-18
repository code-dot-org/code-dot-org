/**
 * AI Gateway Schema Contract Tests
 *
 * These tests guard against unintended drift or breaking changes to the
 * gateway's wire-format schemas. Each versioned schema is compared against a
 * committed JSON snapshot.
 *
 * Failure modes:
 *   - Missing snapshot      → run `yarn update-ai-gateway-schema-snapshots`
 *   - HARD_BREAKING change  → create a new schema version instead
 *   - UNKNOWN_NARROWING     → create a new version; if you are **absolutely**
 *                             certain, run with FORCE=1
 *   - Snapshot drift        → run `yarn update-ai-gateway-schema-snapshots`
 *                             (non-breaking / additive change)
 */

import fs from 'fs';
import path from 'path';

import {zodToJsonSchema} from 'zod-to-json-schema';

import {ALL_GATEWAY_SCHEMA_GROUPS} from '@cdo/apps/aiGateway/gatewaySchemas';
import {
  detectChanges,
  type JsonSchema,
} from '@cdo/apps/aiGateway/schemaChangeDetector';

const SNAPSHOT_DIR = path.resolve(
  __dirname,
  '../../../src/aiGateway/schemaSnapshots'
);

function snapshotPath(groupName: string, version: number | string): string {
  return path.join(SNAPSHOT_DIR, `${groupName}V${version}.json`);
}

function loadSnapshot(
  groupName: string,
  version: number | string
): JsonSchema | null {
  const p = snapshotPath(groupName, version);
  if (!fs.existsSync(p)) return null;
  const raw = JSON.parse(fs.readFileSync(p, 'utf8')) as JsonSchema;
  // Strip update-script metadata before comparison
  const {_warnings, ...schema} = raw;
  void _warnings;
  return schema;
}

describe('AI Gateway schema contracts', () => {
  Object.entries(ALL_GATEWAY_SCHEMA_GROUPS).forEach(([groupName, schemas]) => {
    describe(groupName, () => {
      Object.entries(schemas).forEach(([version, zodSchema]) => {
        it(`V${version} matches committed snapshot`, () => {
          const current = zodToJsonSchema(zodSchema) as JsonSchema;
          const snapshot = loadSnapshot(groupName, version);

          // ── Missing snapshot ───────────────────────────────────────────
          if (snapshot === null) {
            throw new Error(
              `No snapshot found for ${groupName} V${version}.\n` +
                `Run: yarn update-ai-gateway-schema-snapshots`
            );
          }

          const changes = detectChanges(snapshot, current);

          // ── Hard breaking ──────────────────────────────────────────────
          const hardBreaking = changes.filter(c => c.kind === 'HARD_BREAKING');
          if (hardBreaking.length > 0) {
            throw new Error(
              `HARD BREAKING changes detected in ${groupName} V${version}.\n` +
                `Create a new schema version instead of modifying this one.\n\n` +
                hardBreaking.map(c => `  • ${c.description}`).join('\n')
            );
          }

          // ── Unknown narrowing ──────────────────────────────────────────
          const narrowing = changes.filter(c => c.kind === 'UNKNOWN_NARROWING');
          if (narrowing.length > 0) {
            throw new Error(
              `UNKNOWN NARROWING detected in ${groupName} V${version}.\n` +
                `An unconstrained field has been given a concrete type.\n` +
                `Prefer creating a new schema version.\n` +
                `If you are **absolutely** certain this is intentional, run:\n` +
                `  FORCE=1 yarn update-ai-gateway-schema-snapshots\n\n` +
                narrowing.map(c => `  • ${c.description}`).join('\n')
            );
          }

          // ── Additive drift (snapshot out of date) ─────────────────────
          const hasChanges = changes.length > 0;
          if (hasChanges) {
            throw new Error(
              `Snapshot for ${groupName} V${version} is out of date (non-breaking changes detected).\n` +
                `Run: yarn update-ai-gateway-schema-snapshots\n\n` +
                changes.map(c => `  • [${c.kind}] ${c.description}`).join('\n')
            );
          }

          // ── Exact equality guard ───────────────────────────────────────
          // Catches any structural differences the detector doesn't classify
          // (e.g. ordering, unknown keys in the JSON schema output).
          expect(current).toEqual(snapshot);
        });
      });
    });
  });
});

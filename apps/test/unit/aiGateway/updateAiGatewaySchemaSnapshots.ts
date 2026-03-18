/**
 * AI Gateway Schema Snapshot Update Script
 *
 * This file is NOT part of the normal test suite (it does not match *Test.ts).
 * Run it explicitly via:
 *
 *   yarn update-ai-gateway-schema-snapshots
 *
 * Flags:
 *   FORCE=1   Allow UNKNOWN_NARROWING changes (a previously unconstrained
 *             field is being given a concrete type). Use only when you are
 *             **absolutely** certain the narrowing is intentional and safe.
 *             The snapshot will be annotated with a _warnings entry that will
 *             appear in the PR diff to prompt reviewer scrutiny.
 *
 * HARD_BREAKING changes are always refused — create a new schema version.
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

const FORCE = process.env.FORCE === '1';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function snapshotPath(groupName: string, version: number | string): string {
  return path.join(SNAPSHOT_DIR, `${groupName}V${version}.json`);
}

function loadExistingSnapshot(p: string): JsonSchema | null {
  if (!fs.existsSync(p)) return null;
  return JSON.parse(fs.readFileSync(p, 'utf8')) as JsonSchema;
}

function writeSnapshot(p: string, schema: JsonSchema): void {
  fs.mkdirSync(path.dirname(p), {recursive: true});
  fs.writeFileSync(p, JSON.stringify(schema, null, 2) + '\n', 'utf8');
}

// ---------------------------------------------------------------------------
// Core update logic (exported for testing)
// ---------------------------------------------------------------------------

export type UpdateOutcome =
  | {status: 'created'}
  | {status: 'up_to_date'}
  | {status: 'updated'; changes: string[]}
  | {status: 'force_updated'; warnings: string[]}
  | {status: 'refused_hard_breaking'; errors: string[]}
  | {status: 'refused_narrowing'; errors: string[]};

export function computeUpdate(
  groupName: string,
  version: number | string,
  currentSchema: JsonSchema,
  existingSnapshot: JsonSchema | null,
  force: boolean
): UpdateOutcome {
  // No existing snapshot — safe to create
  if (existingSnapshot === null) {
    return {status: 'created'};
  }

  // Strip _warnings metadata before diffing
  const {_warnings: _w, ...snapshotSchema} = existingSnapshot;
  void _w;

  const changes = detectChanges(snapshotSchema as JsonSchema, currentSchema);

  if (changes.length === 0) {
    return {status: 'up_to_date'};
  }

  const hardBreaking = changes.filter(c => c.kind === 'HARD_BREAKING');
  const narrowing = changes.filter(c => c.kind === 'UNKNOWN_NARROWING');

  // Hard breaking — always refused
  if (hardBreaking.length > 0) {
    return {
      status: 'refused_hard_breaking',
      errors: hardBreaking.map(c => c.description),
    };
  }

  // Unknown narrowing — refused unless FORCE=1
  if (narrowing.length > 0 && !force) {
    return {
      status: 'refused_narrowing',
      errors: narrowing.map(c => c.description),
    };
  }

  if (narrowing.length > 0 && force) {
    const warnings = narrowing.map(
      c =>
        `FORCED unknown narrowing on ${new Date()
          .toISOString()
          .slice(0, 10)}: ` +
        `${c.description} — scrutinize this change carefully in PR review`
    );
    return {status: 'force_updated', warnings};
  }

  // Pure additive changes
  return {
    status: 'updated',
    changes: changes.map(c => c.description),
  };
}

// ---------------------------------------------------------------------------
// Main runner (wrapped in a Jest test so it runs via the Jest infrastructure)
// ---------------------------------------------------------------------------

describe('update AI Gateway schema snapshots', () => {
  it('writes snapshots for all schema versions', () => {
    if (FORCE) {
      console.warn(
        '\n⚠️  FORCE=1 is set. UNKNOWN_NARROWING changes will be written to\n' +
          '   snapshots with a _warnings annotation. Make sure you know what\n' +
          '   you are doing and that reviewers scrutinize the diff carefully.\n'
      );
    }

    let hadError = false;

    Object.entries(ALL_GATEWAY_SCHEMA_GROUPS).forEach(
      ([groupName, schemas]) => {
        Object.entries(schemas).forEach(([version, zodSchema]) => {
          const label = `${groupName} V${version}`;
          const p = snapshotPath(groupName, version);
          const currentSchema = zodToJsonSchema(zodSchema) as JsonSchema;
          const existing = loadExistingSnapshot(p);

          const outcome = computeUpdate(
            groupName,
            version,
            currentSchema,
            existing,
            FORCE
          );

          switch (outcome.status) {
            case 'created':
              writeSnapshot(p, currentSchema);
              console.log(`  ✅  ${label}: created`);
              break;

            case 'up_to_date':
              console.log(`  ✓   ${label}: up to date`);
              break;

            case 'updated':
              writeSnapshot(p, currentSchema);
              console.log(`  ✅  ${label}: updated (additive changes)`);
              outcome.changes.forEach(d => console.log(`       • ${d}`));
              break;

            case 'force_updated': {
              const withWarnings: JsonSchema = {
                _warnings: outcome.warnings,
                ...currentSchema,
              };
              writeSnapshot(p, withWarnings);
              console.warn(
                `  ⚠️   ${label}: FORCE updated (unknown narrowing)`
              );
              outcome.warnings.forEach(w => console.warn(`       ⚠️  ${w}`));
              break;
            }

            case 'refused_hard_breaking':
              console.error(
                `  ❌  ${label}: REFUSED — hard breaking changes detected.\n` +
                  `       Create a new schema version instead.\n` +
                  outcome.errors.map(e => `       • ${e}`).join('\n')
              );
              hadError = true;
              break;

            case 'refused_narrowing':
              console.error(
                `  ❌  ${label}: REFUSED — unknown narrowing detected.\n` +
                  `       Prefer creating a new schema version.\n` +
                  `       If you are **absolutely** certain, rerun with FORCE=1:\n` +
                  `         FORCE=1 yarn update-ai-gateway-schema-snapshots\n` +
                  outcome.errors.map(e => `       • ${e}`).join('\n')
              );
              hadError = true;
              break;
          }
        });
      }
    );

    if (hadError) {
      throw new Error(
        'One or more schema snapshots could not be updated. See output above.'
      );
    }
  });
});

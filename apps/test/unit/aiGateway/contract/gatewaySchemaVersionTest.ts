/**
 * Guards the wiring around schema versions; gatewaySchemaContractTest.ts covers
 * the shapes themselves.
 *
 * Two failure modes motivate these: a version added to one endpoint but not
 * another is an undefined serializer lookup at runtime, and a client parsing
 * replies with a schema older than the version it asked for silently discards
 * the newer fields rather than erroring.
 */

import {
  ALL_GATEWAY_SCHEMA_GROUPS,
  CURRENT_SCHEMA_VERSION,
  CurrentGatewayGenerateTextResponseSchema,
  CurrentGatewayTranscribeResponseSchema,
  generateTextResponseSchemas,
  transcribeResponseSchemas,
} from '@cdo/apps/aiGateway/contract/gatewaySchemas';

describe('AI Gateway schema versions', () => {
  const currentVersion = Number(CURRENT_SCHEMA_VERSION);

  it('CURRENT_SCHEMA_VERSION parses as a positive integer', () => {
    expect(Number.isInteger(currentVersion)).toBe(true);
    expect(currentVersion).toBeGreaterThan(0);
  });

  it('every group defines every version', () => {
    const versionsByGroup = Object.fromEntries(
      Object.entries(ALL_GATEWAY_SCHEMA_GROUPS).map(([group, schemas]) => [
        group,
        Object.keys(schemas).map(Number).sort(),
      ])
    );
    const allVersions = [
      ...new Set(Object.values(versionsByGroup).flat()),
    ].sort();

    Object.entries(versionsByGroup).forEach(([group, versions]) => {
      expect(versions).toEqual(allVersions);
      expect(group).toBeTruthy();
    });
  });

  it('every group defines CURRENT_SCHEMA_VERSION', () => {
    Object.entries(ALL_GATEWAY_SCHEMA_GROUPS).forEach(([group, schemas]) => {
      expect(schemas[currentVersion]).toBeDefined();
      expect(group).toBeTruthy();
    });
  });

  it('versions are contiguous from 1', () => {
    // A gap means a client can request a version the worker resolves by falling
    // back, which is silent. Keeping the sequence dense makes the retirement of
    // an old version a deliberate edit rather than a hole nobody notices.
    Object.values(ALL_GATEWAY_SCHEMA_GROUPS).forEach(schemas => {
      const versions = Object.keys(schemas).map(Number).sort();
      expect(versions).toEqual(
        Array.from({length: versions.length}, (_unused, i) => i + 1)
      );
    });
  });

  it('current response aliases are the schemas registered for the current version', () => {
    expect(CurrentGatewayGenerateTextResponseSchema).toBe(
      generateTextResponseSchemas[currentVersion]
    );
    expect(CurrentGatewayTranscribeResponseSchema).toBe(
      transcribeResponseSchemas[currentVersion]
    );
  });

  it('the current generateText response schema keeps responseSignature', () => {
    // The field the client must not strip. Asserted through a parse rather than
    // by inspecting the schema, so it covers what actually reaches callers.
    const parsed = CurrentGatewayGenerateTextResponseSchema.parse({
      text: 'hello',
      finishReason: 'stop',
      responseSignature: 'a.b.c',
    });
    expect(parsed).toHaveProperty('responseSignature', 'a.b.c');
  });

  it('a response without a signature still parses', () => {
    // The worker omits it when it has no signing key, and for finish reasons
    // that withhold text. Neither is an error for the client.
    const parsed = CurrentGatewayGenerateTextResponseSchema.parse({
      text: 'hello',
      finishReason: 'stop',
    });
    expect(parsed).not.toHaveProperty('responseSignature');
  });
});

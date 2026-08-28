import {describe, expect, it} from 'vitest';

import {WidgetManifestSchema} from '../manifest.js';

const VALID_MANIFEST = {
  slug: 'pick-your-blocks',
  version: '1.0.0',
  toolName: 'pick_your_blocks',
  title: 'Pick Your Blocks',
  description: 'Choose the right tool for the job.',
  inputSchema: {title: {type: 'string'}},
  visibility: ['model', 'app'],
  network: 'none',
  eventTypes: ['answered', 'completed'],
  sourceHash: `sha256:${'a'.repeat(64)}`,
  docHash: `sha256:${'b'.repeat(64)}`,
  toolchain: {
    esbuild: '0.25.12',
    componentLibrary: '0.1.0-alpha.1',
    widgetRuntime: '0.1.0',
  },
  gates: {
    checkedAt: '2026-08-28T00:00:00.000Z',
    violations: [],
    docBytes: 361227,
  },
};

describe('WidgetManifestSchema', () => {
  it('accepts a well-formed manifest', () => {
    expect(WidgetManifestSchema.safeParse(VALID_MANIFEST).success).toBe(true);
  });

  it('accepts a manifest with no eventTypes (optional field)', () => {
    const withoutEventTypes: Partial<typeof VALID_MANIFEST> = {
      ...VALID_MANIFEST,
    };
    delete withoutEventTypes.eventTypes;
    expect(WidgetManifestSchema.safeParse(withoutEventTypes).success).toBe(
      true,
    );
  });

  it('rejects a slug with an uppercase letter', () => {
    const result = WidgetManifestSchema.safeParse({
      ...VALID_MANIFEST,
      slug: 'Pick-Your-Blocks',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a version that is not semver-shaped', () => {
    const result = WidgetManifestSchema.safeParse({
      ...VALID_MANIFEST,
      version: 'v1',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a sourceHash that is not sha256:<64 hex>', () => {
    const result = WidgetManifestSchema.safeParse({
      ...VALID_MANIFEST,
      sourceHash: 'not-a-hash',
    });
    expect(result.success).toBe(false);
  });

  it('rejects network values other than "none"', () => {
    const result = WidgetManifestSchema.safeParse({
      ...VALID_MANIFEST,
      network: 'unknown',
    });
    expect(result.success).toBe(false);
  });

  it('rejects a visibility entry outside model/app', () => {
    const result = WidgetManifestSchema.safeParse({
      ...VALID_MANIFEST,
      visibility: ['model', 'admin'],
    });
    expect(result.success).toBe(false);
  });

  it('rejects a missing toolchain field', () => {
    const {toolchain, ...rest} = VALID_MANIFEST;
    const result = WidgetManifestSchema.safeParse({
      ...rest,
      toolchain: {esbuild: toolchain.esbuild, componentLibrary: toolchain.componentLibrary},
    });
    expect(result.success).toBe(false);
  });
});

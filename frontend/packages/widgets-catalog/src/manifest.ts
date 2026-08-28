import {z} from 'zod';

// Content hashes are always `sha256:<64 lowercase hex chars>` — see hash.ts.
const ShaHexSchema = z.string().regex(/^sha256:[0-9a-f]{64}$/);

export const WidgetToolchainSchema = z.object({
  esbuild: z.string(),
  componentLibrary: z.string(),
  widgetRuntime: z.string(),
});
export type WidgetToolchain = z.infer<typeof WidgetToolchainSchema>;

export const WidgetGateResultSchema = z.object({
  checkedAt: z.string(),
  violations: z.array(z.string()),
  docBytes: z.number().int().nonnegative(),
});
export type WidgetGateResult = z.infer<typeof WidgetGateResultSchema>;

/**
 * `widget.json` — the graduated artifact's manifest. Everything the session
 * `WidgetDescriptor` (authoring/model.ts) does not carry: version, content
 * hashes, pinned toolchain, and recorded gate results. See this package's
 * README for how `sourceHash`/`docHash` get here (`widgets:rehash`) and how
 * they get checked (`test:gates`).
 */
export const WidgetManifestSchema = z.object({
  slug: z.string().regex(/^[a-z0-9][a-z0-9-]*$/),
  version: z.string().regex(/^\d+\.\d+\.\d+$/),
  toolName: z.string().min(1),
  title: z.string().min(1),
  description: z.string(),
  inputSchema: z.record(z.string(), z.unknown()),
  visibility: z.array(z.enum(['model', 'app'])),
  network: z.literal('none'),
  eventTypes: z.array(z.string()).optional(),
  sourceHash: ShaHexSchema,
  docHash: ShaHexSchema,
  toolchain: WidgetToolchainSchema,
  gates: WidgetGateResultSchema,
});
export type WidgetManifest = z.infer<typeof WidgetManifestSchema>;

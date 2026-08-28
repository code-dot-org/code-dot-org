import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {injectWidgetChrome} from '@code-dot-org/widget-runtime/chrome';

import {buildWidget, hasBuiltSource} from './buildWidget.js';
import {checkWidgetDocument} from './contractGates.js';
import {hashWidgetDoc, hashWidgetSource} from './hash.js';
import {WidgetManifestSchema, type WidgetManifest} from './manifest.js';

export const PACKAGE_ROOT = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
export const WIDGETS_DIR = path.join(PACKAGE_ROOT, 'widgets');
export const DIST_DIR = path.join(PACKAGE_ROOT, 'dist');

/** Slugs are directory names under `widgets/`, sorted for a deterministic build order. */
export function listWidgetSlugs(): string[] {
  if (!fs.existsSync(WIDGETS_DIR)) {
    return [];
  }
  return fs
    .readdirSync(WIDGETS_DIR, {withFileTypes: true})
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();
}

export interface WidgetArtifact {
  slug: string;
  widgetDir: string;
  manifestPath: string;
  /** The manifest as currently recorded on disk — NOT recomputed here; see `widgets:rehash` for that. */
  manifest: WidgetManifest;
  /** The served (post injectWidgetChrome) document — what a learner's iframe would receive. */
  servedHtml: string;
  sourceHash: string;
  docHash: string;
  violations: string[];
}

/**
 * Rebuilds one catalog widget through the SAME `buildWidget` the authoring
 * service uses, and computes what its manifest fields SHOULD be right now.
 * Callers decide what to do with a mismatch: `buildCatalog()` just emits the
 * artifact (best-effort, for `yarn build`); `test:gates` (scripts/testGates.ts)
 * is the strict check that fails on one.
 */
export async function computeWidgetArtifact(
  slug: string,
): Promise<WidgetArtifact> {
  const widgetDir = path.join(WIDGETS_DIR, slug);
  const manifestPath = path.join(widgetDir, 'widget.json');
  const manifest = WidgetManifestSchema.parse(
    JSON.parse(fs.readFileSync(manifestPath, 'utf8')),
  );
  if (!hasBuiltSource(widgetDir)) {
    throw new Error(`widget ${slug} is missing src/index.tsx`);
  }
  const result = await buildWidget(widgetDir, manifest.title);
  if (!result.ok) {
    throw new Error(`widget ${slug} failed to build:\n${result.errorText}`);
  }
  const servedHtml = injectWidgetChrome(result.html);
  return {
    slug,
    widgetDir,
    manifestPath,
    manifest,
    servedHtml,
    sourceHash: hashWidgetSource(path.join(widgetDir, 'src')),
    docHash: hashWidgetDoc(servedHtml),
    violations: checkWidgetDocument(servedHtml),
  };
}

/**
 * Builds every widget in `widgets/`, writing `dist/<slug>/widget.html` and an
 * aggregate `dist/manifest.json`. Built documents are deliberately NOT
 * committed to git (see this package's README) — CI and `yarn build` are
 * where they come from.
 */
export async function buildCatalog(): Promise<WidgetArtifact[]> {
  const artifacts = await Promise.all(
    listWidgetSlugs().map(slug => computeWidgetArtifact(slug)),
  );
  fs.mkdirSync(DIST_DIR, {recursive: true});
  for (const artifact of artifacts) {
    const outDir = path.join(DIST_DIR, artifact.slug);
    fs.mkdirSync(outDir, {recursive: true});
    fs.writeFileSync(path.join(outDir, 'widget.html'), artifact.servedHtml);
  }
  const manifestIndex = Object.fromEntries(
    artifacts.map(({slug, manifest}) => [slug, manifest]),
  );
  fs.writeFileSync(
    path.join(DIST_DIR, 'manifest.json'),
    `${JSON.stringify(manifestIndex, null, 2)}\n`,
  );
  return artifacts;
}

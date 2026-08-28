#!/usr/bin/env tsx
// Recomputes sourceHash, docHash, toolchain, and gates for every catalog
// widget and rewrites widget.json in place. Run after editing a widget's
// source, or after a toolchain/dependency bump (component-library,
// widget-runtime, esbuild) that would otherwise leave every docHash stale.
// Does NOT touch version, title, description, inputSchema, eventTypes, or
// visibility — those are an author's decision, not a computed one.
import fs from 'node:fs';

import {computeWidgetArtifact, listWidgetSlugs} from '../src/buildCatalog.js';
import {computeToolchain} from '../src/toolchain.js';

async function rehash(slug: string): Promise<void> {
  const artifact = await computeWidgetArtifact(slug);
  const updated = {
    ...artifact.manifest,
    sourceHash: artifact.sourceHash,
    docHash: artifact.docHash,
    toolchain: computeToolchain(),
    gates: {
      checkedAt: new Date().toISOString(),
      violations: artifact.violations,
      docBytes: Buffer.byteLength(artifact.servedHtml, 'utf8'),
    },
  };
  fs.writeFileSync(
    artifact.manifestPath,
    `${JSON.stringify(updated, null, 2)}\n`,
  );
  console.log(
    `[widgets:rehash] ${slug}: sourceHash=${updated.sourceHash} ` +
      `docHash=${updated.docHash} violations=${artifact.violations.length}`,
  );
}

for (const slug of listWidgetSlugs()) {
  await rehash(slug);
}

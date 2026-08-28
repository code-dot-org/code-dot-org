#!/usr/bin/env tsx
// Recomputes sourceHash, docHash, toolchain, and gates for every catalog
// widget and rewrites widget.json in place. Run after editing a widget's
// source, or after a toolchain/dependency bump (component-library,
// widget-runtime, esbuild) that would otherwise leave every docHash stale.
// Does NOT touch version, title, description, inputSchema, eventTypes, or
// visibility — those are an author's decision, not a computed one.
import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

import {computeWidgetArtifact, listWidgetSlugs, PACKAGE_ROOT} from '../src/buildCatalog.js';

function workspacePackageVersion(packageDirName: string): string {
  const pkgJsonPath = path.join(
    PACKAGE_ROOT,
    '..',
    packageDirName,
    'package.json',
  );
  return (
    JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')) as {version: string}
  ).version;
}

async function rehash(slug: string): Promise<void> {
  const artifact = await computeWidgetArtifact(slug);
  const updated = {
    ...artifact.manifest,
    sourceHash: artifact.sourceHash,
    docHash: artifact.docHash,
    toolchain: {
      esbuild: esbuild.version,
      componentLibrary: workspacePackageVersion('component-library'),
      widgetRuntime: workspacePackageVersion('widget-runtime'),
    },
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

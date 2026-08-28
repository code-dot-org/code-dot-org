#!/usr/bin/env tsx
// The gate CI runs (and a change to a widget should pass locally before it
// is proposed): for every catalog widget, rebuild through the shared
// buildWidget, then assert the manifest's recorded hashes and gate results
// still match what a fresh build produces. A mismatch means source and
// manifest.json disagree — run `yarn widgets:rehash`.
import fs from 'node:fs';
import path from 'node:path';

import {computeWidgetArtifact, listWidgetSlugs} from '../src/buildCatalog.js';

let failureCount = 0;

function fail(slug: string, message: string): void {
  failureCount += 1;
  console.error(`[test:gates] ${slug}: ${message}`);
}

async function checkWidget(slug: string): Promise<void> {
  let artifact;
  try {
    artifact = await computeWidgetArtifact(slug);
  } catch (error) {
    fail(slug, error instanceof Error ? error.message : String(error));
    return;
  }

  if (artifact.sourceHash !== artifact.manifest.sourceHash) {
    fail(
      slug,
      `sourceHash mismatch — widget.json has ${artifact.manifest.sourceHash}, ` +
        `a fresh build computes ${artifact.sourceHash}. Run yarn widgets:rehash.`,
    );
  }
  if (artifact.docHash !== artifact.manifest.docHash) {
    fail(
      slug,
      `docHash mismatch — widget.json has ${artifact.manifest.docHash}, ` +
        `a fresh build computes ${artifact.docHash}. Run yarn widgets:rehash.`,
    );
  }
  if (artifact.violations.length > 0) {
    fail(
      slug,
      `contract gate violations:\n${artifact.violations
        .map(v => `    - ${v}`)
        .join('\n')}`,
    );
  }

  const changelogPath = path.join(artifact.widgetDir, 'CHANGELOG.md');
  const changelog = fs.existsSync(changelogPath)
    ? fs.readFileSync(changelogPath, 'utf8')
    : '';
  if (!changelog.includes(artifact.manifest.version)) {
    fail(
      slug,
      `CHANGELOG.md has no entry for the recorded version ${artifact.manifest.version}`,
    );
  }
}

const slugs = listWidgetSlugs();
for (const slug of slugs) {
  await checkWidget(slug);
}

if (failureCount > 0) {
  console.error(
    `[test:gates] ${failureCount} failure(s) across ${slugs.length} widget(s)`,
  );
  process.exit(1);
}
console.log(`[test:gates] ${slugs.length} widget(s) passed every gate`);

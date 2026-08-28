#!/usr/bin/env tsx
// Entry point for the "build" script's catalog step — see package.json.
import {buildCatalog} from '../src/buildCatalog.js';

const artifacts = await buildCatalog();
if (artifacts.length === 0) {
  console.log('[widgets-catalog] no widgets in widgets/ — nothing to build');
} else {
  console.log(
    `[widgets-catalog] built ${artifacts.length} widget(s): ${artifacts
      .map(a => a.slug)
      .join(', ')}`,
  );
}

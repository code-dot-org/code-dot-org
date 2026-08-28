import fs from 'node:fs';
import path from 'node:path';
import {describe, expect, it} from 'vitest';

import {injectWidgetChrome} from '@code-dot-org/widget-runtime/chrome';
import {checkWidgetDocument} from '@code-dot-org/widgets-catalog';

import {FRONTEND_ROOT} from '../../boot/paths.js';

// Applies the same gates (now imported from the shared widgets-catalog
// package — see contractGates.test.ts there for the unit tests) to every
// widget currently on disk in the default dev session — built and legacy
// alike, since the check is document-shaped, not source-shaped. Skipped (not
// failed) when no session exists: this repo checkout has no .authoring/
// data, and CI never will either.
const widgetsDir = path.join(
  FRONTEND_ROOT,
  '.authoring',
  'sessions',
  'default',
  'widgets',
);
const widgetIds = fs.existsSync(widgetsDir)
  ? fs.readdirSync(widgetsDir).filter(id => {
      const html = path.join(widgetsDir, id, 'widget.html');
      return fs.existsSync(html) && fs.statSync(html).size > 0;
    })
  : [];

describe.skipIf(widgetIds.length === 0)(
  'checkWidgetDocument against the live dev session',
  () => {
    it.each(widgetIds)('%s serves a document that passes every gate', id => {
      // injectWidgetChrome, same as GET /api/widgets/:id and publish: a
      // legacy widget's on-disk source may not embed the shim/CSP itself
      // (serve-time injection supplies it), so the gate must check what a
      // learner's iframe actually receives, not the raw file.
      const rawSource = fs.readFileSync(
        path.join(widgetsDir, id, 'widget.html'),
        'utf8',
      );
      const served = injectWidgetChrome(rawSource);
      expect(checkWidgetDocument(served)).toEqual([]);
    });
  },
);

import * as esbuild from 'esbuild';
import fs from 'node:fs';
import path from 'node:path';

import {PACKAGE_ROOT} from './buildCatalog.js';
import type {WidgetToolchain} from './manifest.js';

function workspacePackageVersion(packageDirName: string): string {
  const pkgJsonPath = path.join(
    PACKAGE_ROOT,
    '..',
    packageDirName,
    'package.json',
  );
  return (JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8')) as {version: string})
    .version;
}

/**
 * The exact toolchain versions a widget document was (or would be) built
 * with — recorded in `widget.json`'s `toolchain` field. Shared by
 * `widgets:rehash` and the propose endpoint (authoring-service) so a
 * graduated widget and a rehashed one can never disagree about how this was
 * computed.
 */
export function computeToolchain(): WidgetToolchain {
  return {
    esbuild: esbuild.version,
    componentLibrary: workspacePackageVersion('component-library'),
    widgetRuntime: workspacePackageVersion('widget-runtime'),
  };
}

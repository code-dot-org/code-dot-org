import {WorkspaceSerialization} from '@cdo/apps/blockly/types';

import {SpriteLab2Behavior2} from '../types';

import {
  clearCurrentBehavior2Name,
  setCurrentBehavior2Name,
} from './behavior2Compile';
import {compileWorkspaceSource} from './setup';

// Remove stale ORPHANED disable flags from a stored system source. Sources
// saved before the for-each block lost its statement connections carry
// disabledReasons: ['ORPHANED'] on the whole stack, and a disabled block
// compiles to nothing — an empty system. A student's deliberate disable
// (any other reason) is kept.
export function sanitizeBehavior2Source(
  source: WorkspaceSerialization | undefined
): WorkspaceSerialization | undefined {
  if (!source) {
    return source;
  }
  const strip = (node: unknown): unknown => {
    if (Array.isArray(node)) {
      return node.map(strip);
    }
    if (node && typeof node === 'object') {
      const out: {[key: string]: unknown} = {};
      for (const [key, value] of Object.entries(node)) {
        if (key === 'disabledReasons' && Array.isArray(value)) {
          const kept = value.filter(reason => reason !== 'ORPHANED');
          if (kept.length) {
            out[key] = kept;
          }
          continue;
        }
        out[key] = strip(value);
      }
      return out;
    }
    return node;
  };
  return strip(source) as WorkspaceSerialization;
}

// Compile system workspaces into the registrations the startBehavior2 helper
// dispatches through. Prepended to the program ahead of the scene's code, so
// start-system blocks anywhere in the scene find their implementations.
export function compileBehavior2Sources(
  behavior2s: SpriteLab2Behavior2[]
): string {
  if (!behavior2s.length) {
    return '';
  }
  const registrations = behavior2s.map(({name, source}) => {
    // Bracket the compile so the state blocks namespace their sprite props
    // by this system's name.
    setCurrentBehavior2Name(name);
    let body: string;
    try {
      body = compileWorkspaceSource(sanitizeBehavior2Source(source));
    } finally {
      clearCurrentBehavior2Name();
    }
    const indented = body
      .split('\n')
      .map(line => (line ? '  ' + line : line))
      .join('\n');
    return (
      `__behavior2s[${JSON.stringify(name)}] = ` +
      `function (__group, __option) {\n${indented}};\n`
    );
  });
  return registrations.join('');
}

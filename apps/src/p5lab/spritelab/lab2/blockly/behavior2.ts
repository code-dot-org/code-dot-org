import {SpriteLab2Behavior2} from '../types';

import {
  clearCurrentBehavior2Name,
  setCurrentBehavior2Name,
} from './behavior2Compile';
import {compileWorkspaceSource} from './setup';

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
      body = compileWorkspaceSource(source);
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

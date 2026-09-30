import {readdirSync, readFileSync} from 'node:fs';
import {dirname, join} from 'node:path';
import {fileURLToPath} from 'node:url';
import {describe, expect, it} from 'vitest';

// Every compatibility register entry must be pinned by a test whose title
// names it, so fixing a kept fork bug always changes a test on purpose.
const testsDir = dirname(fileURLToPath(import.meta.url));
const register = readFileSync(
  join(testsDir, '../../../docs/sprites/compatibility.md'),
  'utf8',
);

const entries = register
  .split(/\n(?=#{3,4} CMP-\d+\.)/)
  .map(section => {
    const id = /^#{3,4} (CMP-\d+)\./.exec(section)?.[1];
    const pin = /\*\*Pinned by:\*\*\s*(.*)/.exec(section)?.[1] ?? '';
    return {id, awaitingPort: pin.startsWith('none yet')};
  })
  .filter((entry): entry is {id: string; awaitingPort: boolean} => !!entry.id);

// The runtime's entries are pinned beside the runtime.
const testSources = [testsDir, join(testsDir, '../../engine/runtime/__tests__')]
  .flatMap(dir =>
    readdirSync(dir)
      .filter(name => name.endsWith('.test.ts'))
      .map(name => readFileSync(join(dir, name), 'utf8')),
  )
  .join('\n');

describe('compatibility register', () => {
  it('has entries', () => {
    expect(entries.length).toBeGreaterThan(0);
  });

  it.each(entries.filter(entry => !entry.awaitingPort).map(e => [e.id]))(
    '%s is pinned by a test that names it',
    id => {
      const title = new RegExp(`['"\`](?:CMP-\\d+, )*${id}[,:]`);
      expect(testSources).toMatch(title);
    },
  );
});

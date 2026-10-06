import fs from 'fs';
import os from 'os';
import path from 'path';

import transformer from '../jest-scss.transformer';

let dir;

function write(name, lines) {
  const file = path.join(dir, name);
  fs.writeFileSync(file, lines.join('\n') + '\n');
  return file;
}

function exportsOf(file) {
  const {code} = transformer.process(fs.readFileSync(file, 'utf8'), file);
  return new Function('module', 'require', `${code}; return module.exports;`)(
    {},
    require
  );
}

describe('jest-scss.transformer', () => {
  beforeEach(() => {
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'scss-transform-'));
  });

  afterEach(() => {
    fs.rmSync(dir, {recursive: true, force: true});
  });

  it('proxies class names for a stylesheet with no exports', () => {
    const file = write('plain.module.scss', ['.guide { padding: 24px; }']);
    expect(exportsOf(file).guide).toBe('guide');
  });

  it('exports the value of a variable declared in the file', () => {
    const file = write('own.module.scss', [
      '$pad: 24px;',
      ':export { pad: $pad; }',
    ]);
    expect(exportsOf(file)).toEqual({pad: '24px'});
  });

  it('follows @use, @import and @forward to partials', () => {
    write('_vars.scss', ['$gap: 8px;', '$pad: $gap !default;']);
    write('_more.scss', ["@forward 'vars';"]);
    const file = write('uses.module.scss', [
      "@use 'more';",
      "@import 'vars.scss';",
      ':export { gap: more.$gap; pad: $pad; }',
    ]);
    expect(exportsOf(file)).toEqual({gap: '8px', pad: '8px'});
  });

  it('resolves like Sass: last plain wins, !default sets only once', () => {
    write('_vars.scss', ['$b: 2px;', '$shadow: 1px !default;']);
    const file = write('order.module.scss', [
      '$b: 1px;',
      "@use 'vars';",
      '$d: 5px !default;',
      '$d: 7px;',
      '@mixin m { $w: 99px; .x { $w: 98px; } }',
      '$w: 4px;',
      '// $w: 1px;',
      '/* $d: 1px; */',
      ':export { b: $b; d: $d; w: $w; shadow: vars.$shadow; }',
    ]);
    expect(exportsOf(file)).toEqual({
      b: '1px',
      d: '7px',
      w: '4px',
      shadow: '1px',
    });
  });

  it('leaves what it cannot resolve as written', () => {
    const file = write('expr.module.scss', [
      "@use 'sass:math';",
      '$w: 800px;',
      ':export { half: math.div($w, 2); none: $missing; }',
    ]);
    expect(exportsOf(file)).toEqual({
      half: 'math.div($w, 2)',
      none: '$missing',
    });
  });

  it('changes the cache key when a partial changes', () => {
    const vars = write('_vars.scss', ['$pad: 24px;']);
    const file = write('keyed.module.scss', [
      "@use 'vars';",
      ':export { pad: vars.$pad; }',
    ]);
    const src = fs.readFileSync(file, 'utf8');
    const before = transformer.getCacheKey(src, file, {configString: ''});
    fs.writeFileSync(vars, '$pad: 32px;\n');
    const after = transformer.getCacheKey(src, file, {configString: ''});
    expect(after).not.toBe(before);
  });
});

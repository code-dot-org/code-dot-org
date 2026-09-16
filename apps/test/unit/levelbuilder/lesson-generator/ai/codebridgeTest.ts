import {ProjectFileType} from '@cdo/apps/lab2/types';
import {
  filesToMultiFileSource,
  suppliedCodeLines,
} from '@cdo/apps/levelbuilder/lesson-generator/ai/codebridge';

describe('filesToMultiFileSource', () => {
  const byName = (source: ReturnType<typeof filesToMultiFileSource>) =>
    Object.fromEntries(Object.values(source.files).map(f => [f.name, f]));

  it('places flat files in the root folder and opens all of them', () => {
    const source = filesToMultiFileSource(
      [
        {name: 'index.html', contents: '<p>hi</p>'},
        {name: 'style.css', contents: 'p {}'},
      ],
      ProjectFileType.STARTER
    );
    const files = byName(source);
    expect(files['index.html'].folderId).toBe('0');
    expect(files['style.css'].folderId).toBe('0');
    expect(files['index.html'].type).toBe(ProjectFileType.STARTER);
    expect(source.openFiles).toHaveLength(2);
    expect(source.folders).toEqual({});
  });

  it('omits the type key entirely when fileType is undefined', () => {
    const source = filesToMultiFileSource(
      [{name: 'main.py', contents: 'print(1)'}],
      undefined
    );
    const file = Object.values(source.files)[0];
    expect('type' in file).toBe(false);
  });

  it('creates one folder entry per path segment and reuses it', () => {
    const source = filesToMultiFileSource(
      [
        {name: 'css/style.css', contents: ''},
        {name: 'css/theme.css', contents: ''},
        {name: 'js/lib/util.js', contents: ''},
      ],
      undefined
    );
    const folders = Object.values(source.folders);
    expect(folders.map(f => f.name).sort()).toEqual(['css', 'js', 'lib']);
    const css = folders.find(f => f.name === 'css')!;
    const files = byName(source);
    expect(files['style.css'].folderId).toBe(css.id);
    expect(files['theme.css'].folderId).toBe(css.id);
    const lib = folders.find(f => f.name === 'lib')!;
    const js = folders.find(f => f.name === 'js')!;
    expect(lib.parentId).toBe(js.id);
    expect(files['util.js'].folderId).toBe(lib.id);
  });

  it('marks root index.html active even when listed later', () => {
    const source = filesToMultiFileSource(
      [
        {name: 'style.css', contents: ''},
        {name: 'index.html', contents: ''},
      ],
      undefined
    );
    const files = byName(source);
    expect(files['index.html'].active).toBe(true);
    expect(files['style.css'].active).toBe(false);
  });

  it('honours a custom preferredActive pattern', () => {
    const source = filesToMultiFileSource(
      [
        {name: 'helpers.py', contents: ''},
        {name: 'main.py', contents: ''},
      ],
      undefined,
      /^main\.py$/
    );
    expect(byName(source)['main.py'].active).toBe(true);
  });

  it('falls back to the first file when nothing matches preferredActive', () => {
    const source = filesToMultiFileSource(
      [
        {name: 'a.txt', contents: ''},
        {name: 'b.txt', contents: ''},
      ],
      undefined
    );
    expect(byName(source)['a.txt'].active).toBe(true);
  });

  it('does not prefer an index.html inside a subfolder', () => {
    const source = filesToMultiFileSource(
      [
        {name: 'readme.txt', contents: ''},
        {name: 'docs/index.html', contents: ''},
      ],
      undefined
    );
    expect(byName(source)['readme.txt'].active).toBe(true);
  });
});

describe('suppliedCodeLines', () => {
  const ctx = {lessonName: 'l', levelName: 'x', levelDescription: 'd'};

  it('returns no lines when no code was supplied', () => {
    expect(suppliedCodeLines(ctx)).toEqual([]);
    expect(suppliedCodeLines({...ctx, suppliedCode: '  '})).toEqual([]);
  });

  it('frames supplied code with the canonical-treatment contract', () => {
    const lines = suppliedCodeLines({...ctx, suppliedCode: 'print(1)'});
    expect(lines[0]).toBe('');
    expect(lines[lines.length - 1]).toBe('print(1)');
    expect(lines.join(' ')).toContain('Treat it as canonical');
  });
});

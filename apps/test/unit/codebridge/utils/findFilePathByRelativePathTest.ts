import {findFilePathByRelativePath} from '@cdo/apps/codebridge/utils/findFilePathByRelativePath';

describe('findFilePathByRelativePath', () => {
  it('returns an absolute path without leading slash', () => {
    expect(
      findFilePathByRelativePath('/path/to/file.html', 'current/index.html')
    ).toBe('path/to/file.html');
  });

  it('handles root folder absolute paths', () => {
    expect(findFilePathByRelativePath('/file.html', 'current/index.html')).toBe(
      'file.html'
    );
  });

  it('resolves relative path from root folder', () => {
    expect(findFilePathByRelativePath('src/file.html', 'index.html')).toBe(
      'src/file.html'
    );
  });

  it('handles current directory references from root', () => {
    expect(findFilePathByRelativePath('./file.html', 'index.html')).toBe(
      'file.html'
    );
  });

  it('resolves sibling file correctly', () => {
    expect(
      findFilePathByRelativePath('sibling.html', 'current/index.html')
    ).toBe('current/sibling.html');
  });

  it('resolves current directory reference from a subdirectory', () => {
    expect(
      findFilePathByRelativePath('./file.html', 'current/index.html')
    ).toBe('current/file.html');
  });

  it('resolves parent directory reference', () => {
    expect(
      findFilePathByRelativePath('../file.html', 'current/subdir/index.html')
    ).toBe('current/file.html');
  });

  it('resolves complex path', () => {
    expect(
      findFilePathByRelativePath(
        '../src/nested/../file.html',
        'current/subdir/index.html'
      )
    ).toBe('current/src/file.html');
  });

  it('handles empty segments', () => {
    expect(
      findFilePathByRelativePath('src//file.html', 'current/index.html')
    ).toBe('current/src/file.html');
  });

  it('handles multiple current directory references', () => {
    expect(
      findFilePathByRelativePath('././file.html', 'current/index.html')
    ).toBe('current/file.html');
  });

  it('handles going above the root directory', () => {
    // Extra .. should be ignored.
    expect(findFilePathByRelativePath('../../file.html', 'index.html')).toBe(
      'file.html'
    );
  });
});

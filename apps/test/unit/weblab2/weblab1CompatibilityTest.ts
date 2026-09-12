import {DEFAULT_FOLDER_ID} from '@cdo/apps/codebridge/constants';
import {NetworkError} from '@cdo/apps/util/HttpClient';
import {
  buildMultiFileSourceFromWeblab1Files,
  isWeblab1CompatibilityModeEnabled,
  mainJsonIsLab2CodebridgeShape,
  shouldFallbackToWeblab1Files,
} from '@cdo/apps/weblab2/weblab1Compatibility';

describe('weblab1Compatibility', () => {
  describe('isWeblab1CompatibilityModeEnabled', () => {
    const originalHref = window.location.href;

    afterEach(() => {
      window.history.replaceState({}, '', originalHref);
    });

    it('returns true for weblab1_compat=true', () => {
      window.history.replaceState({}, '', '?weblab1_compat=true');

      expect(isWeblab1CompatibilityModeEnabled()).toBe(true);
    });

    it('returns false when query param is absent', () => {
      window.history.replaceState({}, '', '?');

      expect(isWeblab1CompatibilityModeEnabled()).toBe(false);
    });
  });

  describe('shouldFallbackToWeblab1Files', () => {
    it('returns true for 404 network error', () => {
      const error = new NetworkError(
        '404 Not Found',
        new Response(null, {status: 404})
      );
      expect(shouldFallbackToWeblab1Files(error)).toBe(true);
    });

    it('returns false for non-404 network error', () => {
      const error = new NetworkError(
        '500 Internal Server Error',
        new Response(null, {status: 500})
      );
      expect(shouldFallbackToWeblab1Files(error)).toBe(false);
    });

    it('returns false for non-network errors', () => {
      expect(shouldFallbackToWeblab1Files(new Error('other error'))).toBe(
        false
      );
    });
  });

  describe('mainJsonIsLab2CodebridgeShape', () => {
    it('returns false for App Lab-shaped main.json (source is JS string)', () => {
      expect(
        mainJsonIsLab2CodebridgeShape({
          source: 'var x = 1;',
          html: '<div></div>',
        })
      ).toBe(false);
    });

    it('returns true when source is a MultiFileSource-shaped object', () => {
      expect(
        mainJsonIsLab2CodebridgeShape({
          source: {files: {}, folders: {}},
        })
      ).toBe(true);
    });

    it('returns false when source is missing', () => {
      expect(mainJsonIsLab2CodebridgeShape({})).toBe(false);
    });

    it('returns false when source object lacks files or folders', () => {
      expect(mainJsonIsLab2CodebridgeShape({source: {files: {}}})).toBe(false);
    });
  });

  describe('buildMultiFileSourceFromWeblab1Files', () => {
    it('creates folders and preserves nested paths', () => {
      const source = buildMultiFileSourceFromWeblab1Files([
        {
          filename: 'index.html',
          contents: '<html></html>',
        },
        {
          filename: 'styles/site.css',
          contents: 'body {}',
        },
        {
          filename: 'scripts/app.js',
          contents: 'console.log("hello");',
        },
      ]);

      expect(Object.keys(source.files)).toHaveLength(3);
      expect(Object.keys(source.folders)).toHaveLength(2);

      const styleFile = Object.values(source.files).find(
        file => file.name === 'site.css'
      );
      const scriptFile = Object.values(source.files).find(
        file => file.name === 'app.js'
      );

      expect(styleFile).toBeDefined();
      expect(scriptFile).toBeDefined();
      expect(styleFile?.folderId).not.toBe(DEFAULT_FOLDER_ID);
      expect(scriptFile?.folderId).not.toBe(DEFAULT_FOLDER_ID);
    });

    it('prefers index.html as active/open file when present', () => {
      const source = buildMultiFileSourceFromWeblab1Files([
        {filename: 'styles/site.css', contents: 'body {}'},
        {filename: 'index.html', contents: '<html></html>'},
      ]);

      const activeFiles = Object.values(source.files).filter(
        file => file.active
      );
      expect(activeFiles).toHaveLength(1);
      expect(activeFiles[0].name).toBe('index.html');
      expect(source.openFiles).toEqual([activeFiles[0].id]);
    });

    it('preserves URL-backed image assets without inlining binary in contents', () => {
      const fileUrl = '/v3/files/abc123/wrench.jpg';
      const source = buildMultiFileSourceFromWeblab1Files([
        {filename: 'images/logo.png', contents: '', url: fileUrl},
      ]);

      const onlyFile = Object.values(source.files)[0];
      expect(onlyFile.name).toBe('logo.png');
      expect(onlyFile.contents).toBe('');
      expect(onlyFile.url).toBe(fileUrl);
    });
  });
});

import {previewFileType} from '@codebridge/utils/previewFileType';

describe('previewFileType', () => {
  it('should return true for supported preview file types', () => {
    const previewFileTypes = ['html', 'css', 'javascript'];
    expect(previewFileType('html', previewFileTypes)).toBe(true);
    expect(previewFileType('css', previewFileTypes)).toBe(true);
    expect(previewFileType('javascript', previewFileTypes)).toBe(true);
  });

  it('should return false for unsupported preview file types', () => {
    const previewFileTypes = ['html', 'css', 'javascript'];
    expect(previewFileType('python', previewFileTypes)).toBe(false);
    expect(previewFileType('php', previewFileTypes)).toBe(false);
  });

  it('should use default preview file types if not provided', () => {
    // Assuming defaultPreviewFileTypesArray includes 'html', 'css', and 'javascript'
    expect(previewFileType('html')).toBe(true);
    expect(previewFileType('css')).toBe(false);
    expect(previewFileType('javascript')).toBe(false);
    expect(previewFileType('python')).toBe(false);
  });
});

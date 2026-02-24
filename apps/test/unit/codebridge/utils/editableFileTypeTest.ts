import {editableFileType} from '@codebridge/utils/editableFileType';

describe('editableFileType', () => {
  it('should return true for editable file types', () => {
    const editableFileTypes = ['html', 'css'];
    expect(editableFileType('html', editableFileTypes)).toBe(true);
    expect(editableFileType('css', editableFileTypes)).toBe(true);
  });

  it('should return false for non-editable file types', () => {
    const editableFileTypes = ['html', 'css'];
    expect(editableFileType('javascript', editableFileTypes)).toBe(false);
    expect(editableFileType('python', editableFileTypes)).toBe(false);
  });

  it('should use default editable file types if not provided', () => {
    expect(editableFileType('html')).toBe(true);
    expect(editableFileType('css')).toBe(true);
    expect(editableFileType('javascript')).toBe(false);
  });
});

import {viewableImageFileType} from '@codebridge/utils/viewableImageFileType';

describe('viewableImageFileType', () => {
  it('should return true for viewable image file extensions', () => {
    const viewableImageFileTypes = ['png', 'jpg', 'gif'];
    expect(viewableImageFileType('png', viewableImageFileTypes)).toBe(true);
    expect(viewableImageFileType('jpg', viewableImageFileTypes)).toBe(true);
    expect(viewableImageFileType('gif', viewableImageFileTypes)).toBe(true);
  });

  it('should return false for non-viewable image file extensions', () => {
    const viewableImageFileTypes = ['png', 'jpg', 'gif'];
    expect(viewableImageFileType('txt', viewableImageFileTypes)).toBe(false);
    expect(viewableImageFileType('pdf', viewableImageFileTypes)).toBe(false);
  });

  it('should use default viewable image file types if not provided', () => {
    // Assuming defaultViewableImageFileTypesArray includes 'png', 'jpg', and 'gif'
    expect(viewableImageFileType('png')).toBe(true);
    expect(viewableImageFileType('jpg')).toBe(true);
    expect(viewableImageFileType('gif')).toBe(true);
    expect(viewableImageFileType('txt')).toBe(false);
  });
});

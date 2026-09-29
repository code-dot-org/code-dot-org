import {
  IMAGE_MIME_TO_EXTENSIONS,
  SUPPORTED_IMAGE_EXTENSIONS,
} from '@cdo/apps/lab2/constants';
import {SafeAndSupportedImageTypes} from '@cdo/generated-scripts/sharedConstants';

describe('IMAGE_MIME_TO_EXTENSIONS', () => {
  it('maps every SafeAndSupportedImageType to at least one extension', () => {
    SafeAndSupportedImageTypes.forEach(mime => {
      expect(IMAGE_MIME_TO_EXTENSIONS[mime]?.length).toBeGreaterThan(0);
    });
  });

  it('includes jpeg and jpg for image/jpeg, but not jpe', () => {
    expect(IMAGE_MIME_TO_EXTENSIONS['image/jpeg']).toEqual(['jpeg', 'jpg']);
  });
});

describe('SUPPORTED_IMAGE_EXTENSIONS', () => {
  it('includes the common extensions for each supported image MIME type', () => {
    expect(SUPPORTED_IMAGE_EXTENSIONS).toEqual([
      'gif',
      'jpeg',
      'jpg',
      'png',
      'webp',
    ]);
  });

  it('does not include the uncommon jpe extension', () => {
    expect(SUPPORTED_IMAGE_EXTENSIONS).not.toContain('jpe');
  });
});

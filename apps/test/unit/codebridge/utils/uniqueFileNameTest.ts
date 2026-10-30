import {uniqueFileName} from '@codebridge/utils';

describe('uniqueFileName', function () {
  it('returns the input unchanged when there is no collision', function () {
    expect(uniqueFileName('image.png', [])).toBe('image.png');
    expect(uniqueFileName('image.png', ['other.png'])).toBe('image.png');
  });

  it('appends an underscore-separated suffix on collision by default', function () {
    expect(uniqueFileName('main.py', ['main.py'])).toBe('main_1.py');
    expect(
      uniqueFileName('main.py', ['main.py', 'main_1.py', 'main_2.py'])
    ).toBe('main_3.py');
  });

  it('honors a custom separator', function () {
    expect(uniqueFileName('image.png', ['image.png'], '-')).toBe('image-1.png');
    expect(
      uniqueFileName(
        'image.png',
        ['image.png', 'image-1.png', 'image-2.png'],
        '-'
      )
    ).toBe('image-3.png');
  });
});

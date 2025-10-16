import {getContentfulSlug} from '../getContentfulSlug';

describe('getContentfulSlug', () => {
  it('should return a single string when input is a single string', () => {
    const result = getContentfulSlug('engineering');
    expect(result).toBe('engineering');
  });

  it('should join an array of strings with slashes', () => {
    const result = getContentfulSlug(['engineering', 'all-the-things']);
    expect(result).toBe('engineering/all-the-things');
  });

  it('should return an empty string when input is an empty array', () => {
    const result = getContentfulSlug([]);
    expect(result).toBe('');
  });

  it('should handle an array with one element correctly', () => {
    const result = getContentfulSlug(['engineering']);
    expect(result).toBe('engineering');
  });

  it('should handle special characters in the input array', () => {
    const result = getContentfulSlug(['engineering', 'all@the#things']);
    expect(result).toBe('engineering/all@the#things');
  });

  it('should handle special characters in a single string input', () => {
    const result = getContentfulSlug('engineering/all@the#things');
    expect(result).toBe('engineering/all@the#things');
  });
});

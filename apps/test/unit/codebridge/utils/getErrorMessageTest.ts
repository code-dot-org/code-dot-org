import {getErrorMessage} from '@codebridge/utils/getErrorMessage';

describe('getErrorMessage', () => {
  it('should return the error message as a string', () => {
    expect(getErrorMessage('This is a string error')).toBe(
      'This is a string error'
    );

    const errorObject = new Error('Error message');
    expect(getErrorMessage(errorObject)).toBe('Error message');
  });

  it('should return an empty string for non-string and non-Error objects', () => {
    expect(getErrorMessage(123)).toBe('');
    expect(getErrorMessage(true)).toBe('');
    expect(getErrorMessage(null)).toBe('');
    expect(getErrorMessage(undefined)).toBe('');
    expect(getErrorMessage({})).toBe('');
  });
});

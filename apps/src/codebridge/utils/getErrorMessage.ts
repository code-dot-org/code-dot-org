/**
 * Extracts an error message from an arg which may be a string or an instance of `Error`.
 *
 * @param e - The error object or string to extract the message from.
 * @returns The error message as a string, or an empty string if the error is not a string or an Error object.
 */
export const getErrorMessage = (e: unknown): string => {
  if (typeof e === 'string') {
    return e;
  } else if (e instanceof Error) {
    return e.message;
  } else {
    return '';
  }
};

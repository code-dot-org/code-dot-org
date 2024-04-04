export const getErrorMessage = (e: unknown): string => {
  if (typeof e === 'string') {
    return e;
  } else if (e instanceof Error) {
    return e.message;
  } else {
    return '';
  }
};

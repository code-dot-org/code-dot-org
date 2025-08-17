// Returns the page action from the project URL, e.g., 'share', 'view', or 'edit'.
// For example, if the URL is '/projects/pythonlab/abc123/view', returns 'view'.
// If the URL is '/projects/pythonlab/abc123', returns 'share'.
// If the URL is not a project URL, returns undefined.
export const getLabViewPageAction = (): string | undefined => {
  const [, first, , , fourth] = window.location.pathname.split('/');
  if (first === 'projects') {
    if (!fourth) {
      return 'share';
    }
    return fourth;
  }
  return undefined;
};

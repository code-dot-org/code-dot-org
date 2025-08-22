// Returns the page action from the project URL, e.g., 'share', 'view', or 'edit'.
// or 'level' if the URL is a level URL, e.g., '/courses/allthethingscourse/units/1/lessons/51/levels/1'.
// For example, if the URL is '/projects/pythonlab/abc123/view', returns 'view'.
// If the URL is '/projects/pythonlab/abc123', returns 'share'.
// If the URL is not neither a project nor level URL, returns undefined.
export const getLabViewPageAction = (): string | undefined => {
  const [, first, , , fourth] = window.location.pathname.split('/');
  if (first === 'projects') {
    if (!fourth) {
      return 'share';
    }
    return fourth;
  }
  const [, first_, , third, , fifth, , seventh] =
    window.location.pathname.split('/');
  if (
    first_ === 'courses' &&
    third === 'units' &&
    fifth === 'lessons' &&
    seventh === 'levels'
  ) {
    return 'level';
  }
  return undefined;
};

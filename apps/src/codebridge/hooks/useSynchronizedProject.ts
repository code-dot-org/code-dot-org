import {
  projectReducer,
  useProjectUtilities,
} from '@codebridge/codebridgeContext';
import {ProjectType, SetProjectFunction} from '@codebridge/types';
import {useRef, useReducer, useEffect} from 'react';

/*
  CDOIDE is designed as an opaque component that receives a ProjectType, manipulates it, and then
  calls a callback with any changes to it.

  Internally, it keeps track of its own state via a `useReducer` method, and useReducer does -not-
  play as nicely with this pattern (a simple `useState` would be more user friendly in this regard, but
  also gives us fewer state management niceties. Nonetheless, this is enough of a nuisance to consider
  a future refactor to a simpler `setState` call.)

  So this hook keeps that internal and external data in sync because `useReducer` provides no direct access to the store.

  CDOIDE itself calls it with the externalProject that was handed in. Further comments are inline below.
*/

export const useSynchronizedProject = (
  externalProject: ProjectType,
  setProject: SetProjectFunction
): [ProjectType, ReturnType<typeof useProjectUtilities>] => {
  // first of all, get our internal reducer backed state
  const [internalProject, dispatch] = useReducer(
    projectReducer,
    externalProject
  );
  const previousInternalProjectRef = useRef(internalProject);

  // and our list of project utilities. We need this internally for the `replaceProject` call, and we return
  // it at the end since this is the hook where our `useReducer` call exists
  const projectUtilities = useProjectUtilities(dispatch);

  // we need to keep track of an externalProjectRef that is just whatever the current value is. We need to
  // toss it into a ref here so we can acccess it later via a `useEffect` hook, but we do -not- want to trigger
  // the hook on a change to this value. So we cheat a little.
  const externalProjectRef = useRef(externalProject);
  useEffect(() => {
    externalProjectRef.current = externalProject;
  }, [externalProject]);

  // if our externalProject has changed, then we can go ahead and change our internalProject.
  // if our externalProject === internalProject, then replaceProject is a no-op, since we just return
  // the same value anyway. This is why we don't bother keeping an internalProjectRef.
  useEffect(() => {
    projectUtilities.replaceProject(externalProject);
  }, [externalProject, projectUtilities]);

  // finally, if our internalProject has changed, then we want to fire off our setProject callback
  // to update our external one too.
  // however, when the internalProject changes, we only want to fire off the callback if the internalProject
  // is diferent from the external project, and this is what we need to check via the ref.
  //
  // There is only one case where this check succceeds and we don't call the callback - after `replaceProject`
  // is called. That means that our project changed externally and we were given new data. In that case, we
  // don't want to trigger the callback, because we'd just be handing back exactly what was passed in.
  //
  // That's what the extra ref and the hoop jumping protects us from.
  useEffect(() => {
    if (
      internalProject !== previousInternalProjectRef.current &&
      internalProject !== externalProjectRef.current
    ) {
      previousInternalProjectRef.current = internalProject;
      setProject(internalProject);
    }
  }, [internalProject, setProject]);

  // finally, return our internalProject and our projectUtilities.
  return [internalProject, projectUtilities];
};

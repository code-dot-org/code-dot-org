// Hook that translates a Lab2 level + initialSources payload into Java Lab's
// editorRedux state. Replaces the source-handling block of Javalab.prototype.init.

import {useEffect} from 'react';

import {ProjectSources} from '@cdo/apps/lab2/types';
import {useAppDispatch} from '@cdo/apps/util/reduxHooks';

import {
  setAllSourcesAndFileMetadata,
  setAllValidation,
} from '../redux/editorRedux';
import {
  setIsStartMode,
  setLevelName,
  setIsReadOnlyWorkspace,
  setHasOpenCodeReview,
  setValidationPassed,
} from '../redux/javalabRedux';

import {isJavalabSource, JavalabLevelProperties, JavalabSource} from './types';

// Resolve the effective set of source files for a Java Lab level, in
// priority order:
//   1. exemplar (when editing or viewing an exemplar)
//   2. last-attempt saved sources, threaded through lab2 initialSources
//   3. start sources from the level config
// Returns undefined if no source is available.
function resolveSources(
  levelProperties: JavalabLevelProperties,
  initialSources: ProjectSources | undefined
): JavalabSource | undefined {
  const exemplar = levelProperties.exemplarSources as JavalabSource | undefined;
  if (exemplar && Object.keys(exemplar).length > 0) {
    return exemplar;
  }

  if (initialSources && isJavalabSource(initialSources.source)) {
    return initialSources.source;
  }

  const start = levelProperties.startSources as JavalabSource | undefined;
  if (start && Object.keys(start).length > 0) {
    return start;
  }

  return undefined;
}

export interface UseJavalabSourcesOptions {
  levelProperties: JavalabLevelProperties;
  initialSources: ProjectSources | undefined;
  isStartMode: boolean;
  isReadOnlyWorkspace: boolean;
  hasOpenCodeReview: boolean;
}

export default function useJavalabSources({
  levelProperties,
  initialSources,
  isStartMode,
  isReadOnlyWorkspace,
  hasOpenCodeReview,
}: UseJavalabSourcesOptions): void {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const sources = resolveSources(levelProperties, initialSources);
    const validation = levelProperties.validation || {};

    if (isStartMode) {
      // In start mode the levelbuilder edits both the user-visible starter
      // files AND the hidden validation files in one editor, so merge them.
      // Mark each file's role explicitly to keep the legacy reducer happy.
      const merged: JavalabSource = {};
      if (sources) {
        for (const [name, file] of Object.entries(sources)) {
          merged[name] = {...file, isValidation: false};
        }
      }
      for (const [name, code] of Object.entries(validation)) {
        merged[name] = {
          text: code,
          tabOrder: Object.keys(merged).length,
          isValidation: true,
          isVisible: false,
        };
      }
      dispatch(setAllSourcesAndFileMetadata(merged, isStartMode));
    } else if (sources) {
      dispatch(setAllSourcesAndFileMetadata(sources, false));
    }

    // Validation is stored separately (as names-only outside start mode) so
    // the editor can detect filename collisions without exposing the test
    // code to students. The legacy reducer expects an EditorFilesMap, so
    // we lift the names-only shape into one with empty text fields.
    const validationEntries = Object.entries(validation);
    const hasValidation = validationEntries.length > 0;
    if (!isStartMode && hasValidation) {
      const validationAsFiles: JavalabSource = {};
      validationEntries.forEach(([name, code], index) => {
        validationAsFiles[name] = {
          text: code,
          tabOrder: index,
          isValidation: true,
          isVisible: false,
        };
      });
      dispatch(setAllValidation(validationAsFiles));
    }

    // If validation exists and the level isn't already passing, mark
    // validation as not yet satisfied. Mirrors legacy Javalab.init.
    if (hasValidation) {
      dispatch(setValidationPassed(false));
    } else {
      dispatch(setValidationPassed(true));
    }

    dispatch(setIsStartMode(isStartMode));
    dispatch(setLevelName(levelProperties.name));
    dispatch(setIsReadOnlyWorkspace(isReadOnlyWorkspace));
    dispatch(setHasOpenCodeReview(hasOpenCodeReview));
    // Reload whenever the active level changes so that no-reload nav picks
    // up the new level's sources, validation, and metadata.
  }, [
    dispatch,
    levelProperties,
    initialSources,
    isStartMode,
    isReadOnlyWorkspace,
    hasOpenCodeReview,
  ]);
}

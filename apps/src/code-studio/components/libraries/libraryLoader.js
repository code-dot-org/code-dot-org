/*global dashboard*/
import libraryParser from './libraryParser';
import annotationList from '@cdo/apps/acemode/annotationList';

export function load(onCodeError, onMissingFunctions, onSuccess) {
  var error = annotationList.getJSLintAnnotations().find(annotation => {
    return annotation.type === 'error';
  });
  if (error) {
    onCodeError();
    return;
  }

  dashboard.project.getUpdatedSourceAndHtml_(response => {
    let functionsList = libraryParser.getFunctions(response.source);
    if (!functionsList || functionsList.length === 0) {
      onMissingFunctions();
      return;
    }
    let librarySource = response.source;
    if (response.libraries) {
      response.libraries.forEach(library => {
        librarySource =
          libraryParser.createLibraryClosure(library) + librarySource;
      });
    }
    onSuccess({
      libraryName: dashboard.project.getLevelName(),
      librarySource: librarySource,
      sourceFunctionList: functionsList
    });
  });
}

export default {
  load
};

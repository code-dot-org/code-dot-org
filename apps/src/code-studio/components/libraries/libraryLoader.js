/*global dashboard*/
import libraryParser from './libraryParser';
import annotationList from '@cdo/apps/acemode/annotationList';

/**
 * Gathers all known metadata about a user-created library and passes that data
 * into the given callbacks. This metadata is gathered from the code in the
 * library's source project.
 * @param {function} onCodeError the callback used when there is a bug detected
 *                   in the library's code.
 * @param {function} onMissingFunctions the callback used when no functions are
 *                   detected in the library's code.
 * @param {function} onSuccess the callback used when a library has been
 *                   successfully loaded. All details about the library are
 *                   passed to this callback.
 */
export default function load(onCodeError, onMissingFunctions, onSuccess) {
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

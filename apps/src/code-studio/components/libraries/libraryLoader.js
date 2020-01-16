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
export default function load(clientApi, onCodeError, onMissingFunctions, onSuccess) {
  var error = annotationList.getJSLintAnnotations().find(annotation => {
    return annotation.type === 'error';
  });

  if (error) {
    onCodeError();
    return;
  }

  let projectName = dashboard.project.getLevelName();
  let sourceAndHtml, publishedLibrary;

  let getSource = new Promise((resolve, reject) => {
    dashboard.project.getUpdatedSourceAndHtml_(response => {
      sourceAndHtml = response;
      resolve();
    });
  });

  let getLibrary = new Promise((resolve, reject) => {
    clientApi.fetchLatest(
      data => {
        publishedLibrary = JSON.parse(data);
        resolve();
      },
      error => {
        resolve();
      }
    );
  });

  Promise.all([getSource, getLibrary]).then(() => {
    let functionsList = libraryParser.getFunctions(sourceAndHtml.source);
    if (!functionsList || functionsList.length === 0) {
      onMissingFunctions();
      return;
    }
    let librarySource = sourceAndHtml.source;
    if (sourceAndHtml.libraries) {
      sourceAndHtml.libraries.forEach(library => {
        librarySource =
          libraryParser.createLibraryClosure(library) + librarySource;
      });
    }

    let description = '';
    let selectedFunctions = {};
    let alreadyPublished = false;
    if (publishedLibrary) {
      alreadyPublished = true;
      description = publishedLibrary.description;
      projectName = publishedLibrary.name;
      publishedLibrary.functions.forEach(publishedFunction => {
        if (
          functionsList.find(
            projectFunction =>
              projectFunction.functionName === publishedFunction
          )
        ) {
          selectedFunctions[publishedFunction] = true;
        }
      });
    }

    onSuccess({
      libraryName: projectName,
      libraryDescription: description,
      librarySource: librarySource,
      sourceFunctionList: functionsList,
      selectedFunctions: selectedFunctions,
      alreadyPublished: alreadyPublished
    });
  });
}

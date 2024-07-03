import annotationList from '@cdo/apps/acemode/annotationList';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import loadLibrary from '@cdo/apps/code-studio/components/libraries/libraryLoader';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';


import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

describe('libraryLoader.load', () => {
  let libraryClientApi, fetchStub, getJSLintAnnotationsStub, sourceStub;
  let onErrorStub, onSuccessStub, functionStub;
  let libraryName = 'Name';
  let source = 'function foo() {}';
  beforeAll(() => {
    replaceOnWindow('dashboard', {
      project: {
        getUpdatedSourceAndHtml_: () => {},
        getLevelName: () => {},
      },
    });
    libraryClientApi = new LibraryClientApi('123');
  });

  afterAll(() => {
    restoreOnWindow('dashboard');
  });

  beforeEach(() => {
    getJSLintAnnotationsStub = jest.spyOn(annotationList, 'getJSLintAnnotations').mockClear().mockImplementation();
    sourceStub = jest.spyOn(window.dashboard.project, 'getUpdatedSourceAndHtml_').mockClear().mockImplementation();
    functionStub = jest.spyOn(libraryParser, 'getFunctions').mockClear().mockImplementation();
    jest.spyOn(window.dashboard.project, 'getLevelName').mockClear().mockReturnValue(libraryName);
    fetchStub = jest.spyOn(libraryClientApi, 'fetchLatest').mockClear().mockImplementation();
    onErrorStub = jest.fn();
    onSuccessStub = jest.fn();
  });

  afterEach(() => {
    annotationList.getJSLintAnnotations.mockRestore();
    window.dashboard.project.getUpdatedSourceAndHtml_.mockRestore();
    libraryParser.getFunctions.mockRestore();
    window.dashboard.project.getLevelName.mockRestore();
    libraryClientApi.fetchLatest.mockRestore();
    onErrorStub.mockReset();
    onSuccessStub.mockReset();
  });

  it('calls onError when an error exists in the code', async () => {
    getJSLintAnnotationsStub.mockReturnValue([{type: 'error'}]);

    await loadLibrary(libraryClientApi, onErrorStub, onSuccessStub);

    expect(onErrorStub).toHaveBeenCalled();
    expect(onSuccessStub).not.toHaveBeenCalled();
  });

  it('calls onError when there are no functions', async () => {
    getJSLintAnnotationsStub.mockReturnValue([]);
    sourceStub.yields({source: ''});
    fetchStub.mockImplementation((...args) => args[1](undefined, 404));
    functionStub.mockReturnValue([]);

    await loadLibrary(libraryClientApi, onErrorStub, onSuccessStub);

    expect(onErrorStub).toHaveBeenCalled();
    expect(onSuccessStub).not.toHaveBeenCalled();
  });

  it('prepends imported libraries to the exported source', async () => {
    let library = 'function bar() {}';
    let sourceFunctionList = [{functionName: 'foo', comment: ''}];
    getJSLintAnnotationsStub.mockReturnValue([]);
    functionStub.mockReturnValue(sourceFunctionList);
    sourceStub.yields({source: source, libraries: [library]});
    fetchStub.mockImplementation((...args) => args[1](undefined, 404));
    jest.spyOn(libraryParser, 'createLibraryClosure').mockClear().mockReturnValue(library);

    await loadLibrary(libraryClientApi, onErrorStub, onSuccessStub);

    expect(onErrorStub).not.toHaveBeenCalled();
    expect(onSuccessStub).toHaveBeenCalledWith({
      alreadyPublished: false,
      libraryDescription: '',
      libraryName: libraryName,
      librarySource: library + source,
      selectedFunctions: {},
      sourceFunctionList: sourceFunctionList,
    });

    libraryParser.createLibraryClosure.mockRestore();
  });

  it('pre-sets library values to the values of the already-published library', async () => {
    let sourceFunctionList = [
      {functionName: 'foo', comment: ''},
      {functionName: 'bar', comment: ''},
    ];
    let existingLibrary = {
      description: 'description',
      name: 'existingLibraryName',
      functions: ['foo', 'baz'],
    };
    getJSLintAnnotationsStub.mockReturnValue([]);
    functionStub.mockReturnValue(sourceFunctionList);
    sourceStub.yields({source: source});
    fetchStub.mockImplementation((...args) => args[0](JSON.stringify(existingLibrary)));

    await loadLibrary(libraryClientApi, onErrorStub, onSuccessStub);

    expect(onErrorStub).not.toHaveBeenCalled();
    expect(onSuccessStub).toHaveBeenCalledWith({
      alreadyPublished: true,
      libraryDescription: existingLibrary.description,
      libraryName: existingLibrary.name,
      librarySource: source,
      selectedFunctions: {foo: true},
      sourceFunctionList: sourceFunctionList,
    });
  });
});

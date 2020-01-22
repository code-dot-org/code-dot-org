import {expect} from '../../../../util/reconfiguredChai';
import annotationList from '@cdo/apps/acemode/annotationList';
import sinon from 'sinon';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';
import loadLibrary from '@cdo/apps/code-studio/components/libraries/libraryLoader';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';

describe('libraryLoader.load', () => {
  let getJSLintAnnotationsStub, sourceStub, functionStub;
  let onCodeErrorStub, onMissingFunctionsStub, onSuccessStub;
  let libraryName = 'Name';
  let source = 'function foo() {}';
  before(() => {
    replaceOnWindow('dashboard', {
      project: {
        getUpdatedSourceAndHtml_: () => {},
        getLevelName: () => {}
      }
    });
  });

  after(() => {
    restoreOnWindow('dashboard');
  });

  beforeEach(() => {
    getJSLintAnnotationsStub = sinon.stub(
      annotationList,
      'getJSLintAnnotations'
    );
    sourceStub = sinon.stub(
      window.dashboard.project,
      'getUpdatedSourceAndHtml_'
    );
    functionStub = sinon.stub(libraryParser, 'getFunctions');
    sinon.stub(window.dashboard.project, 'getLevelName').returns(libraryName);
    onCodeErrorStub = sinon.stub();
    onMissingFunctionsStub = sinon.stub();
    onSuccessStub = sinon.stub();
  });

  afterEach(() => {
    annotationList.getJSLintAnnotations.restore();
    window.dashboard.project.getUpdatedSourceAndHtml_.restore();
    libraryParser.getFunctions.restore();
    window.dashboard.project.getLevelName.restore();
    onCodeErrorStub.resetHistory();
    onMissingFunctionsStub.resetHistory();
    onSuccessStub.resetHistory();
  });

  it('calls onCodeError when an error exists in the code', () => {
    getJSLintAnnotationsStub.returns([{type: 'error'}]);

    loadLibrary(onCodeErrorStub, onMissingFunctionsStub, onSuccessStub);

    expect(onCodeErrorStub.called).to.be.true;
    expect(onMissingFunctionsStub.called).to.be.false;
    expect(onSuccessStub.called).to.be.false;
  });

  it('calls onMissingFunctions when there are no functions', () => {
    getJSLintAnnotationsStub.returns([]);
    sourceStub.yields({source: ''});
    functionStub.returns([]);

    loadLibrary(onCodeErrorStub, onMissingFunctionsStub, onSuccessStub);

    expect(onCodeErrorStub.called).to.be.false;
    expect(onMissingFunctionsStub.called).to.be.true;
    expect(onSuccessStub.called).to.be.false;
  });

  it('prepends imported libraries to the exported source', () => {
    let library = 'function bar() {}';
    let sourceFunctionList = [{functionName: 'foo', comment: ''}];
    getJSLintAnnotationsStub.returns([]);
    functionStub.returns(sourceFunctionList);
    sourceStub.yields({source: source, libraries: [library]});
    sinon.stub(libraryParser, 'createLibraryClosure').returns(library);

    loadLibrary(onCodeErrorStub, onMissingFunctionsStub, onSuccessStub);

    expect(onCodeErrorStub.called).to.be.false;
    expect(onMissingFunctionsStub.called).to.be.false;
    expect(onSuccessStub).to.have.been.calledWith({
      libraryName: libraryName,
      librarySource: library + source,
      sourceFunctionList: sourceFunctionList
    });

    libraryParser.createLibraryClosure.restore();
  });
});

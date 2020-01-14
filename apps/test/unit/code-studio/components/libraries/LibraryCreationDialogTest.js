import {expect, assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {shallow} from 'enzyme';
import {
  UnconnectedLibraryCreationDialog as LibraryCreationDialog,
  PublishState
} from '@cdo/apps/code-studio/components/libraries/LibraryCreationDialog.jsx';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import sinon from 'sinon';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';
import {replaceOnWindow, restoreOnWindow} from '../../../../util/testUtils';
import annotationList from '@cdo/apps/acemode/annotationList';

const LIBRARY_SOURCE =
  '/*\n' +
  'Everything in this block comment\n' +
  'will be included as-is\n' +
  '\n' +
  'including the whitespace above it\n' +
  '*/\n' +
  'function myFunc2(n) {\n' +
  '}\n' +
  '\n' +
  '// This comment will not be included\n' +
  '/* \n' +
  'This comment will be included.\n' +
  '*/\n' +
  'function myFunc3() {\n' +
  '}\n' +
  '\n' +
  '/**/\n' +
  'function theAboveCommentWillNotBreakThings() {\n' +
  '}';

describe('LibraryCreationDialog', () => {
  let wrapper;
  let clientApi;
  let publishSpy;

  const SUBMIT_SELECTOR = 'input[type="submit"]';
  const CHECKBOX_SELECTOR = 'input[type="checkbox"]';
  const CHANNEL_ID_SELECTOR = 'input[type="text"]';

  before(() => {
    replaceOnWindow('dashboard', {
      project: {
        setLibraryName: () => {},
        setLibraryDescription: () => {},
        getCurrentId: () => {},
        getUpdatedSourceAndHtml_: () => {},
        getLevelName: () => {}
      }
    });
    sinon.stub(window.dashboard.project, 'setLibraryName').returns(undefined);
    sinon
      .stub(window.dashboard.project, 'setLibraryDescription')
      .returns(undefined);
    sinon.stub(window.dashboard.project, 'getCurrentId').returns('123');
    clientApi = new LibraryClientApi('123');
    publishSpy = sinon.stub(clientApi, 'publish');
  });

  after(() => {
    restoreOnWindow('dashboard');
  });

  beforeEach(() => {
    wrapper = shallow(
      <LibraryCreationDialog
        clientApi={clientApi}
        dialogIsOpen={true}
        onClose={() => {}}
      />
    );
  });

  afterEach(() => {
    wrapper = null;
  });

  describe('onOpen', () => {
    let getJSLintAnnotationsStub, sourceStub, functionStub;
    let libraryName = 'Name';
    let source = 'function foo() {}';
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
      sinon.stub(libraryParser, 'sanitizeName').returns(libraryName);
      sinon.stub(libraryParser, 'suggestName').returns(libraryName);
      sinon.stub(window.dashboard.project, 'getLevelName').returns(libraryName);
    });

    afterEach(() => {
      annotationList.getJSLintAnnotations.restore();
      window.dashboard.project.getUpdatedSourceAndHtml_.restore();
      libraryParser.getFunctions.restore();
      libraryParser.sanitizeName.restore();
      libraryParser.suggestName.restore();
      window.dashboard.project.getLevelName.restore();
    });

    it('sets the loading state to CODE_ERROR when a code error exists', () => {
      getJSLintAnnotationsStub.returns([{type: 'error'}]);
      wrapper.instance().onOpen();
      wrapper.update();
      expect(wrapper.state().publishState).to.equal(PublishState.CODE_ERROR);
    });

    it('sets loading state to NO_FUNCTIONS when there are no functions', () => {
      getJSLintAnnotationsStub.returns([]);
      sourceStub.yields({source: ''});
      functionStub.returns([]);

      wrapper.instance().onOpen();
      wrapper.update();
      expect(wrapper.state().publishState).to.equal(PublishState.NO_FUNCTIONS);
    });

    it('sets loading state to DONE_LOADING on success', () => {
      getJSLintAnnotationsStub.returns([]);
      functionStub.returns([{functionName: 'foo', comment: ''}]);
      sourceStub.yields({source: source});

      wrapper.instance().onOpen();
      wrapper.update();
      expect(wrapper.state().publishState).to.equal(PublishState.DONE_LOADING);
      expect(wrapper.state().librarySource).to.equal(source);
      expect(wrapper.state().libraryName).to.equal(libraryName);
    });

    it('prepends imported libraries to the exported source', () => {
      let library = 'function bar() {}';
      getJSLintAnnotationsStub.returns([]);
      functionStub.returns([{functionName: 'foo', comment: ''}]);
      sourceStub.yields({source: source, libraries: [library]});
      sinon.stub(libraryParser, 'createLibraryClosure').returns(library);

      wrapper.instance().onOpen();
      wrapper.update();
      expect(wrapper.state().publishState).to.equal(PublishState.DONE_LOADING);
      expect(wrapper.state().librarySource).to.equal(library + source);
      expect(wrapper.state().libraryName).to.equal(libraryName);

      libraryParser.createLibraryClosure.restore();
    });
  });

  describe('UI', () => {
    let libraryName = 'testLibrary';
    it('checkbox is disabled for items without comments', () => {
      wrapper.setState({
        libraryName: libraryName,
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.DONE_LOADING,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      assert.isTrue(
        wrapper
          .find(CHECKBOX_SELECTOR)
          .last()
          .prop('disabled')
      );
    });

    it('displays loading while in the loading state', () => {
      expect(wrapper.find(SUBMIT_SELECTOR).exists()).to.be.false;
      expect(wrapper.find(Spinner).exists()).to.be.true;
    });

    it('displays channel id when in published state', () => {
      wrapper.setState({
        libraryName: libraryName,
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.PUBLISHED,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      expect(wrapper.find(CHANNEL_ID_SELECTOR).props().value).to.equal('123');
    });
  });

  describe('publish', () => {
    let libraryName = 'testLibrary';
    let description = 'description';
    let selectedFunctions = {myFunc2: true};
    it('is disabled when no functions are checked', () => {
      wrapper.setState({
        libraryName: libraryName,
        libraryDescription: description,
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.DONE_LOADING,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      wrapper.instance().publish();
      wrapper.update();

      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);
    });

    it('is disabled when description is unset', () => {
      wrapper.setState({
        libraryName: libraryName,
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.DONE_LOADING,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE),
        selectedFunctions: selectedFunctions
      });

      wrapper.instance().publish();
      wrapper.update();

      expect(wrapper.state().publishState).to.equal(PublishState.INVALID_INPUT);
    });

    describe('with valid input', () => {
      let libraryJsonSpy;
      beforeEach(() => {
        libraryJsonSpy = sinon.stub(libraryParser, 'createLibraryJson');
      });

      afterEach(() => {
        libraryParser.createLibraryJson.restore();
      });

      it('sets error state when publish fails', () => {
        publishSpy.callsArg(1);
        sinon.stub(console, 'warn');
        wrapper.setState({
          libraryName: libraryName,
          librarySource: LIBRARY_SOURCE,
          publishState: PublishState.DONE_LOADING,
          sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE),
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        wrapper.instance().publish();
        wrapper.update();

        expect(wrapper.state().publishState).to.equal(
          PublishState.ERROR_PUBLISH
        );

        console.warn.restore();
      });

      it('sets PUBLISHED state when it succeeds', () => {
        publishSpy.callsArg(2);
        wrapper.setState({
          libraryName: libraryName,
          librarySource: LIBRARY_SOURCE,
          publishState: PublishState.DONE_LOADING,
          sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE),
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        wrapper.instance().publish();
        wrapper.update();

        expect(wrapper.state().publishState).to.equal(PublishState.PUBLISHED);
      });

      it('publishes only the selected functions and description', () => {
        let functionList = libraryParser.getFunctions(LIBRARY_SOURCE);
        wrapper.setState({
          libraryName: libraryName,
          librarySource: LIBRARY_SOURCE,
          publishState: PublishState.DONE_LOADING,
          sourceFunctionList: functionList,
          libraryDescription: description,
          selectedFunctions: selectedFunctions
        });

        wrapper.instance().publish();
        wrapper.update();

        expect(libraryJsonSpy).to.have.been.calledOnceWith(
          LIBRARY_SOURCE,
          [functionList[0]],
          libraryName,
          description
        );
      });
    });
  });
});

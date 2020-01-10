import {expect, assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
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
  const DESCRIPTION_SELECTOR = 'textarea';
  const CHANNEL_ID_SELECTOR = 'input[type="text"]';
  const PUBLISH_ERROR_SELECTOR = '#error-alert';

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
    wrapper = mount(
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
    let libraryName = 'name';
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
      sinon.stub(window.dashboard.project, 'getLevelName').returns(libraryName);
    });

    afterEach(() => {
      annotationList.getJSLintAnnotations.restore();
      window.dashboard.project.getUpdatedSourceAndHtml_.restore();
      libraryParser.getFunctions.restore();
      libraryParser.sanitizeName.restore();
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
    it('publish is disabled when nothing checked', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.DONE_LOADING,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      assert.isTrue(wrapper.find(SUBMIT_SELECTOR).prop('disabled'));
    });

    it('publish is enabled when something is checked', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.DONE_LOADING,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      wrapper
        .find(CHECKBOX_SELECTOR)
        .first()
        .instance().checked = true;
      wrapper
        .find(CHECKBOX_SELECTOR)
        .first()
        .simulate('click');
      assert.isFalse(wrapper.find(SUBMIT_SELECTOR).prop('disabled'));
    });

    it('checkbox is disabled for items without comments', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
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

    it('description is required', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.DONE_LOADING,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      assert.isTrue(
        wrapper
          .find(DESCRIPTION_SELECTOR)
          .last()
          .prop('required')
      );
    });

    it('displays channel id when in published state', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.PUBLISHED,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      assert.isTrue(
        wrapper.find(CHANNEL_ID_SELECTOR).instance().value === '123'
      );
    });

    it('does not display publish error message when loading is finished before publish', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.LOADING,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      expect(wrapper.find(PUBLISH_ERROR_SELECTOR).exists()).to.be.false;
    });

    it('displays publish error message after being set to error state', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.ERROR_PUBLISH,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      expect(wrapper.find(PUBLISH_ERROR_SELECTOR).exists()).to.be.true;
    });
  });

  describe('publish', () => {
    it('publishes only the selected functions and description', () => {
      let functionList = libraryParser.getFunctions(LIBRARY_SOURCE);
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        publishState: PublishState.DONE_LOADING,
        sourceFunctionList: functionList
      });

      // Select a function and write a description
      wrapper
        .find(CHECKBOX_SELECTOR)
        .first()
        .instance().checked = true;
      wrapper
        .find(CHECKBOX_SELECTOR)
        .first()
        .simulate('click');
      assert.isFalse(wrapper.find(SUBMIT_SELECTOR).prop('disabled'));

      wrapper.find(DESCRIPTION_SELECTOR).instance().value =
        'This is the description';
      wrapper.find(DESCRIPTION_SELECTOR).simulate('change');
      assert.isFalse(wrapper.find(SUBMIT_SELECTOR).prop('disabled'));

      wrapper.find(SUBMIT_SELECTOR).simulate('submit');
      let submitValue = libraryParser.createLibraryJson(
        LIBRARY_SOURCE,
        [functionList[0]],
        'testLibrary',
        'This is the description'
      );

      expect(publishSpy).to.have.been.calledOnceWith(submitValue);
    });
  });
});

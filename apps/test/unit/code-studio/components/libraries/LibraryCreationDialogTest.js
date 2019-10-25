import {expect, assert} from '../../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import {UnconnectedLibraryCreationDialog as LibraryCreationDialog} from '@cdo/apps/code-studio/components/libraries/LibraryCreationDialog.jsx';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';
import LibraryClientApi from '@cdo/apps/code-studio/components/libraries/LibraryClientApi';
import sinon from 'sinon';
import Spinner from '@cdo/apps/code-studio/pd/components/spinner';

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
  let clientApi = new LibraryClientApi('123');
  let publishSpy = sinon.stub(clientApi, 'publish');

  const SUBMIT_SELECTOR = 'input[type="submit"]';
  const CHECKBOX_SELECTOR = 'input[type="checkbox"]';
  const DESCRIPTION_SELECTOR = 'textarea';

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

  describe('UI', () => {
    it('publish is disabled when nothing checked', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        loadingFinished: true,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      assert.isTrue(wrapper.find(SUBMIT_SELECTOR).prop('disabled'));
    });

    it('publish is enabled when something is checked', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        loadingFinished: true,
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
        loadingFinished: true,
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
        loadingFinished: true,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      assert.isTrue(
        wrapper
          .find(DESCRIPTION_SELECTOR)
          .last()
          .prop('required')
      );
    });
  });

  describe('publish', () => {
    it('publishes only the selected functions and description', () => {
      let functionList = libraryParser.getFunctions(LIBRARY_SOURCE);
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        loadingFinished: true,
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

import {expect} from '../../../../util/reconfiguredChai';
import React from 'react';
import {mount} from 'enzyme';
import {UnconnectedLibraryCreationDialog as LibraryCreationDialog} from '@cdo/apps/code-studio/components/libraries/LibraryCreationDialog.jsx';
import libraryParser from '@cdo/apps/code-studio/components/libraries/libraryParser';
import LibraryClientApi from '../../../../../src/code-studio/components/libraries/LibraryClientApi';

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

  const SUBMIT_SELECTOR = 'input[type="submit"]';
  const CHECKBOX_SELECTOR = 'input[type="checkbox"]';
  const DESCRIPTION_SELECTOR = 'textarea';
  describe('UI', () => {
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

    it('publish is disabled when nothing checked', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        loadingFinished: true,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      expect(wrapper.find(SUBMIT_SELECTOR)).to.be.disabled;
    });

    it('publish is enabled when something is checked', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        loadingFinished: true,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE),
        canPublish: true
      });

      expect(wrapper.find(SUBMIT_SELECTOR)).not.to.be.disabled;
    });

    it('checkbox is disabled for items without comments', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        loadingFinished: true,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      expect(wrapper.find(CHECKBOX_SELECTOR).last()).to.be.disabled;
    });

    it('displays loading while in the loading state', () => {
      expect(wrapper.find(SUBMIT_SELECTOR).exists()).to.be.false;
      expect(wrapper.find('#loading').exists()).to.be.true;
    });

    it('description is required', () => {
      wrapper.setState({
        libraryName: 'testLibrary',
        librarySource: LIBRARY_SOURCE,
        loadingFinished: true,
        sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
      });

      expect(wrapper.find(DESCRIPTION_SELECTOR)).to.be.required;
    });
  });
});

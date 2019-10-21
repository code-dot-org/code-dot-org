import {expect} from '../../../../util/configuredChai';
import React from 'react';
import {mount} from 'enzyme';
import {UnconnectedLibraryCreationDialog as LibraryCreationDialog} from '@cdo/apps/code-studio/components/Libraries/LibraryCreationDialog.jsx';
import libraryParser from '@cdo/apps/code-studio/components/Libraries/libraryParser';

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
  beforeEach(() => {
    wrapper = mount(
      <LibraryCreationDialog
        channelId={'123'}
        dialogIsOpen={true}
        onClose={() => {}}
      />
    );
  });

  const SUBMIT_SELECTOR = 'input[type="submit"]';
  const CHECKBOX_SELECTOR = 'input[type="checkbox"]';

  it('publish is disabled when nothing checked', () => {
    wrapper.setState({
      libraryName: 'testLibrary',
      librarySource: LIBRARY_SOURCE,
      loadingFinished: true,
      sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
    });
    wrapper.update();

    expect(wrapper.find(SUBMIT_SELECTOR)).to.be.disabled();
  });

  it('publish is enabled when something is checked', () => {
    wrapper.setState({
      libraryName: 'testLibrary',
      librarySource: LIBRARY_SOURCE,
      loadingFinished: true,
      sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE),
      canPublish: true
    });
    wrapper.update();

    expect(wrapper.find(SUBMIT_SELECTOR)).not.to.be.disabled();
  });

  it('checkbox is diabled for items without comments', () => {
    wrapper.setState({
      libraryName: 'testLibrary',
      librarySource: LIBRARY_SOURCE,
      loadingFinished: true,
      sourceFunctionList: libraryParser.getFunctions(LIBRARY_SOURCE)
    });

    wrapper.update();

    expect(wrapper.find(CHECKBOX_SELECTOR).last()).to.be.disabled();
  });

  it('displays loading while in the loading state', () => {
    wrapper.setState({
      loadingFinished: false
    });
    wrapper.update();
    expect(wrapper.find(SUBMIT_SELECTOR)).not.to.exist;
    expect(wrapper.find('#loading')).to.exist;
  });
});

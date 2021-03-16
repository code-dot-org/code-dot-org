import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import {assert} from 'chai';

import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import FoormLibraryEditorManager from '../../../../../src/code-studio/pd/foorm/FoormLibraryEditorManager';
import FoormLibraryEditor from '../../../../../src/code-studio/pd/foorm/FoormLibraryEditor';
import foorm, {
  setLibraryData,
  setLibraryQuestionData
} from '../../../../../src/code-studio/pd/foorm/library_editor/foormLibraryEditorRedux';
import sinon from 'sinon';
import _ from 'lodash';
import {DropdownButton} from 'react-bootstrap';

global.$ = require('jquery');

describe('FoormLibraryEditorManager', () => {
  let defaultProps, store, server, wrapper;
  beforeEach(() => {
    stubRedux();
    registerReducers({foorm});

    // *** Update this to do library question get after library selected
    server = sinon.fakeServer.create();
    server.respondWith('GET', /foorm\/libraries\/[0-9]+\/question_names/, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify([{id: 2, name: 'a_library_question_name', type: 'radio'}])
    ]);

    store = getStore();

    // note libraryNamesAndVersions will no longer be passed as a prop
    // to this component once refactored with foorm entity manager
    defaultProps = {
      populateCodeMirror: () => {},
      resetCodeMirror: () => {},
      libraryNamesAndVersions: [{id: 1, name: 'a_library_name', version: 0}],
      libraryCategories: ['surveys/pd']
    };

    wrapper = mount(
      <Provider store={store}>
        <FoormLibraryEditorManager {...defaultProps} />
      </Provider>
    );
  });

  afterEach(() => {
    restoreRedux();
  });

  const sampleExistingLibraryQuestionData = {
    question: {},
    name: 'sample_library_question_name',
    id: 0
  };

  const sampleExistingLibraryData = {
    name: 'sample_library_name',
    version: 0,
    id: 1
  };

  const sampleSaveResponseData = {
    question: '{}',
    name: 'sample_library_question_name',
    id: 1
  };
  it('keeps library question choice disabled and editor hidden on load', () => {
    assert(
      wrapper
        .find(DropdownButton)
        .at(1)
        .prop('disabled')
    );

    assert.equal(wrapper.find(FoormLibraryEditor).length, 0);
  });

  it('enables library question choice and keeps editor hidden on library load', () => {
    // should figure out how to execute this onclick
    wrapper.instance().loadLibraryQuestions();

    server.respond();
    wrapper.update();

    assert(
      wrapper
        .find(DropdownButton)
        .at(1)
        .prop('disabled')
    );
  });

  it('shows editor on library question load', () => {});

  it('shows blank editor on new library click', () => {});

  it('shows blank editor on new library question click', () => {});
});

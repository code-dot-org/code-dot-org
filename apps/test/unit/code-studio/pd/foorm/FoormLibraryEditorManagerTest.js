import React from 'react';
import {mount} from 'enzyme';
import {assert} from 'chai';

import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import FoormEntityEditor from '@cdo/apps/code-studio/pd/foorm/editor/components/FoormEntityEditor';
import FoormLibraryEditorManager, {
  UnconnectedFoormLibraryEditorManager
} from '@cdo/apps/code-studio/pd/foorm/editor/library/FoormLibraryEditorManager';
import foorm from '../../../../../src/code-studio/pd/foorm/editor/foormEditorRedux';
import sinon from 'sinon';
import {Button, DropdownButton} from 'react-bootstrap';

global.$ = require('jquery');

describe('FoormLibraryEditorManager', () => {
  let defaultProps, store, server, wrapper;
  beforeEach(() => {
    stubRedux();
    registerReducers({foorm});

    // Default fake server is set up to respond to selection of a library
    // and return a single library question.
    server = sinon.fakeServer.create();
    server.respondWith('GET', /foorm\/libraries\/[0-9]+\/question_names/, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify([{id: 2, name: 'a_library_question_name', type: 'radio'}])
    ]);

    store = getStore();

    defaultProps = {
      populateCodeMirror: () => {},
      resetCodeMirror: () => {},
      categories: ['surveys/pd']
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

  it('keeps library question choice disabled and editor hidden on load', () => {
    assert(
      wrapper
        .find(DropdownButton)
        .at(1)
        .prop('disabled')
    );

    assert.equal(wrapper.find(FoormEntityEditor).length, 0);
  });

  it('enables library question choice and keeps editor hidden on library load', () => {
    // Tricky to click item within menu -- executing click handler directly.
    const unconnectedManager = wrapper
      .find(UnconnectedFoormLibraryEditorManager)
      .instance();

    unconnectedManager.loadLibraryQuestionChoices(sampleExistingLibraryData);

    assert(
      wrapper
        .find(DropdownButton)
        .at(1)
        .prop('disabled')
    );

    server.respond();
    wrapper.update();

    assert.isFalse(
      wrapper
        .find(DropdownButton)
        .at(1)
        .prop('disabled')
    );
  });

  it('waits to show editor until library question load', () => {
    server.respondWith('GET', '/foorm/library_questions/0', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleExistingLibraryQuestionData)
    ]);

    assert.equal(wrapper.find(FoormEntityEditor).length, 0);

    // Tricky to click item within menu -- executing click handler directly.
    const unconnectedManager = wrapper
      .find(UnconnectedFoormLibraryEditorManager)
      .instance();

    unconnectedManager.loadLibraryQuestionChoices(sampleExistingLibraryData);

    server.respond();
    wrapper.update();

    assert.equal(wrapper.find(FoormEntityEditor).length, 0);

    unconnectedManager.loadLibraryQuestionData(
      sampleExistingLibraryQuestionData
    );

    server.respond();
    wrapper.update();

    assert.equal(wrapper.find(FoormEntityEditor).length, 1);
  });

  it('shows blank editor on new library click', () => {
    assert.equal(wrapper.find(FoormEntityEditor).length, 0);

    // The second button is "New Library"
    wrapper
      .find(Button)
      .at(1)
      .simulate('click');
    wrapper.update();

    assert.equal(wrapper.find(FoormEntityEditor).length, 1);
  });

  it('shows blank editor on new library question click', () => {
    // Need to select a library first before "New Library Question" button is enabled.
    // Tricky to click item within menu -- executing click handler directly.
    const unconnectedManager = wrapper
      .find(UnconnectedFoormLibraryEditorManager)
      .instance();

    unconnectedManager.loadLibraryQuestionChoices(sampleExistingLibraryData);

    assert.equal(wrapper.find(FoormEntityEditor).length, 0);

    // The fourth button is "New Library Question"
    wrapper
      .find(Button)
      .at(3)
      .simulate('click');
    wrapper.update();

    assert.equal(wrapper.find(FoormEntityEditor).length, 1);
  });
});

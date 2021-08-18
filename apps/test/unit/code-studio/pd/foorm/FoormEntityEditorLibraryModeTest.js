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
import FoormEntityEditor from '@cdo/apps/code-studio/pd/foorm/editor/components/FoormEntityEditor';
import FoormLibrarySaveBar, {
  UnconnectedFoormLibrarySaveBar
} from '@cdo/apps/code-studio/pd/foorm/editor/library/FoormLibrarySaveBar';
import foorm, {
  setLibraryData,
  setLibraryQuestionData
} from '../../../../../src/code-studio/pd/foorm/editor/foormEditorRedux';
import sinon from 'sinon';
import _ from 'lodash';
global.$ = require('jquery');

describe('FoormEntityEditor in Library editing mode', () => {
  let defaultProps, store, server, wrapper;
  beforeEach(() => {
    stubRedux();
    registerReducers({foorm});

    // Default response is that the library question being edited
    // does not appear in any published form.
    server = sinon.fakeServer.create();
    server.respondWith(
      'GET',
      /foorm\/library_questions\/[0-9]+\/published_forms_appeared_in/,
      [200, {'Content-Type': 'application/json'}, JSON.stringify([])]
    );

    store = getStore();

    const HeaderTitle = React.createElement('h1', null, 'A title');
    const SaveBar = React.createElement(FoormLibrarySaveBar, {
      resetCodeMirror: () => {},
      libraryCategories: ['surveys/pd', 'surveys/teacher']
    });

    defaultProps = {
      populateCodeMirror: () => {},
      preparePreview: () => {},
      previewQuestions: {},
      previewErrors: [],
      forceRerenderKey: 0,
      headerTitle: HeaderTitle,
      validateURL: '/a/fake/url',
      validateDataKey: 'a_string',
      saveBar: SaveBar
    };

    wrapper = mount(
      <Provider store={store}>
        <FoormEntityEditor {...defaultProps} />
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

  const sampleNewResponseData = {
    library_question: {
      question: '{"type": "html"}',
      name: 'new_library_question_name',
      id: 1
    },
    library: {
      id: 2,
      version: 0,
      name: 'new_library_name'
    }
  };

  const fakeSurveysAppearedIn = ['surveys/pd/a_form.0'];

  it('can save existing library question in existing library', () => {
    store.dispatch(setLibraryQuestionData(sampleExistingLibraryQuestionData));
    store.dispatch(setLibraryData(sampleExistingLibraryData));

    server.respondWith('PUT', '/foorm/library_questions/0', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleSaveResponseData)
    ]);

    const saveBar = wrapper.find(UnconnectedFoormLibrarySaveBar);

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // expect first response checking whether library question appears in any published forms
    server.respond();

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    // expect second response (upon successful save of the library question)
    server.respond();
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    //check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  });

  it('can save new library question in existing library', () => {
    store.dispatch(setLibraryData(sampleExistingLibraryData));

    server.respondWith('POST', '/foorm/library_questions', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleNewResponseData)
    ]);

    const saveBar = wrapper.find(UnconnectedFoormLibrarySaveBar);

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // expect first response checking whether library question appears in any published forms
    server.respond();

    assert.isFalse(_.some(fetchableLibraryQuestions, ['id', 1]));

    // simulate save click. Cannot click on button itself because it is in the modal
    // which is outside the wrapper.
    saveBar.instance().saveNewLibraryQuestion();

    // expect second response (upon successful save of the library question)
    server.respond();

    const fetchableLibraryQuestions = store.getState().foorm
      .fetchableSubEntities;
    assert(
      _.some(fetchableLibraryQuestions, ['id', 1]),
      'Newly saved library question does not appear in list of library questions for selected library'
    );
  });

  it('can save new library question in new library', () => {
    store.dispatch(setLibraryData(sampleExistingLibraryData));
    store.dispatch(setLibraryQuestionData(sampleExistingLibraryQuestionData));

    server.respondWith('POST', '/foorm/library_questions', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleNewResponseData)
    ]);

    const saveBar = wrapper.find(UnconnectedFoormLibrarySaveBar);

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // expect first response checking whether library question appears in any published forms
    server.respond();

    assert.isFalse(_.some(fetchableLibraries, ['id', 2]));
    assert.isFalse(_.some(fetchableLibraryQuestions, ['id', 1]));

    // simulate save click. Cannot click on button itself because it is in the modal
    // which is outside the wrapper.
    saveBar.instance().saveNewLibraryQuestion();

    // expect second response (upon successful save of the library question)
    server.respond();

    const fetchableLibraryQuestions = store.getState().foorm
      .fetchableSubEntities;
    const fetchableLibraries = store.getState().foorm.fetchableEntities;
    assert(
      _.some(fetchableLibraries, ['id', 2]),
      'Newly saved library does not appear in list of fetchable libraries'
    );
    assert(
      _.some(fetchableLibraryQuestions, ['id', 1]),
      'Newly saved library question does not appear in list of library questions for selected library'
    );
  });

  it('save published form pops up warning message', () => {
    store.dispatch(setLibraryData(sampleExistingLibraryData));
    store.dispatch(setLibraryQuestionData(sampleExistingLibraryQuestionData));

    // Response with non-zero length triggers warning
    server.respondWith(
      'GET',
      /foorm\/library_questions\/[0-9]+\/published_forms_appeared_in/,
      [
        200,
        {'Content-Type': 'application/json'},
        JSON.stringify(fakeSurveysAppearedIn)
      ]
    );

    const saveBar = wrapper.find(UnconnectedFoormLibrarySaveBar);

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // server tells us that library question appears in a published form
    server.respond();
    saveBar.update();

    // check that modal pops up
    assert(
      wrapper
        .find('ConfirmationDialog')
        .at(0)
        .prop('show'),
      'Save ConfirmationDialog is showing'
    );
  });

  it('shows save error', () => {
    store.dispatch(setLibraryData(sampleExistingLibraryData));
    store.dispatch(setLibraryQuestionData(sampleExistingLibraryQuestionData));

    server.respondWith('PUT', `/foorm/library_questions/0`, [
      500,
      {'Content-Type': 'application/json'},
      'Save error'
    ]);

    const saveBar = wrapper.find(UnconnectedFoormLibrarySaveBar);

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // expect first response checking whether library question appears in any published forms
    server.respond();

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    server.respond();
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    //check that save error message is showing
    expect(wrapper.find('.saveErrorMessage').length).to.equal(1);
    expect(
      wrapper.find('.saveErrorMessage').contains('Error Saving: Save error')
    ).to.be.true;
  });

  it('can cancel save new survey', () => {
    store.dispatch(setLibraryData(sampleExistingLibraryData));

    const saveBar = wrapper.find(UnconnectedFoormLibrarySaveBar);

    // click save button
    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // expect first response checking whether library question appears in any published forms
    server.respond();

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    // check that modal pops up
    assert(
      wrapper
        .find('Modal')
        .at(0)
        .prop('show'),
      'Save New Form Modal is showing'
    );

    // simulate cancel click. Cannot click on button itself because it is in the modal
    // which is outside the wrapper.
    saveBar.instance().handleNewLibraryQuestionSaveCancel();

    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    // check that last saved message is not showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(0);
  });
});

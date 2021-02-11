import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
// import {assert} from 'chai';

import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import {Provider} from 'react-redux';
import FoormLibraryEditor from '../../../../../src/code-studio/pd/foorm/FoormLibraryEditor';
import foorm, {
  setLibraryData,
  setLibraryQuestionData
} from '../../../../../src/code-studio/pd/foorm/library_editor/foormLibraryEditorRedux';
import sinon from 'sinon';

global.$ = require('jquery');

describe('FoormEditor', () => {
  let defaultProps, store;
  beforeEach(() => {
    stubRedux();
    registerReducers({foorm});

    store = getStore();

    defaultProps = {
      populateCodeMirror: () => {},
      resetCodeMirror: () => {},
      libraryCategories: ['surveys/pd']
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <FoormLibraryEditor {...combinedProps} />
      </Provider>
    );
  };

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

  // const samplePublishedFormData = {
  //   questions: {},
  //   published: true,
  //   name: 'sample_form_name',
  //   version: 0,
  //   id: 1
  // };
  //
  // const sampleNewFormData = {
  //   questions: {},
  //   published: null,
  //   name: null,
  //   version: null,
  //   id: null
  // };

  const sampleSaveData = {
    question: {},
    name: 'sample_library_question_name',
    id: 1
  };

  // can save library question and new library (and shows appropriate dialog) (and shows correct options in dropdown afterwards)
  // can save library question in existing library
  // can update library question in existing library
  // gets warning when trying to save library question in published survey

  it('can save existing library question in existing library', () => {
    let server = sinon.fakeServer.create();
    // might want to move this into individual tests
    server.respondWith(
      'GET',
      /foorm\/library_questions\/[0-9]+\/published_forms_appeared_in/,
      [200, {'Content-Type': 'application/json'}, JSON.stringify([])]
    );

    const wrapper = createWrapper();

    store.dispatch(setLibraryQuestionData(sampleExistingLibraryQuestionData));
    store.dispatch(setLibraryData(sampleExistingLibraryData));
    console.log(store.getState().foorm.libraryQuestionId);
    console.log(store.getState().foorm.libraryQuestion);

    server.respondWith([
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleSaveData)
    ]);

    // server.respondWith('PUT', '/foorm/library_questions/0', [
    //   200,
    //   {'Content-Type': 'application/json'},
    //   JSON.stringify(sampleSaveData)
    // ]);

    const saveBar = wrapper.find('FoormLibrarySaveBar');

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    server.respond();
    console.log(saveBar.state().isSaving);
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    //check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  });
  //
  // it('shows save error', () => {
  //   const wrapper = createWrapper();
  //
  //   store.dispatch(setFormData(sampleDraftFormData));
  //
  //   server.respondWith('PUT', `/foorm/forms/0/update_questions`, [
  //     500,
  //     {'Content-Type': 'application/json'},
  //     'Save error'
  //   ]);
  //
  //   const saveBar = wrapper.find('FoormSaveBar');
  //
  //   const saveButton = saveBar.find('button').at(1);
  //   expect(saveButton.contains('Save')).to.be.true;
  //   saveButton.simulate('click');
  //
  //   // check the spinner is showing
  //   expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
  //   expect(saveBar.state().isSaving).to.equal(true);
  //
  //   server.respond();
  //   saveBar.update();
  //
  //   expect(saveBar.find('FontAwesome').length).to.equal(0);
  //   expect(saveBar.state().isSaving).to.equal(false);
  //
  //   //check that save error message is showing
  //   expect(wrapper.find('.saveErrorMessage').length).to.equal(1);
  //   expect(
  //     wrapper.find('.saveErrorMessage').contains('Error Saving: Save error')
  //   ).to.be.true;
  // });
  //
  // it('save published form pops up warning message', () => {
  //   const wrapper = createWrapper();
  //
  //   store.dispatch(setFormData(samplePublishedFormData));
  //   wrapper.update();
  //
  //   const url = '/foorm/forms/1/update_questions';
  //   server.respondWith('PUT', url, [
  //     200,
  //     {'Content-Type': 'application/json'},
  //     JSON.stringify(sampleSaveData)
  //   ]);
  //
  //   const saveBar = wrapper.find('FoormSaveBar');
  //
  //   const saveButton = saveBar.find('button').at(0);
  //   expect(saveButton.contains('Save')).to.be.true;
  //   saveButton.simulate('click');
  //
  //   // check the spinner is showing
  //   expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
  //   expect(saveBar.state().isSaving).to.equal(true);
  //
  //   // check that modal pops up
  //   assert(
  //     wrapper
  //       .find('ConfirmationDialog')
  //       .at(0)
  //       .prop('show'),
  //     'Save ConfirmationDialog is showing'
  //   );
  //
  //   // simulate save click. Cannot click on button itself because it is in the modal
  //   // which is outside the wrapper.
  //   saveBar.instance().save(url);
  //
  //   server.respond();
  //   saveBar.update();
  //
  //   expect(saveBar.find('FontAwesome').length).to.equal(0);
  //   expect(saveBar.state().isSaving).to.equal(false);
  //
  //   //check that last saved message is showing
  //   expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  // });
  //
  // it('hides publish button for published survey', () => {
  //   const wrapper = createWrapper();
  //
  //   store.dispatch(setFormData(samplePublishedFormData));
  //   wrapper.update();
  //
  //   const saveBarButtons = wrapper.find('FoormSaveBar').find('button');
  //   const saveButton = saveBarButtons.at(0);
  //
  //   expect(saveButton.contains('Publish')).to.be.false;
  //   expect(saveButton.contains('Save')).to.be.true;
  //   expect(saveBarButtons.length).to.equal(1);
  // });
  //
  // it('can cancel save published form', () => {
  //   const wrapper = createWrapper();
  //
  //   store.dispatch(setFormData(samplePublishedFormData));
  //   wrapper.update();
  //
  //   const saveBar = wrapper.find('FoormSaveBar');
  //
  //   const saveButton = saveBar.find('button').at(0);
  //   expect(saveButton.contains('Save')).to.be.true;
  //   saveButton.simulate('click');
  //
  //   // check the spinner is showing
  //   expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
  //   expect(saveBar.state().isSaving).to.equal(true);
  //
  //   // check that modal pops up
  //   assert(
  //     wrapper
  //       .find('ConfirmationDialog')
  //       .at(0)
  //       .prop('show'),
  //     'Save ConfirmationDialog is showing'
  //   );
  //
  //   // simulate cancel click. Cannot click on button itself because it is in the modal
  //   // which is outside the wrapper.
  //   saveBar.instance().handleSaveCancel();
  //   saveBar.update();
  //
  //   expect(saveBar.find('FontAwesome').length).to.equal(0);
  //   expect(saveBar.state().isSaving).to.equal(false);
  //
  //   //check that last saved message is not showing
  //   expect(wrapper.find('.lastSavedMessage').length).to.equal(0);
  // });
  //
  // it('can cancel publish form', () => {
  //   const wrapper = createWrapper();
  //
  //   store.dispatch(setFormData(sampleDraftFormData));
  //   wrapper.update();
  //
  //   const saveBar = wrapper.find('FoormSaveBar');
  //
  //   const saveButton = saveBar.find('button').at(0);
  //   expect(saveButton.contains('Publish')).to.be.true;
  //   saveButton.simulate('click');
  //
  //   // check the spinner is showing
  //   expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
  //   expect(saveBar.state().isSaving).to.equal(true);
  //
  //   // check that modal pops up
  //   assert(
  //     wrapper
  //       .find('ConfirmationDialog')
  //       .at(1)
  //       .prop('show'),
  //     'Publish ConfirmationDialog is showing'
  //   );
  //
  //   // simulate cancel click. Cannot click on button itself because it is in the modal
  //   // which is outside the wrapper.
  //   saveBar.instance().handleSaveCancel();
  //   saveBar.update();
  //
  //   expect(saveBar.find('FontAwesome').length).to.equal(0);
  //   expect(saveBar.state().isSaving).to.equal(false);
  //
  //   //check that last saved message is not showing
  //   expect(wrapper.find('.lastSavedMessage').length).to.equal(0);
  // });
  //
  // it('can save new survey', () => {
  //   const wrapper = createWrapper();
  //
  //   store.dispatch(setFormData(sampleNewFormData));
  //   wrapper.update();
  //
  //   server.respondWith('POST', `/foorm/forms`, [
  //     200,
  //     {'Content-Type': 'application/json'},
  //     JSON.stringify(sampleSaveData)
  //   ]);
  //
  //   // expect to see no form name
  //   expect(wrapper.find('FoormEditorHeader').find('h2').length).to.equal(0);
  //
  //   const saveBar = wrapper.find('FoormSaveBar');
  //
  //   // click save button
  //   const saveButton = saveBar.find('button').at(1);
  //   expect(saveButton.contains('Save')).to.be.true;
  //   saveButton.simulate('click');
  //
  //   // check the spinner is showing
  //   expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
  //   expect(saveBar.state().isSaving).to.equal(true);
  //
  //   // check that modal pops up
  //   assert(
  //     wrapper
  //       .find('Modal')
  //       .at(0)
  //       .prop('show'),
  //     'Save New Form Modal is showing'
  //   );
  //
  //   // simulate save click. Cannot click on button itself because it is in the modal
  //   // which is outside the wrapper.
  //   saveBar.instance().saveNewForm();
  //
  //   server.respond();
  //   saveBar.update();
  //
  //   expect(saveBar.find('FontAwesome').length).to.equal(0);
  //   expect(saveBar.state().isSaving).to.equal(false);
  //
  //   // check that last saved message is showing
  //   expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  //
  //   // expect new form name to show up
  //   expect(
  //     wrapper
  //       .find('FoormEditorHeader')
  //       .find('h2')
  //       .contains(sampleSaveData.name)
  //   );
  // });
  //
  // it('can cancel save new survey', () => {
  //   const wrapper = createWrapper();
  //
  //   store.dispatch(setFormData(sampleNewFormData));
  //
  //   // expect to see no form name
  //   expect(wrapper.find('FoormEditorHeader').find('h2').length).to.equal(0);
  //
  //   const saveBar = wrapper.find('FoormSaveBar');
  //
  //   // click save button
  //   const saveButton = saveBar.find('button').at(1);
  //   expect(saveButton.contains('Save')).to.be.true;
  //   saveButton.simulate('click');
  //
  //   // check the spinner is showing
  //   expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
  //   expect(saveBar.state().isSaving).to.equal(true);
  //
  //   // check that modal pops up
  //   assert(
  //     wrapper
  //       .find('Modal')
  //       .at(0)
  //       .prop('show'),
  //     'Save New Form Modal is showing'
  //   );
  //
  //   // simulate cancel click. Cannot click on button itself because it is in the modal
  //   // which is outside the wrapper.
  //   saveBar.instance().handleNewFormSaveCancel();
  //
  //   saveBar.update();
  //
  //   expect(saveBar.find('FontAwesome').length).to.equal(0);
  //   expect(saveBar.state().isSaving).to.equal(false);
  //
  //   // check that last saved message is not showing
  //   expect(wrapper.find('.lastSavedMessage').length).to.equal(0);
  //
  //   // expect no form name
  //   expect(wrapper.find('FoormEditorHeader').find('h2').length).to.equal(0);
  // });
});

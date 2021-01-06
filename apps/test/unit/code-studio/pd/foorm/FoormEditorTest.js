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
import FoormEditor from '../../../../../src/code-studio/pd/foorm/FoormEditor';
import foorm, {
  setFormData
} from '../../../../../src/code-studio/pd/foorm/editor/foormEditorRedux';
import sinon from 'sinon';

global.$ = require('jquery');

describe('FoormEditor', () => {
  let defaultProps, store, server;
  beforeEach(() => {
    stubRedux();
    registerReducers({foorm});

    server = sinon.fakeServer.create();
    server.respondWith('POST', '/api/v1/pd/foorm/form_with_library_items', [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify({})
    ]);

    store = getStore();

    defaultProps = {
      populateCodeMirror: () => {},
      resetCodeMirror: () => {},
      formCategories: ['surveys/pd', 'surveys/teacher']
    };
  });

  afterEach(() => {
    restoreRedux();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <FoormEditor {...combinedProps} />
      </Provider>
    );
  };

  const sampleDraftFormData = {
    questions: {},
    published: false,
    name: 'sample_form_name',
    version: 0,
    id: 0
  };

  const samplePublishedFormData = {
    questions: {},
    published: true,
    name: 'sample_form_name',
    version: 0,
    id: 1
  };

  const sampleNewFormData = {
    questions: {},
    published: null,
    name: null,
    version: null,
    id: null
  };

  const sampleSaveData = {
    id: 1,
    name: 'sample_form_name',
    version: 0,
    questions: '{}',
    published: false
  };

  it('can save draft form', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(sampleDraftFormData));

    server.respondWith('PUT', `/foorm/forms/0/update_questions`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleSaveData)
    ]);

    const saveBar = wrapper.find('FoormSaveBar');

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    server.respond();
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    //check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  });

  it('shows save error', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(sampleDraftFormData));

    server.respondWith('PUT', `/foorm/forms/0/update_questions`, [
      500,
      {'Content-Type': 'application/json'},
      'Save error'
    ]);

    const saveBar = wrapper.find('FoormSaveBar');

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the the spinner is showing
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

  it('save published form pops up warning message', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(samplePublishedFormData));

    server.respondWith('PUT', `/foorm/forms/1/update_questions`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleSaveData)
    ]);

    const saveBar = wrapper.find('FoormSaveBar');

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    // check that modal pops up
    assert(
      wrapper.find('ConfirmationDialog').prop('show'),
      'ConfirmationDialog is showing'
    );

    // simulate save click. Cannot click on button itself because it is in the modal
    // which is outside the wrapper.
    saveBar.instance().save();

    server.respond();
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    //check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  });

  it('can cancel save published form', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(samplePublishedFormData));

    const saveBar = wrapper.find('FoormSaveBar');

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    // check that modal pops up
    assert(
      wrapper.find('ConfirmationDialog').prop('show'),
      'ConfirmationDialog is showing'
    );

    // simulate cancel click. Cannot click on button itself because it is in the modal
    // which is outside the wrapper.
    saveBar.instance().handleSaveCancel();
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    //check that last saved message is not showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(0);
  });

  it('can save new survey', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(sampleNewFormData));

    server.respondWith('POST', `/foorm/forms`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleSaveData)
    ]);

    // expect to see no form name
    expect(wrapper.find('FoormEditorHeader').find('h2').length).to.equal(0);

    const saveBar = wrapper.find('FoormSaveBar');

    // click save button
    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the the spinner is showing
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

    // simulate save click. Cannot click on button itself because it is in the modal
    // which is outside the wrapper.
    saveBar.instance().saveNewForm();

    server.respond();
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    // check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(1);

    // expect new form name to show up
    expect(
      wrapper
        .find('FoormEditorHeader')
        .find('h2')
        .contains(sampleSaveData.name)
    );
  });

  it('can cancel save new survey', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(sampleNewFormData));

    // expect to see no form name
    expect(wrapper.find('FoormEditorHeader').find('h2').length).to.equal(0);

    const saveBar = wrapper.find('FoormSaveBar');

    // click save button
    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the the spinner is showing
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
    saveBar.instance().handleNewFormSaveCancel();

    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    // check that last saved message is not showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(0);

    // expect no form name
    expect(wrapper.find('FoormEditorHeader').find('h2').length).to.equal(0);
  });
});

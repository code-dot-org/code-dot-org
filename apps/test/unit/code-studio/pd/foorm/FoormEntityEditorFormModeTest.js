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
import FoormFormSaveBar, {
  UnconnectedFoormFormSaveBar
} from '@cdo/apps/code-studio/pd/foorm/editor/form/FoormFormSaveBar';
import foorm, {
  setFormData
} from '../../../../../src/code-studio/pd/foorm/editor/foormEditorRedux';
import sinon from 'sinon';

global.$ = require('jquery');

describe('FoormEntityEditor in Form editing mode', () => {
  let defaultProps, store, server;
  beforeEach(() => {
    stubRedux();
    registerReducers({foorm});

    server = sinon.fakeServer.create();
    server.respondWith(
      'POST',
      '/api/v1/pd/foorm/forms/form_with_library_items',
      [200, {'Content-Type': 'application/json'}, JSON.stringify({})]
    );

    store = getStore();

    const HeaderTitle = React.createElement('h1', null, 'A title');
    const SaveBar = React.createElement(FoormFormSaveBar, {
      resetCodeMirror: () => {},
      formCategories: ['surveys/pd', 'surveys/teacher']
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
  });

  afterEach(() => {
    restoreRedux();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <FoormEntityEditor {...combinedProps} />
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

    const saveBar = wrapper.find(UnconnectedFoormFormSaveBar);

    const saveButton = saveBar.find('button').at(1);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    server.respond();
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    //check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  });

  it('can publish form', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(sampleDraftFormData));

    const publishUrl = '/foorm/forms/0/publish';
    server.respondWith('PUT', publishUrl, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleSaveData)
    ]);

    const saveBar = wrapper.find(UnconnectedFoormFormSaveBar);

    const publishButton = saveBar.find('button').at(0);
    expect(publishButton.contains('Publish')).to.be.true;
    publishButton.simulate('click');

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    // check that modal pops up
    assert(
      wrapper
        .find('ConfirmationDialog')
        .at(1)
        .prop('show'),
      'Publish ConfirmationDialog is showing'
    );

    // simulate save click. Cannot click on button itself because it is in the modal
    // which is outside the wrapper.
    saveBar.instance().save(publishUrl);

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

    const saveBar = wrapper.find(UnconnectedFoormFormSaveBar);

    const saveButton = saveBar.find('button').at(1);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

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

  it('save published form pops up warning message', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(samplePublishedFormData));
    wrapper.update();

    const url = '/foorm/forms/1/update_questions';
    server.respondWith('PUT', url, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleSaveData)
    ]);

    const saveBar = wrapper.find(UnconnectedFoormFormSaveBar);

    const saveButton = saveBar.find('button').at(1);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    // check that modal pops up
    assert(
      wrapper
        .find('ConfirmationDialog')
        .at(0)
        .prop('show'),
      'Save ConfirmationDialog is showing'
    );

    // simulate save click. Cannot click on button itself because it is in the modal
    // which is outside the wrapper.
    saveBar.instance().save(url);

    server.respond();
    saveBar.update();

    expect(saveBar.find('FontAwesome').length).to.equal(0);
    expect(saveBar.state().isSaving).to.equal(false);

    //check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  });

  it('shows save as new version button for published survey', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(samplePublishedFormData));
    wrapper.update();

    const saveBarButtons = wrapper
      .find(UnconnectedFoormFormSaveBar)
      .find('button');
    const saveButton1 = saveBarButtons.at(0);
    const saveButton2 = saveBarButtons.at(1);

    expect(saveButton1.contains('Save as New Version')).to.be.true;
    expect(saveButton2.contains('Save')).to.be.true;
    expect(saveBarButtons.length).to.equal(2);
  });

  it('hides publish button for published survey', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(samplePublishedFormData));
    wrapper.update();

    const saveBarButtons = wrapper
      .find(UnconnectedFoormFormSaveBar)
      .find('button');
    const saveButton1 = saveBarButtons.at(0);
    const saveButton2 = saveBarButtons.at(1);

    expect(saveButton1.contains('Publish')).to.be.false;
    expect(saveButton2.contains('Save')).to.be.true;
    expect(saveBarButtons.length).to.equal(2);
  });

  it('can cancel save published form', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(samplePublishedFormData));
    wrapper.update();

    const saveBar = wrapper.find(UnconnectedFoormFormSaveBar);

    const saveButton = saveBar.find('button').at(1);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    // check that modal pops up
    assert(
      wrapper
        .find('ConfirmationDialog')
        .at(0)
        .prop('show'),
      'Save ConfirmationDialog is showing'
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

  it('can cancel publish form', () => {
    const wrapper = createWrapper();

    store.dispatch(setFormData(sampleDraftFormData));
    wrapper.update();

    const saveBar = wrapper.find(UnconnectedFoormFormSaveBar);

    const saveButton = saveBar.find('button').at(0);
    expect(saveButton.contains('Publish')).to.be.true;
    saveButton.simulate('click');

    // check the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(saveBar.state().isSaving).to.equal(true);

    // check that modal pops up
    assert(
      wrapper
        .find('ConfirmationDialog')
        .at(1)
        .prop('show'),
      'Publish ConfirmationDialog is showing'
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
    wrapper.update();

    server.respondWith('POST', `/foorm/forms`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(sampleSaveData)
    ]);

    // expect to see no form name
    expect(wrapper.find('FoormEditorHeader').find('h2').length).to.equal(0);

    const saveBar = wrapper.find(UnconnectedFoormFormSaveBar);

    // click save button
    const saveButton = saveBar.find('button').at(1);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

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

    const saveBar = wrapper.find(UnconnectedFoormFormSaveBar);

    // click save button
    const saveButton = saveBar.find('button').at(1);
    expect(saveButton.contains('Save')).to.be.true;
    saveButton.simulate('click');

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

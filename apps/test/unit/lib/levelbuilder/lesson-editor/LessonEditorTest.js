import React from 'react';
import {mount} from 'enzyme';
import {expect} from '../../../../util/reconfiguredChai';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers
} from '@cdo/apps/redux';
import reducers, {
  init
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import resourcesEditor, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import {sampleActivities, searchOptions} from './activitiesTestData';
import resourceTestData from './resourceTestData';
import {Provider} from 'react-redux';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';

describe('LessonEditor', () => {
  let defaultProps, store;
  beforeEach(() => {
    sinon.stub(utils, 'navigateToHref');
    stubRedux();
    registerReducers({...reducers, resources: resourcesEditor});

    store = getStore();
    store.dispatch(init(sampleActivities, searchOptions));
    store.dispatch(initResources(resourceTestData));
    defaultProps = {
      id: 1,
      initialDisplayName: 'Lesson Name',
      initialOverview: 'Lesson Overview',
      initialStudentOverview: 'Overview of the lesson for students',
      initialUnplugged: false,
      initialLockable: false,
      initialAssessment: false,
      initialCreativeCommonsLicense: 'Creative Commons BY-NC-SA',
      initialPurpose: 'The purpose of the lesson is for people to learn',
      initialPreparation: '- One',
      initialAnnouncements: [],
      relatedLessons: [],
      initialObjectives: [],
      initialAssessmentOpportunities: 'Assessment Opportunities',
      courseVersionId: 1
    };
  });

  afterEach(() => {
    restoreRedux();
    utils.navigateToHref.restore();
  });

  const createWrapper = overrideProps => {
    const combinedProps = {...defaultProps, ...overrideProps};
    return mount(
      <Provider store={store}>
        <LessonEditor {...combinedProps} />
      </Provider>
    );
  };

  it('renders default props', () => {
    const wrapper = createWrapper({});
    expect(wrapper.contains('Lesson Name'), 'Lesson Name').to.be.true;
    expect(wrapper.contains('Lesson Overview'), 'Lesson Overview').to.be.true;
    expect(
      wrapper.contains('Overview of the lesson for students'),
      'student overview'
    ).to.be.true;
    expect(
      wrapper.contains('The purpose of the lesson is for people to learn'),
      'purpose'
    ).to.be.true;
    expect(wrapper.find('Connect(ActivitiesEditor)').length).to.equal(1);
    expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(5);
    expect(wrapper.find('input').length).to.equal(19);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('AnnouncementsEditor').length).to.equal(1);
    expect(wrapper.find('CollapsibleEditorSection').length).to.equal(8);
    expect(wrapper.find('ResourcesEditor').length).to.equal(1);
    expect(wrapper.find('SaveBar').length).to.equal(1);
  });

  it('can add activity', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('Connect(ActivitiesEditor)').length).to.equal(1);
    expect(wrapper.find('Activity').length, 'Activity').to.equal(1);
    expect(wrapper.find('ActivitySection').length, 'ActivitySection').to.equal(
      3
    );
    const button = wrapper.find('.add-activity');
    expect(button.length, 'button').to.equal(1);
    button.simulate('mousedown');
    expect(wrapper.find('Activity', 'Activity').length).to.equal(2);
    expect(wrapper.find('ActivitySection').length, 'ActivitySection').to.equal(
      4
    );
  });

  it('can add activity section', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('Connect(ActivitiesEditor)').length).to.equal(1);
    expect(wrapper.find('Activity').length, 'Activity').to.equal(1);
    expect(wrapper.find('ActivitySection').length, 'ActivitySection').to.equal(
      3
    );
    const button = wrapper.find('.add-activity-section');
    expect(button.length, 'button').to.equal(1);
    button.simulate('mousedown');
    expect(wrapper.find('ActivitySection').length).to.equal(4);
  });

  it('can save and keep editing', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = {updatedAt: '2020-11-06T21:33:32.000Z', activities: []};
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData)
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(0);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(lessonEditor.state().isSaving).to.equal(true);

    server.respond();
    lessonEditor.update();
    expect(utils.navigateToHref).to.not.have.been.called;
    expect(lessonEditor.state().isSaving).to.equal(false);
    expect(lessonEditor.state().lastSaved).to.equal('2020-11-06T21:33:32.000Z');
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
    //check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).to.equal(1);
  });

  it('shows error when save and keep editing has error saving', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = 'There was an error';
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      404,
      {'Content-Type': 'application/json'},
      returnData
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(0);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).to.be
      .true;
    saveAndKeepEditingButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(lessonEditor.state().isSaving).to.equal(true);

    server.respond();
    lessonEditor.update();
    expect(utils.navigateToHref).to.not.have.been.called;
    expect(lessonEditor.state().isSaving).to.equal(false);
    expect(lessonEditor.state().error).to.equal('There was an error');
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
    expect(
      wrapper.find('.saveBar').contains('Error Saving: There was an error')
    ).to.be.true;

    server.restore();
  });

  it('can save and close', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = {updatedAt: '2020-11-06T21:33:32.000Z', activities: []};
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData)
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(1);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(lessonEditor.state().isSaving).to.equal(true);

    server.respond();
    lessonEditor.update();
    expect(utils.navigateToHref).to.have.been.calledWith(
      `/lessons/1${window.location.search}`
    );

    server.restore();
  });

  it('shows error when save and keep editing has error saving', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = 'There was an error';
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      404,
      {'Content-Type': 'application/json'},
      returnData
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(1);
    expect(saveAndCloseButton.contains('Save and Close')).to.be.true;
    saveAndCloseButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(1);
    expect(lessonEditor.state().isSaving).to.equal(true);

    server.respond();

    lessonEditor.update();
    expect(utils.navigateToHref).to.not.have.been.called;

    expect(lessonEditor.state().isSaving).to.equal(false);
    expect(lessonEditor.state().error).to.equal('There was an error');
    expect(wrapper.find('.saveBar').find('FontAwesome').length).to.equal(0);
    expect(
      wrapper.find('.saveBar').contains('Error Saving: There was an error')
    ).to.be.true;

    server.restore();
  });
});

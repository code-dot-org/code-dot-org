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
import createResourcesReducer, {
  initResources
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import vocabulariesEditor, {
  initVocabularies
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import programmingExpressionsEditor, {
  initProgrammingExpressions
} from '@cdo/apps/lib/levelbuilder/lesson-editor/programmingExpressionsEditorRedux';
import createStandardsReducer, {
  initStandards
} from '@cdo/apps/lib/levelbuilder/lesson-editor/standardsEditorRedux';
import {sampleActivities, searchOptions} from './activitiesTestData';
import resourceTestData from './resourceTestData';
import {Provider} from 'react-redux';
import sinon from 'sinon';
import * as utils from '@cdo/apps/utils';
import _ from 'lodash';

describe('LessonEditor', () => {
  let defaultProps, store, clock;
  beforeEach(() => {
    sinon.stub(utils, 'navigateToHref');
    stubRedux();
    registerReducers({
      ...reducers,
      resources: createResourcesReducer('lessonResource'),
      vocabularies: vocabulariesEditor,
      programmingExpressions: programmingExpressionsEditor,
      standards: createStandardsReducer('standard'),
      opportunityStandards: createStandardsReducer('opportunityStandard')
    });

    store = getStore();
    store.dispatch(init(sampleActivities, searchOptions, [], false));
    store.dispatch(initResources(resourceTestData));
    store.dispatch(initVocabularies([]));
    store.dispatch(initProgrammingExpressions([]));
    store.dispatch(initStandards([]));
    defaultProps = {
      relatedLessons: [],
      initialObjectives: [],
      initialLessonData: {
        id: 1,
        name: 'Lesson Name',
        overview: 'Lesson Overview',
        studentOverview: 'Overview of the lesson for students',
        unplugged: false,
        lockable: false,
        hasLessonPlan: true,
        assessment: false,
        creativeCommonsLicense: 'Creative Commons BY-NC-SA',
        purpose: 'The purpose of the lesson is for people to learn',
        preparation: '- One',
        announcements: [],
        assessmentOpportunities: 'Assessment Opportunities',
        courseVersionId: 1,
        scriptPath: '/s/my-script/',
        lessonPath: '/lessons/1',
        scriptIsVisible: false,
        frameworks: []
      }
    };
  });

  afterEach(() => {
    restoreRedux();
    utils.navigateToHref.restore();
    if (clock) {
      clock.restore();
      clock = undefined;
    }
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
    expect(
      wrapper
        .find('input')
        .at(1)
        .props().disabled
    ).to.equal(false);
    expect(
      wrapper
        .find('input')
        .at(2)
        .props().disabled
    ).to.equal(false);
    expect(wrapper.find('AnnouncementsEditor').length).to.equal(1);
    expect(wrapper.find('CollapsibleEditorSection').length).to.equal(12);
    expect(wrapper.find('ResourcesEditor').length).to.equal(1);
    expect(wrapper.find('VocabulariesEditor').length).to.equal(1);
    expect(wrapper.find('ProgrammingExpressionsEditor').length).to.equal(1);
    expect(wrapper.find('StandardsEditor').length).to.equal(2);
    expect(wrapper.find('SaveBar').length).to.equal(1);
  });

  it('disables editing of lockable and has lesson plan for visible script', () => {
    let initialLessonDataCopy = _.cloneDeep(defaultProps.initialLessonData);
    initialLessonDataCopy.scriptIsVisible = true;
    const wrapper = createWrapper({initialLessonData: initialLessonDataCopy});
    expect(
      wrapper
        .find('input')
        .at(1)
        .props().disabled
    ).to.equal(true);
    expect(
      wrapper
        .find('input')
        .at(2)
        .props().disabled
    ).to.equal(true);
  });

  it('renders lesson editor for lesson without lesson plan', () => {
    const wrapper = createWrapper({
      initialLessonData: {
        id: 1,
        name: 'Survey Name',
        overview: 'Survey Overview',
        studentOverview: 'Student survey overview',
        unplugged: false,
        lockable: true,
        hasLessonPlan: false,
        assessment: false,
        creativeCommonsLicense: 'Creative Commons BY-NC-SA',
        purpose: '',
        preparation: '',
        announcements: [],
        assessmentOpportunities: '',
        courseVersionId: 1
      }
    });
    expect(wrapper.contains('Survey Name'), 'Lesson Name').to.be.true;
    expect(wrapper.contains('Survey Overview'), 'Lesson Overview').to.be.true;
    expect(wrapper.contains('Student survey overview'), 'student overview').to
      .be.true;
    expect(wrapper.find('Connect(ActivitiesEditor)').length).to.equal(1);
    expect(wrapper.find('TextareaWithMarkdownPreview').length).to.equal(2);
    expect(wrapper.find('input').length).to.equal(7);
    expect(wrapper.find('select').length).to.equal(1);
    expect(wrapper.find('AnnouncementsEditor').length).to.equal(0);
    expect(wrapper.find('CollapsibleEditorSection').length).to.equal(3);
    expect(wrapper.find('ResourcesEditor').length).to.equal(0);
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

    let returnData = {activities: []};
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

    clock = sinon.useFakeTimers(new Date('2020-12-01'));
    const expectedLastSaved = Date.now();
    server.respond();
    clock.tick(50);

    lessonEditor.update();
    expect(utils.navigateToHref).to.not.have.been.called;
    expect(lessonEditor.state().isSaving).to.equal(false);
    expect(lessonEditor.state().lastSaved).to.equal(expectedLastSaved);
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

  it('can save and close lesson with lesson plan', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = {activities: [], hasLessonPlan: true};
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

  it('can save and close lesson without lesson plan', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = {activities: [], hasLessonPlan: false};
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
    // navigates to the script overview page
    expect(utils.navigateToHref).to.have.been.calledWith(
      `/s/my-script/${window.location.search}`
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

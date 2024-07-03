import {mount} from 'enzyme'; // eslint-disable-line no-restricted-imports
import _ from 'lodash';
import React from 'react';
import {Provider} from 'react-redux';

import reducers, {
  initActivities,
  initLevelSearching,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/activitiesEditorRedux';
import LessonEditor from '@cdo/apps/lib/levelbuilder/lesson-editor/LessonEditor';
import programmingExpressionsEditor, {
  initProgrammingExpressions,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/programmingExpressionsEditorRedux';
import createResourcesReducer, {
  initResources,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/resourcesEditorRedux';
import createStandardsReducer, {
  initStandards,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/standardsEditorRedux';
import vocabulariesEditor, {
  initVocabularies,
} from '@cdo/apps/lib/levelbuilder/lesson-editor/vocabulariesEditorRedux';
import {
  stubRedux,
  restoreRedux,
  getStore,
  registerReducers,
} from '@cdo/apps/redux';
import * as utils from '@cdo/apps/utils';


import {allowConsoleWarnings} from '../../../../util/throwOnConsole';

import {sampleActivities, searchOptions} from './activitiesTestData';
import resourceTestData from './resourceTestData';

describe('LessonEditor', () => {
  // Warnings allowed due to usage of deprecated  componentWillReceiveProps
  // lifecycle method.
  allowConsoleWarnings();

  beforeEach(() => {
    jest.spyOn(utils, 'navigateToHref').mockClear().mockImplementation();
    stubRedux();
    registerReducers({
      ...reducers,
      resources: createResourcesReducer('lessonResource'),
      vocabularies: vocabulariesEditor,
      programmingExpressions: programmingExpressionsEditor,
      standards: createStandardsReducer('standard'),
      opportunityStandards: createStandardsReducer('opportunityStandard'),
    });

    store = getStore();
    store.dispatch(initActivities(sampleActivities));
    store.dispatch(
      initLevelSearching({
        searchOptions: searchOptions,
        programmingEnvironments: [],
      })
    );
    store.dispatch(initResources(resourceTestData));
    store.dispatch(initVocabularies([]));
    store.dispatch(initProgrammingExpressions([]));
    store.dispatch(initStandards([]));
    defaultProps = {
      relatedLessons: [],
      initialObjectives: [],
      unitInfo: {
        allowMajorCurriculumChanges: true,
        courseVersionId: 1,
        unitPath: '/s/my-script/',
        isProfessionalLearningCourse: false,
      },
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
        lessonPath: '/lessons/1',
        frameworks: [],
      },
    };
  });

  afterEach(() => {
    restoreRedux();
    utils.navigateToHref.mockRestore();
    if (clock) {
      jest.useRealTimers();
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
    // Lesson Name
    expect(wrapper.contains('Lesson Name')).toBe(true);
    // Lesson Overview
    expect(wrapper.contains('Lesson Overview')).toBe(true);
    // student overview
    expect(wrapper.contains('Overview of the lesson for students')).toBe(true);
    // purpose
    expect(wrapper.contains('The purpose of the lesson is for people to learn')).toBe(true);
    expect(wrapper.find('Connect(ActivitiesEditor)').length).toBe(1);
    expect(wrapper.find('input').at(1).props().disabled).toBe(false);
    expect(wrapper.find('input').at(2).props().disabled).toBe(false);
    expect(wrapper.find('AnnouncementsEditor').length).toBe(1);
    expect(wrapper.find('CollapsibleEditorSection').length).toBe(12);
    expect(wrapper.find('ResourcesEditor').length).toBe(1);
    expect(wrapper.find('VocabulariesEditor').length).toBe(1);
    expect(wrapper.find('ProgrammingExpressionsEditor').length).toBe(1);
    expect(wrapper.find('StandardsEditor').length).toBe(2);
    expect(wrapper.find('SaveBar').length).toBe(1);
  });

  it('disables editing of lockable and has lesson plan for visible script', () => {
    let unitInfoCopy = _.cloneDeep(defaultProps.unitInfo);
    unitInfoCopy.allowMajorCurriculumChanges = false;
    const wrapper = createWrapper({unitInfo: unitInfoCopy});
    expect(wrapper.find('input').at(1).props().disabled).toBe(true);
    expect(wrapper.find('input').at(2).props().disabled).toBe(true);
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
        courseVersionId: 1,
      },
    });
    // Lesson Name
    expect(wrapper.contains('Survey Name')).toBe(true);
    // Lesson Overview
    expect(wrapper.contains('Survey Overview')).toBe(true);
    // student overview
    expect(wrapper.contains('Student survey overview')).toBe(true);
    expect(wrapper.find('Connect(ActivitiesEditor)').length).toBe(1);
    expect(wrapper.find('TextareaWithMarkdownPreview').length).toBe(2);
    expect(wrapper.find('input').length).toBe(8);
    expect(wrapper.find('select').length).toBe(1);
    expect(wrapper.find('AnnouncementsEditor').length).toBe(0);
    expect(wrapper.find('CollapsibleEditorSection').length).toBe(3);
    expect(wrapper.find('ResourcesEditor').length).toBe(0);
    expect(wrapper.find('SaveBar').length).toBe(1);
  });

  it('can add activity', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('Connect(ActivitiesEditor)').length).toBe(1);
    // Activity
    expect(wrapper.find('Activity').length).toBe(1);
    // ActivitySection
    expect(wrapper.find('ActivitySection').length).toBe(3);
    const button = wrapper.find('.add-activity');
    // button
    expect(button.length).toBe(1);
    button.simulate('mousedown');
    expect(wrapper.find('Activity', 'Activity').length).toBe(2);
    // ActivitySection
    expect(wrapper.find('ActivitySection').length).toBe(4);
  });

  it('can add activity section', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('Connect(ActivitiesEditor)').length).toBe(1);
    // Activity
    expect(wrapper.find('Activity').length).toBe(1);
    // ActivitySection
    expect(wrapper.find('ActivitySection').length).toBe(3);
    const button = wrapper.find('.add-activity-section');
    // button
    expect(button.length).toBe(1);
    button.simulate('mousedown');
    expect(wrapper.find('ActivitySection').length).toBe(4);
  });

  it('can save and keep editing', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = {activities: []};
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData),
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(1);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
    saveAndKeepEditingButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
    expect(lessonEditor.state().isSaving).toBe(true);

    jest.useFakeTimers().setSystemTime(new Date('2020-12-01'));
    const expectedLastSaved = Date.now();
    server.respond();
    jest.advanceTimersByTime(50);

    lessonEditor.update();
    expect(utils.navigateToHref).not.toHaveBeenCalled();
    expect(lessonEditor.state().isSaving).toBe(false);
    expect(lessonEditor.state().lastSaved).toBe(expectedLastSaved);
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(0);
    //check that last saved message is showing
    expect(wrapper.find('.lastSavedMessage').length).toBe(1);
    server.mockRestore();
  });

  it('shows error when save and keep editing has error saving', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = 'There was an error';
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      404,
      {'Content-Type': 'application/json'},
      returnData,
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndKeepEditingButton = saveBar.find('button').at(1);
    expect(saveAndKeepEditingButton.contains('Save and Keep Editing')).toBe(true);
    saveAndKeepEditingButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
    expect(lessonEditor.state().isSaving).toBe(true);

    server.respond();
    lessonEditor.update();
    expect(utils.navigateToHref).not.toHaveBeenCalled();
    expect(lessonEditor.state().isSaving).toBe(false);
    expect(lessonEditor.state().error).toBe('There was an error');
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(0);
    expect(
      wrapper.find('.saveBar').contains('Error Saving: There was an error')
    ).toBe(true);

    server.mockRestore();
  });

  it('can save and close lesson with lesson plan', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = {activities: [], hasLessonPlan: true};
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData),
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
    saveAndCloseButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
    expect(lessonEditor.state().isSaving).toBe(true);

    server.respond();
    lessonEditor.update();
    expect(utils.navigateToHref).toHaveBeenCalledWith(`/lessons/1${window.location.search}`);

    server.mockRestore();
  });

  it('can save and close lesson without lesson plan', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = {activities: [], hasLessonPlan: false};
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      200,
      {'Content-Type': 'application/json'},
      JSON.stringify(returnData),
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
    saveAndCloseButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
    expect(lessonEditor.state().isSaving).toBe(true);

    server.respond();
    lessonEditor.update();
    // navigates to the script overview page
    expect(utils.navigateToHref).toHaveBeenCalledWith(`/s/my-script/${window.location.search}`);

    server.mockRestore();
  });

  it('shows error when save and keep editing has error saving', () => {
    const wrapper = createWrapper({});
    const lessonEditor = wrapper.find('LessonEditor');

    let returnData = 'There was an error';
    let server = sinon.fakeServer.create();
    server.respondWith('PUT', `/lessons/1`, [
      404,
      {'Content-Type': 'application/json'},
      returnData,
    ]);

    const saveBar = wrapper.find('SaveBar');

    const saveAndCloseButton = saveBar.find('button').at(2);
    expect(saveAndCloseButton.contains('Save and Close')).toBe(true);
    saveAndCloseButton.simulate('click');

    // check the the spinner is showing
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(1);
    expect(lessonEditor.state().isSaving).toBe(true);

    server.respond();

    lessonEditor.update();
    expect(utils.navigateToHref).not.toHaveBeenCalled();

    expect(lessonEditor.state().isSaving).toBe(false);
    expect(lessonEditor.state().error).toBe('There was an error');
    expect(wrapper.find('.saveBar').find('FontAwesome').length).toBe(0);
    expect(
      wrapper.find('.saveBar').contains('Error Saving: There was an error')
    ).toBe(true);

    server.mockRestore();
  });

  it('should render "Add Rubric" button when hasRubric prop is false', () => {
    const wrapper = createWrapper({});
    expect(wrapper.find('.btn.add-rubric').text()).toContain('Add Rubric');
    expect(wrapper.find('.btn.add-rubric').props().href).toBe('/rubrics/new?lessonId=1');
  });

  it('should render "Edit Rubric" button when hasRubric prop is true', () => {
    const wrapper = createWrapper({rubricId: 9});
    expect(wrapper.find('.btn.add-rubric').text()).toContain('Edit Rubric');
    expect(wrapper.find('.btn.add-rubric').props().href).toBe('/rubrics/9/edit');
  });
});
